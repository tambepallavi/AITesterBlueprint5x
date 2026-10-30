#!/usr/bin/env bash
set -euo pipefail

usage() {
  printf 'Usage: JIRA_BASE_URL=https://company.atlassian.net JIRA_EMAIL=you@example.com JIRA_API_TOKEN=... %s ISSUE-123\n' "$0" >&2
}

if [[ $# -ne 1 ]]; then
  usage
  exit 2
fi

issue_key=$1
if [[ ! $issue_key =~ ^[A-Za-z][A-Za-z0-9_]*-[0-9]+$ ]]; then
  printf 'Error: invalid Jira issue key: %s\n' "$issue_key" >&2
  usage
  exit 2
fi

: "${JIRA_BASE_URL:?Error: set JIRA_BASE_URL to your Jira site URL (for example, https://company.atlassian.net)}"
: "${JIRA_EMAIL:?Error: set JIRA_EMAIL to your Atlassian account email}"
: "${JIRA_API_TOKEN:?Error: set JIRA_API_TOKEN to your Atlassian API token}"

if [[ $JIRA_BASE_URL != https://* ]]; then
  printf 'Error: JIRA_BASE_URL must use HTTPS.\n' >&2
  exit 2
fi

base_url=${JIRA_BASE_URL%/}
curl --fail --silent --show-error \
  --request GET \
  --url "${base_url}/rest/api/3/issue/${issue_key}?fields=summary,description,issuetype,status,priority,labels,components,assignee,reporter,created,updated" \
  --user "${JIRA_EMAIL}:${JIRA_API_TOKEN}" \
  --header 'Accept: application/json'
