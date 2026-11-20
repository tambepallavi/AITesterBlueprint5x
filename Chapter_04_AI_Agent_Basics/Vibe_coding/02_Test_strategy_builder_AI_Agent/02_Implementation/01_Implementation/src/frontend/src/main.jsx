import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
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
        <h1>Test Strategy Builder</h1>
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
  const [output, setOutput] = useState("");
  const [sourceIssue, setSourceIssue] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function generate(event) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setMessage("");
    try {
      const data = await api("/api/strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueId })
      });
      setOutput(data.output);
      setSourceIssue(data.issue);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(output);
      setMessage("Strategy copied.");
    } catch {
      setMessage("Could not copy the strategy. Select and copy the text instead.");
    }
  }

  function download() {
    const url = URL.createObjectURL(new Blob([output], { type: "text/markdown;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${sourceIssue?.key || "test-strategy"}.md`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="layout">
      <section className="card form-card">
        <form onSubmit={generate}>
          <label htmlFor="issueId">Jira Issue ID</label>
          <input
            id="issueId"
            value={issueId}
            onChange={(event) => setIssueId(event.target.value)}
            placeholder="KAN-12"
            required
          />
          <p>Retrieve the issue requirements from Jira and generate a test strategy.</p>
          <button type="submit" disabled={loading}>{loading ? "Generating..." : "Generate Strategy"}</button>
        </form>
        {message && <div className="status" role="status">{message}</div>}
      </section>
      <section className="card result-card" aria-live="polite">
        {output ? (
          <>
            <div className="actions">
              <button onClick={copy}>Copy</button>
              <button onClick={download}>Download Markdown</button>
            </div>
            {sourceIssue && <p className="source">Source: <a href={sourceIssue.url} target="_blank" rel="noreferrer">{sourceIssue.key}</a></p>}
            <pre className="strategy">{output}</pre>
          </>
        ) : <p className="empty">{loading ? "Loading Jira issue and generating strategy..." : "Generated test strategy will appear here."}</p>}
      </section>
    </main>
  );
}

function SettingsPage() {
  const [fields, setFields] = useState({ JIRA_BASE_URL: "", JIRA_EMAIL: "", JIRA_TOKEN: "", GROQ_API_KEY: "" });
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState("");

  useEffect(() => {
    api("/api/settings").then(setFields).catch((error) => setStatus(error.message));
  }, []);

  async function save() {
    setBusy("save");
    setStatus("");
    try {
      const payload = Object.fromEntries(Object.entries(fields).filter(([, value]) => value && value !== "********"));
      const data = await api("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      setStatus(data.message);
      setFields((current) => Object.fromEntries(Object.entries(current).map(([key, value]) => [key, value ? "********" : ""])));
    } catch (error) {
      setStatus(error.message);
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
    } catch (error) {
      setStatus(error.message);
    } finally {
      setBusy("");
    }
  }

  function field(key, label, type = "text") {
    return (
      <label className="field" htmlFor={key}>
        <span>{label}</span>
        <input
          id={key}
          type={type}
          autoComplete="off"
          value={fields[key]}
          placeholder={fields[key] === "********" ? "Configured" : ""}
          onChange={(event) => setFields((current) => ({ ...current, [key]: event.target.value }))}
        />
      </label>
    );
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
        <h2>AI Configuration</h2>
        {field("GROQ_API_KEY", "Groq API Key", "password")}
        <button disabled={!!busy} onClick={() => test("/api/groq/test", "Groq")}>Test Groq Connection</button>
      </section>
      <div className="settings-actions">
        <button className="save" onClick={save} disabled={!!busy}>Save Settings</button>
        {status && <div className="status" role="status">{status}</div>}
      </div>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
