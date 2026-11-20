# Jira Test Plan Generator

Simple React + Express application for generating a test plan from a Jira issue.

## Prerequisites
- Node.js 20 or newer
- Jira Cloud URL, Jira account email, and API token
- Groq API key

The backend searches for `.env` in `implementation`, the project parent, and the Chapter_04 parent folder. The supplied parent `.env` is read server-side.

## Setup
```powershell
cd "C:\D Drive\AITesterBlueprint5x\Chapter_04_AI_Agent_Basics\Vibe_coding\01_intelligence_test_plan_AI_Agent\02_Implementation\implementation"
npm install
npm run install:all
npm start
```

Open `http://localhost:5173`.

## Configuration
Required server variables:
```text
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_EMAIL=you@example.com
JIRA_API_TOKEN=your-jira-token
GROQ_API_KEY=your-groq-key
OLLAMA_BASE_URL=http://localhost:11434
```

Settings can also save these values to `implementation/.env`, which is excluded by `.gitignore`. Never put real credentials in frontend code or commit `.env`.

## Use
1. Enter an issue key such as `QA-123`.
2. Generate the plan.
3. The backend reads Jira and sends only the extracted issue data to Groq.
4. The supplied test-plan template controls the output structure.

## Verification
- Backend configuration and route startup should be checked with `/api/health`.
- Jira and Groq connections can be tested from Settings.
- Jira and AI results cannot be verified as live without valid access to the configured services. Live calls must not be represented as mocks.

Known limitation: Jira custom fields for acceptance criteria vary by deployment and may require the exact custom-field ID.
