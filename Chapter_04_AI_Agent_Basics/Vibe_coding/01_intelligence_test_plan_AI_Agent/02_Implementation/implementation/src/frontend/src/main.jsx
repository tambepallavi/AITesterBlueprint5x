import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { marked } from "marked";
import "./styles.css";

async function api(url, options) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status}).`);
  return data;
}

function App() {
  const [page, setPage] = useState("main");
  return (
    <div className="shell">
      <header>
        <h1>AI Test Plan Generator</h1>
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
  const [plan, setPlan] = useState("");
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    setPlan("");
    try {
      const data = await api("/api/test-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueId })
      });
      setPlan(data.plan);
      setReference(`${data.issueKey}: ${data.title}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="main-layout">
      <section className="generator card">
        <form onSubmit={submit}>
          <label htmlFor="issueId">Jira issue ID</label>
          <input
            id="issueId"
            value={issueId}
            onChange={(event) => setIssueId(event.target.value)}
            placeholder="QA-123"
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Generating..." : "Generate test plan"}
          </button>
        </form>
        {error && <div className="status error" role="alert">{error}</div>}
        {loading && <div className="status">Retrieving Jira issue and generating plan...</div>}
      </section>
      <section className="result card">
        {plan ? (
          <>
            <p className="source">{reference}</p>
            <article dangerouslySetInnerHTML={{ __html: marked.parse(plan) }} />
          </>
        ) : (
          <p className="empty">Enter a Jira issue ID to generate a test plan.</p>
        )}
      </section>
    </main>
  );
}

function SettingsPage() {
  const [fields, setFields] = useState({
    JIRA_BASE_URL: "", JIRA_EMAIL: "", JIRA_API_TOKEN: "", OLLAMA_BASE_URL: "", GROQ_API_KEY: ""
  });
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState("");

  useEffect(() => {
    api("/api/settings").then((data) => setFields(data)).catch(() => {});
  }, []);

  async function save(event) {
    event?.preventDefault();
    setBusy("save");
    setStatus("");
    try {
      const payload = {};
      for (const [key, value] of Object.entries(fields)) {
        if (value && value !== "********") payload[key] = value;
      }
      await api("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      setStatus("Settings saved.");
      setFields((current) => Object.fromEntries(Object.keys(current).map((key) => [
        key,
        current[key] && current[key] !== "********" ? "********" : current[key]
      ])));
    } catch (err) {
      setStatus(err.message);
    } finally {
      setBusy("");
    }
  }

  async function test(url, label) {
    setBusy(label);
    setStatus("");
    try {
      await api(url, { method: "POST" });
      setStatus(`${label} connection successful.`);
    } catch (err) {
      setStatus(err.message);
    } finally {
      setBusy("");
    }
  }

  function field(key, label, type = "text") {
    return (
      <label className="field">
        <span>{label}</span>
        <input
          type={type}
          value={fields[key]}
          placeholder={fields[key] === "********" ? "Configured" : ""}
          onChange={(event) => setFields((current) => ({ ...current, [key]: event.target.value }))}
        />
      </label>
    );
  }

  return (
    <main className="settings-layout">
      <section className="settings-card card">
        <h2>Jira Connection</h2>
        {field("JIRA_BASE_URL", "Base URL")}
        {field("JIRA_EMAIL", "Email")}
        {field("JIRA_API_TOKEN", "API Token", "password")}
        <button disabled={!!busy} onClick={() => test("/api/jira/test", "Jira")}>Test Connection</button>
      </section>
      <section className="settings-card card">
        <h2>LLM Configuration</h2>
        {field("OLLAMA_BASE_URL", "Ollama Base URL")}
        <button disabled={!!busy} onClick={() => test("/api/ollama/test", "Ollama")}>Test Ollama</button>
        {field("GROQ_API_KEY", "Groq API Key", "password")}
        <button disabled={!!busy} onClick={() => test("/api/groq/test", "Groq")}>Test Groq</button>
      </section>
      <div className="settings-actions">
        <button className="save" onClick={save} disabled={!!busy}>{busy === "save" ? "Saving..." : "Save Settings"}</button>
        {status && <div className={status.includes("successful") || status === "Settings saved." ? "status" : "status error"}>{status}</div>}
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
