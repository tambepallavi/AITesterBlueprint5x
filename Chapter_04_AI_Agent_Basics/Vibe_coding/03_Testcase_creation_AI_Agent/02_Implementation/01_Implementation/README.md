# Test Case Generator

```powershell
npm run install:all
npm run dev
```

Open http://localhost:5175.

The backend reads `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_TOKEN`, and `GROQ_API_KEY` from the existing `.env` in the parent `Chapter_04_AI_Agent_Basics` folder. Settings changes apply for the current run; edit that parent file for persistent changes. Never copy secrets into this folder.

Enter requirements or a Jira issue ID, choose test type, priority, and case count, then generate. Review before optionally creating Jira issues.
