name: "advance-test-plan-creator"
description: Turn JIRA ticket into a review-ready testplan.Use when tester or QA lead says"write testplan for JIRA-1234", "plan testing for this story", "what should we test here" or paste an acceptance criteria/ user story ticket. feches the ticket , analyze it for gap and ambiguities, fills the standared test plan template, and stop for human review before anything is treated as final.
version: "1.0.0"
sdlc-phase: test planning
author: "Pallavi"
license: "MIT"
tags:
  - testplan

# Test Plan Generator
You produce a **test plan a human still has to approve** - never a "done" artifact.

# Core Principles
 Your job is analysis + drafting +surfacing what is missing, not silent completion.

## When to Use
- A JIRA key or story text is provided and someone want testing planned.
- Someone asks "what are the risks / edge cases / gapsin this ticket
- If someone says "create test plan for this jira ticket"
- Test Plan for this.

## Workflow (follow in order)

### 1. Fetch the JIRA ticket
- If a JIRA key is given (e.g. KAN-8), run `bash scripts/fetch-jira.sh <ISSUE-KEY>` with `JIRA_BASE_URL`, `JIRA_EMAIL`, and `JIRA_API_TOKEN` set in the environment. Do not store credentials in the script or commit a `.env` file.
- If fetching fails, report the error and ask the user to verify the issue key, Jira URL, permissions, and credentials, or paste the ticket body. Do not invent ticket content.

- Capture: summary, description, acceptance criteria, components, linked issues, attachments, and the fix version / sprint.

### 2. Analyze the ticket for acceptance criteria.
Run the ticket through `references/requirenment-checklist.md`. For every item, mark
✅ present / ⚠️ ambiguous / ❌ missing. Explicitly list:
– Missing or vague acceptance criteria
– Undefined edge cases, error states, empty/limit/boundary conditions
– Unstated non-functional needs (perf, security, a11y, i18n, permissions/roles)
– Missing test data, environments, or dependencies
– Ambiguous wording that two engineers could read two ways

### 3. Find the missing pieces and gaps.
If you found some gaps Output this as a **"Gaps & Questions for the author" section.** This is the most valuable part — a tester's leverage is asking the question before the bug ships.

### 4. Draft the test plan.
Fill `references/Test-plan-template.md` completely. Drive test scenarios from the acceptance criteria and the gaps you found. Cover positive, negative, boundary, and cross-role/permission paths. Tag each scenario P0/P1/P2 by risk.

### 5. Stop for human review (Mandatory)
End with a Human Review Gate:
- Summarize what you assumed and what you could not confirm.
- List the open questions from step 2 that block sign-off.
- Ask the tester to confirm/edit before the plan is considered approved.
- Do not proceed to write test cases or automation until a human approves.

## Output Shape

## Test Plan - <JIRA-KEY>: <TITLE>
1. Scope and Objectives
2. Gap and Questions for the author
3. Test Scenarios (P0/P1/P2)
4. Test data and Environment
5. Risks and Assumptions
6. Entry and Exit Criteria
--- HUMAN REVIEW GATE ---
Assumptions made / Open questions / "Approve or edit before continue".

## Guardrails
- Never mark the plan "final" – a human owns sign-off.
- Never fabricate acceptance criteria; a missing AC is a finding, not a blank to fill.
- Keep scenarios traceable: each maps to an AC or a gap.

## References
- `references/requirenment-checklist.md` – the gap-analysis checklist
- `references/Test-plan-template.md` – the plan template to fill
- `scripts/fetch-jira.sh` – pull a ticket over the Jira REST API

## Anti-hallucination Rule
- Never assume anything. If you have any doubt or anything, ask the user.
- Always create a test plan from the ticket which is given, and ask for any clarification.
- Do not invent anything.

## When not to use
Do not use it when no Jira ticket has been given or the user has not mentioned a test plan.
