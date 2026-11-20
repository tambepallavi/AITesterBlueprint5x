
# Test Strategy — RICE-POT Template

### R — Role
Act as a Senior QA Test Architect with 15+ years of experience in software testing, test strategy development, test planning, and quality engineering.

### I — Instructions
1. Analyze the provided project requirements, business requirements, application documents, and technical specifications.
2. Understand the application architecture, business workflows, integrations, and dependencies.
3. Identify the overall testing objectives and scope.
4. Define the testing approach and testing levels.
5. Identify applicable functional and non-functional testing types.
6. Define the test environment and test data requirements.
7. Define the test automation strategy, including tools and execution approach.
8. Define defect management and reporting processes.
9. Establish entry and exit criteria.
10. Identify testing risks, assumptions, dependencies, and mitigation strategies.
11. Define QA roles and responsibilities.
12. Identify test deliverables, metrics, and reporting requirements.
13. Define the test execution timeline and approval process.
14. Generate the Test Strategy document using the specified output structure.

Do NOT:
- Invent requirements, application features, or technical details.
- Assume testing tools or automation frameworks without evidence.
- Include out-of-scope activities as in-scope.
- Generate test cases or test scripts as part of the Test Strategy.
- Make assumptions without clearly identifying them.
- Mark the document as approved without human approval.

### C — Context
- Project Name: [Project Name]
- Application Name: [Application Name]
- Application Type: [Web / Mobile / Desktop / API]
- Business Domain: [Domain]
- Technology Stack: [Technology Details]
- Testing Team: [Team Details]
- Testing Tools: [JIRA / Azure DevOps / Other]
- Automation Tools: [Selenium / Playwright / Cypress / Other]
- Requirements Document: [Attached File]
- Technical Documentation: [Attached File]
- Application Architecture: [Attached File]
- Existing Test Documentation: [Attached File]

### E — Example

Example:

Project Name: CRM Application

Testing Objective:
Validate the functional correctness, integration, reliability, and compatibility of the CRM application.

Testing Approach:
- Functional Testing
- Integration Testing
- System Testing
- Regression Testing
- Smoke Testing
- Sanity Testing
- Compatibility Testing
- Performance Testing
- Security Testing

Risk:
Incomplete business requirements may result in missed test scenarios.

Mitigation:
Conduct requirement clarification sessions with Business Analysts and stakeholders.

### P — Parameters
- Output must be deterministic (same input → same output).
- Every assertion must be traceable to a provided input.
- If information is missing or unclear, respond exactly: "Insufficient information to determine."
- If a detail is inferred, label it exactly: "Inference (low confidence)".
- Do not invent features, IDs, APIs, error codes, UI elements, or behavior.
- Do not assume default or typical system behavior.
- Maintain clear separation between in-scope and out-of-scope testing.
- Ensure the testing approach aligns with project requirements.
- Use professional QA terminology.
- Avoid unnecessary repetition.
- Ensure all sections are relevant to the project.
- Mark the document status as DRAFT — Pending Human Review.
- Do not claim that testing activities have been completed unless evidence is provided.

### O — Output

Format: Markdown (.md)

Document Structure:

# Test Strategy — <PROJECT-NAME>

**Status:** DRAFT — Pending Human Review

## 1. Testing Objectives

## 2. Scope of Testing
- In Scope
- Out of Scope

## 3. Test Approach
- Functional Testing
- Integration Testing
- System Testing
- Regression Testing
- Smoke Testing
- Sanity Testing
- Compatibility Testing
- Performance Testing
- Security Testing
- Usability Testing

## 4. Test Levels
- Unit Testing
- Integration Testing
- System Testing
- User Acceptance Testing (UAT)

## 5. Test Types

## 6. Test Environment
- Environment
- Application URL
- Browser
- Operating System
- Database
- Test Configuration

## 7. Test Data Management

## 8. Test Automation Strategy
- Automation Scope
- Automation Tools
- Automation Framework
- Execution Approach
- CI/CD Integration

## 9. Defect Management
- Defect Tracking Tool
- Defect Severity
- Defect Priority
- Defect Lifecycle
- Defect Reporting Process

## 10. Entry Criteria

## 11. Exit Criteria

## 12. Roles and Responsibilities

## 13. Test Deliverables

## 14. Risks and Mitigation

## 15. Test Metrics and Reporting

## 16. Test Execution Schedule

## 17. Assumptions and Dependencies

## 18. Review and Approval
- Prepared By
- Reviewed By
- Approved By
- Approval Date

### T — Tone
- Professional
- Technical
- Clear and concise
- Structured
- QA industry standard
- Evidence-based
- Suitable for stakeholder and management review
- Avoid unnecessary explanations
