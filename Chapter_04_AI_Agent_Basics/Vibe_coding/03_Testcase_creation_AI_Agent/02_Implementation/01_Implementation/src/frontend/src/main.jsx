import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { marked } from "marked";
import DOMPurify from "dompurify";
import "./styles.css";

async function api(url, options) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || `Request failed (${response.status}).`);
    error.data = data;
    throw error;
  }
  return data;
}

function renderMarkdown(markdown) {
  const preservedPlaceholders = markdown.replace(/<([a-z][\w-]*)>/gi, (tag, name) => name.toLowerCase() === "br" ? tag : `\`${tag}\``);
  return DOMPurify.sanitize(marked.parse(preservedPlaceholders));
}

function App() {
  const [page, setPage] = useState("main");
  return (
    <div className="shell">
      <header>
        <h1>Test Case Generator</h1>
        <nav>
          <button className={page === "main" ? "active" : ""} onClick={() => setPage("main")}>Main</button>
          <button className={page === "settings" ? "active" : ""} onClick={() => setPage("settings")}>Settings</button>
        </nav>
      </header>
      {page === "main" ? <MainPage /> : <SettingsPage />}
    </div>
  );
}

function MainPage() {
  const [issueId, setIssueId] = useState("");
  const [requirements, setRequirements] = useState("");
  const [testType, setTestType] = useState("Mixed");
  const [priority, setPriority] = useState("Mixed");
  const [count, setCount] = useState(10);
  const [output, setOutput] = useState("");
  const [jiraIssue, setJiraIssue] = useState(null);
  const [createdIssues, setCreatedIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [requirementFile, setRequirementFile] = useState("");

  async function generate(event) {
    event.preventDefault();
    if (loading) return;
    setLoading(true); setError("");
    try {
      const data = await api("/api/test-cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueId, requirements, testType, priority, count })
      });
      setOutput(data.output);
      setJiraIssue(data.jiraIssue);
      setCreatedIssues([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function uploadRequirements(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    try {
      setRequirementFile(file.name);
      setRequirements(await file.text());
    } catch (err) {
      setError(`Could not read the selected file: ${err.message}`);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(output);
      setError("Test cases copied.");
    } catch {
      setError("Could not copy the test cases. Select and copy the output instead.");
    }
  }

  function download() {
    const blob = new Blob([output], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = "test-cases.md"; link.click();
    URL.revokeObjectURL(url);
  }

  async function createInJira() {
    if (!issueId.trim()) {
      setError("Enter a Jira issue ID before creating Jira issues.");
      return;
    }
    if (!window.confirm("Create Jira issues from the generated test cases?")) return;
    setLoading(true); setError("");
    try {
      const data = await api("/api/jira/create-test-cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueId, output, confirmed: true })
      });
      setCreatedIssues(data.created);
      setError(`Created Jira issues: ${data.created.map((item) => item.key).join(", ")}`);
    } catch (err) {
      if (err.data?.created) setCreatedIssues(err.data.created);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="layout">
      <section className="card form-card">
        <form onSubmit={generate}>
          <label>Jira Issue ID <input value={issueId} onChange={(e) => setIssueId(e.target.value)} placeholder="KAN-14" /></label>
          <label>Requirements / Acceptance Criteria
            <textarea value={requirements} onChange={(e) => setRequirements(e.target.value)} placeholder="Enter requirements..." />
          </label>
          <label>Upload Requirements
            <input type="file" accept=".txt,.md,.csv" onChange={uploadRequirements} />
          </label>
          {requirementFile && <small>Loaded: {requirementFile}</small>}
          <div className="controls">
            <label>Test Type
              <select value={testType} onChange={(e) => setTestType(e.target.value)}>
                <option value="Mixed">Mixed (choose per case)</option><option>Positive</option><option>Negative</option><option>Boundary / Validation</option><option>Edge</option>
              </select>
            </label>
            <label>Priority
              <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="Mixed">Mixed (choose per case)</option><option>High</option><option>Medium</option><option>Low</option>
              </select>
            </label>
            <label>Count
              <input type="number" min="1" max="50" value={count} onChange={(e) => setCount(Number(e.target.value))} />
            </label>
          </div>
          <button type="submit" disabled={loading}>{loading ? "Generating..." : "Generate Test Cases"}</button>
        </form>
        {error && <div className="status" role="alert">{error}</div>}
      </section>
      <section className="card result-card">
        {output ? (
          <>
            <div className="actions">
              <button onClick={copy}>Copy</button>
              <button onClick={download}>Download Markdown</button>
              <button onClick={createInJira} disabled={loading}>Create in Jira</button>
            </div>
            {jiraIssue && <p className="source">Source: <a href={jiraIssue.url} target="_blank" rel="noreferrer">{jiraIssue.key}</a></p>}
            <article dangerouslySetInnerHTML={{ __html: renderMarkdown(output) }} />
            {createdIssues.length > 0 && <p className="created">Created: {createdIssues.map((item) => <a key={item.key} href={item.url} target="_blank" rel="noreferrer">{item.key}</a>)}</p>}
          </>
        ) : <p className="empty">Generated test cases will appear here.</p>}
      </section>
    </main>
  );
}

function SettingsPage() {
  const [fields, setFields] = useState({ JIRA_BASE_URL: "", JIRA_EMAIL: "", JIRA_TOKEN: "", GROQ_API_KEY: "" });
  const [status, setStatus] = useState(""); const [busy, setBusy] = useState("");

  useEffect(() => { api("/api/settings").then(setFields).catch((err) => setStatus(err.message)); }, []);

  async function save() {
    setBusy("save"); setStatus("");
    try {
      const payload = Object.fromEntries(Object.entries(fields).filter(([, value]) => value && value !== "********"));
      const data = await api("/api/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      setStatus(data.message);
      setFields((current) => Object.fromEntries(Object.entries(current).map(([key, value]) => [key, value ? "********" : ""])));
    } catch (err) { setStatus(err.message); } finally { setBusy(""); }
  }

  async function test(url, label) {
    setBusy(label); setStatus("");
    try { await api(url, { method: "POST" }); setStatus(`${label} connection successful.`); }
    catch (err) { setStatus(err.message); } finally { setBusy(""); }
  }

  function field(key, label, type = "text") {
    return <label className="field"><span>{label}</span><input type={type} value={fields[key]} onChange={(e) => setFields((cur) => ({ ...cur, [key]: e.target.value }))} /></label>;
  }

  return (
    <main className="settings-layout">
      <section className="card settings-card">
        <h2>Jira Connection</h2>
        {field("JIRA_BASE_URL", "Jira Host / URI")}
        {field("JIRA_EMAIL", "Login Email")}
        {field("JIRA_TOKEN", "API Token", "password")}
        <button disabled={!!busy} onClick={() => test("/api/jira/test", "Jira")}>Test Jira Connection</button>
      </section>
      <section className="card settings-card">
        <h2>LLM Configuration</h2>
        {field("GROQ_API_KEY", "Groq API Key", "password")}
        <button disabled={!!busy} onClick={() => test("/api/groq/test", "Groq")}>Test Groq Connection</button>
      </section>
      <div className="settings-actions">
        <button className="save" onClick={save} disabled={!!busy}>{busy === "save" ? "Saving..." : "Save Settings"}</button>
        {status && <div className="status">{status}</div>}
      </div>
    </main>
  );
}

const root = createRoot(document.getElementById("root"));
root.render(<App />);
if (import.meta.hot) import.meta.hot.dispose(() => root.unmount());
