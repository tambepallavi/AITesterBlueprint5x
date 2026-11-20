import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const implementationDir = path.resolve(__dirname, "../..");
const envCandidates = [
  path.join(implementationDir, ".env"),
  path.resolve(implementationDir, "../../.env"),
  path.resolve(implementationDir, "../../../../.env"),
  path.resolve(implementationDir, "../../../.env"),
  path.resolve(implementationDir, "../../../..", ".env")
];
for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const missing = (value) => !value || !value.trim();

function jiraConfig() {
  return {
    baseUrl: process.env.JIRA_BASE_URL?.trim(),
    email: process.env.JIRA_EMAIL?.trim(),
    token: (process.env.JIRA_API_TOKEN || process.env.JIRA_TOKEN || process.env.JIRA_Password)?.trim()
  };
}

function getTemplate() {
  const templatePaths = [
    path.resolve(__dirname, "../../../../01_Plan/Testplan_template.md"),
    path.resolve(implementationDir, "Testplan_template.md")
  ];
  for (const templatePath of templatePaths) {
    if (fs.existsSync(templatePath)) return fs.readFileSync(templatePath, "utf8");
  }
  return `# Test Plan — <JIRA-KEY>: <title>\n\nTemplate file was not found.`;
}

function adfText(value) {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return "";
  if (Array.isArray(value)) return value.map(adfText).filter(Boolean).join("\n");
  const parts = [];
  if (typeof value.text === "string") parts.push(value.text);
  if (Array.isArray(value.content)) parts.push(adfText(value.content));
  return parts.filter(Boolean).join("\n");
}

function issueText(fields, names) {
  for (const name of names) {
    if (fields[name]) return adfText(fields[name]).trim();
  }
  return "";
}

async function groqGenerate(issue, sourceDescription) {
  const key = process.env.GROQ_API_KEY?.trim();
  if (!key) throw new Error("GROQ_API_KEY is not configured.");
  const template = getTemplate();
  const prompt = `Using only the supplied Jira issue and this template, create a test plan.
Return Markdown exactly following the template section names and order.
Mark missing details exactly as "Insufficient information to determine."
Label proposed testing activities as proposals.
Do not invent requirements or acceptance criteria.

Template:
${template}

Jira issue:
Key: ${issue.key}
Summary: ${issue.fields.summary || "Insufficient information to determine."}
Description:
${sourceDescription || "Insufficient information to determine."}
Issue Type: ${issue.fields.issuetype?.name || "Insufficient information to determine."}
Status: ${issue.fields.status?.name || "Insufficient information to determine."}
Priority: ${issue.fields.priority?.name || "Insufficient information to determine."}`;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "openai/gpt-oss-20b",
      temperature: 0,
      messages: [
        { role: "system", content: "You are a precise QA test-plan generator. Never invent details." },
        { role: "user", content: prompt }
      ]
    })
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(response.status === 401
      ? "Groq authentication failed."
      : `Groq generation failed (${response.status}).`);
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.content?.trim();
}

app.get("/api/health", (_req, res) => {
  const jira = jiraConfig();
  res.json({
    jiraConfigured: !missing(jira.baseUrl) && !missing(jira.email) && !missing(jira.token),
    groqConfigured: !!process.env.GROQ_API_KEY,
    ollamaConfigured: !!process.env.OLLAMA_BASE_URL
  });
});

app.post("/api/jira/test", async (_req, res) => {
  const { baseUrl, email, token } = jiraConfig();
  if (missing(baseUrl) || missing(email) || missing(token)) {
    return res.status(400).json({ error: "Jira configuration is incomplete." });
  }
  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/rest/api/3/myself`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${email}:${token}`).toString("base64")}`,
        Accept: "application/json"
      }
    });
    if (!response.ok) throw new Error(response.status === 401 || response.status === 403
      ? "Jira authentication or permission failed."
      : `Jira returned HTTP ${response.status}.`);
    res.json({ ok: true });
  } catch (error) {
    res.status(502).json({ error: error.message || "Could not reach Jira." });
  }
});

app.post("/api/groq/test", async (_req, res) => {
  if (!process.env.GROQ_API_KEY) return res.status(400).json({ error: "Groq API key is not configured." });
  try {
    const response = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` }
    });
    if (!response.ok) throw new Error(response.status === 401
      ? "Groq authentication failed."
      : `Groq returned HTTP ${response.status}.`);
    res.json({ ok: true });
  } catch (error) {
    res.status(502).json({ error: error.message || "Could not reach Groq." });
  }
});

app.post("/api/ollama/test", async (_req, res) => {
  const baseUrl = process.env.OLLAMA_BASE_URL?.trim();
  if (!baseUrl) return res.status(400).json({ error: "Ollama base URL is not configured." });
  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/tags`);
    if (!response.ok) throw new Error(`Ollama returned HTTP ${response.status}.`);
    res.json({ ok: true });
  } catch (error) {
    res.status(502).json({ error: error.message || "Could not reach Ollama." });
  }
});

app.post("/api/test-plans", async (req, res) => {
  const issueId = String(req.body.issueId || "").trim().toUpperCase();
  if (!/^[A-Z][A-Z0-9]*-[1-9][0-9]*$/.test(issueId)) {
    return res.status(400).json({ error: "Enter a valid Jira issue ID, for example QA-123." });
  }
  const { baseUrl, email, token } = jiraConfig();
  if (missing(baseUrl) || missing(email) || missing(token)) {
    return res.status(400).json({ error: "Jira configuration is incomplete. Open Settings." });
  }
  try {
    const jiraUrl = `${baseUrl.replace(/\/$/, "")}/rest/api/3/issue/${encodeURIComponent(issueId)}?fields=summary,description,issuetype,status,priority,labels,components,assignee`;
    const response = await fetch(jiraUrl, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${email}:${token}`).toString("base64")}`,
        Accept: "application/json"
      }
    });
    if (response.status === 404) return res.status(404).json({ error: "Jira issue was not found." });
    if (response.status === 401 || response.status === 403) {
      return res.status(response.status).json({ error: "Jira authentication or permission failed." });
    }
    if (!response.ok) return res.status(502).json({ error: `Jira returned HTTP ${response.status}.` });

    const issue = await response.json();
    const description = adfText(issue.fields.description).trim();
    const acceptanceCriteria = issueText(issue.fields, ["acceptanceCriteria", "customfield_10000"]);
    const sourceDescription = [description, acceptanceCriteria ? `Acceptance Criteria:\n${acceptanceCriteria}` : ""]
      .filter(Boolean).join("\n\n");
    const plan = await groqGenerate(issue, sourceDescription);
    if (!plan) return res.status(502).json({ error: "The AI provider returned an empty test plan." });
    res.json({ issueKey: issue.key, title: issue.fields.summary || "", plan });
  } catch (error) {
    const message = error?.message || "Unable to generate the test plan.";
    res.status(502).json({ error: message });
  }
});

app.post("/api/settings", (req, res) => {
  const allowed = ["JIRA_BASE_URL", "JIRA_EMAIL", "JIRA_API_TOKEN", "OLLAMA_BASE_URL", "GROQ_API_KEY"];
  const envPath = path.join(implementationDir, ".env");
  const saved = {};
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const match = line.match(/^([^=]+)=\s*(.*)$/);
      if (match) saved[match[1].trim()] = match[2].trim();
    }
  }
  let supplied = false;
  for (const key of allowed) {
    const value = typeof req.body[key] === "string" ? req.body[key].trim() : "";
    if (value) {
      supplied = true;
      saved[key] = value;
      process.env[key] = value;
    }
  }
  if (!supplied) return res.status(400).json({ error: "No settings supplied." });
  fs.writeFileSync(envPath, `${allowed
    .filter((key) => saved[key])
    .map((key) => `${key}=${saved[key]}`)
    .join("\n")}\n`, { mode: 0o600 });
  res.json({ ok: true });
});

app.get("/api/settings", (_req, res) => {
  res.json({
    JIRA_BASE_URL: process.env.JIRA_BASE_URL ? "********" : "",
    JIRA_EMAIL: process.env.JIRA_EMAIL ? "********" : "",
    JIRA_API_TOKEN: (process.env.JIRA_API_TOKEN || process.env.JIRA_Password) ? "********" : "",
    OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL ? "********" : "",
    GROQ_API_KEY: process.env.GROQ_API_KEY ? "********" : ""
  });
});

const port = Number(process.env.PORT || 3001);
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  app.listen(port, () => console.log(`Backend listening on http://localhost:${port}`));
}

export default app;
