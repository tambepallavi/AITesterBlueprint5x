const h = React.createElement;

async function api(url, options) {
  const response = await fetch(url, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status}).`);
  return data;
}

function App() {
  const [page, setPage] = React.useState("main");
  return h("div", { className: "shell" },
    h("header", null,
      h("h1", null, "AI Test Plan Generator"),
      h("nav", null,
        h("button", { className: page === "main" ? "active" : "", onClick: () => setPage("main") }, "Main"),
        h("button", { className: page === "settings" ? "active" : "", onClick: () => setPage("settings") }, "Settings")
      )
    ),
    page === "main" ? h(MainPage) : h(SettingsPage)
  );
}

function MainPage() {
  const [issueId, setIssueId] = React.useState("");
  const [plan, setPlan] = React.useState("");
  const [reference, setReference] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  async function submit(event) {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    setPlan("");
    try {
      const data = await api("http://localhost:3001/api/test-plans", {
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

  return h("main", { className: "main-layout" },
    h("section", { className: "generator card" },
      h("form", { onSubmit: submit },
        h("label", { htmlFor: "issueId" }, "Jira issue ID"),
        h("input", {
          id: "issueId", value: issueId,
          onChange: (event) => setIssueId(event.target.value),
          placeholder: "QA-123", disabled: loading
        }),
        h("button", { type: "submit", disabled: loading }, loading ? "Generating..." : "Generate test plan")
      ),
      error ? h("div", { className: "status error", role: "alert" }, error) : null,
      loading ? h("div", { className: "status" }, "Retrieving Jira issue and generating plan...") : null
    ),
    h("section", { className: "result card" },
      plan
        ? h(React.Fragment, null,
            h("p", { className: "source" }, reference),
            h("article", { dangerouslySetInnerHTML: { __html: marked.parse(plan) } })
          )
        : h("p", { className: "empty" }, "Enter a Jira issue ID to generate a test plan.")
    )
  );
}

function SettingsPage() {
  const [fields, setFields] = React.useState({
    JIRA_BASE_URL: "", JIRA_EMAIL: "", JIRA_API_TOKEN: "", GROQ_API_KEY: ""
  });
  const [status, setStatus] = React.useState("");
  const [busy, setBusy] = React.useState("");
  const apiRoot = "http://localhost:3001";

  React.useEffect(() => {
    api(`${apiRoot}/api/settings`).then(setFields).catch(() => {});
  }, []);

  async function save() {
    setBusy("save");
    setStatus("");
    try {
      const payload = {};
      Object.entries(fields).forEach(([key, value]) => {
        if (value && value !== "********") payload[key] = value;
      });
      await api(`${apiRoot}/api/settings`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
      });
      setStatus("Settings saved.");
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
      await api(`${apiRoot}${url}`, { method: "POST" });
      setStatus(`${label} connection successful.`);
    } catch (err) {
      setStatus(err.message);
    } finally {
      setBusy("");
    }
  }

  function field(key, label, type = "text") {
    return h("label", { className: "field" },
      h("span", null, label),
      h("input", {
        type,
        value: fields[key],
        placeholder: fields[key] === "********" ? "Configured" : "",
        onChange: (event) => setFields((current) => ({ ...current, [key]: event.target.value }))
      })
    );
  }

  return h("main", { className: "settings-layout" },
    h("section", { className: "settings-card card" },
      h("h2", null, "Jira Connection"),
      field("JIRA_BASE_URL", "Base URL"),
      field("JIRA_EMAIL", "Email"),
      field("JIRA_API_TOKEN", "API Token", "password"),
      h("button", { disabled: !!busy, onClick: () => test("/api/jira/test", "Jira") }, "Test Connection")
    ),
    h("section", { className: "settings-card card" },
      h("h2", null, "LLM Configuration"),
      field("GROQ_API_KEY", "Groq API Key", "password"),
      h("button", { disabled: !!busy, onClick: () => test("/api/groq/test", "Groq") }, "Test Groq.com")
    ),
    h("div", { className: "settings-actions" },
      h("button", { className: "save", onClick: save, disabled: !!busy }, busy === "save" ? "Saving..." : "Save Settings"),
      status ? h("div", {
        className: status.includes("successful") || status === "Settings saved." ? "status" : "status error"
      }, status) : null
    )
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(h(App));
