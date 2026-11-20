# Test Strategy Builder

## Run

```powershell
npm run install:all
npm run dev
```

Open http://localhost:5173. The backend runs on port 3001.

## Configuration

The backend reads `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_TOKEN`, and `GROQ_API_KEY` from the existing `.env` file in the parent `Chapter_04_AI_Agent_Basics` folder. Do not copy secrets into this folder. `.env.example` contains placeholders only.

The requested `config.md` was not present. The Jira and Groq settings page can test connections; changes entered there apply only until the backend restarts.

## Use and limitations

Enter a Jira issue key and generate a strategy. Jira issue content is read-only. The supplied test strategy template is required for generation. UI design assets were not present, so the interface is minimal.
