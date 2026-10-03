---
name: get-task
description: "Build an agent task (задача для агента) from a Jira ticket: fetch it, verify the described behaviour locally, grill until settled, save .agent-docs/work/<KEY>/task.md. Use when the user gives a Jira key (e.g. MYCOMM-818) and asks for a task for it (\"сделай задачу\", \"получи задачу\")."
---

The entry point of the agent-task flow **from a Jira ticket**. This skill covers only the initial assembly; after it comes the shared flow in `${CLAUDE_PLUGIN_ROOT}/docs/task-flow.md` (reproduction → grilling → finalization). Read it before you start: its context-economy rules apply to this step too.

## When to use

**The only selection signal: the user has a Jira issue key matching `[A-Z]+-\d+`** (e.g. `MYCOMM-818`, `PROJ-123`). The agent task is built from an existing Jira ticket.

Typical phrasings (the key may appear anywhere):
- «Сделай задачу для агента по MYCOMM-818»
- «Построй задачу для агента по PROJ-123»
- «Получи/оформи/разбери MYCOMM-818»

**Not here:** if there's no key and the user describes the task in their own words (even if they said "make/build a task"), that's the `create-task` skill, which interviews from scratch.

## Process

### 1. Initial assembly (subagent)

The task identifier is the Jira key; the file is `.agent-docs/work/<Jira-key>/task.md`.

Call the agent `bibleskills:task-builder` (prompt: the issue key, the repository path, the absolute path to `.agent-docs/work/<Jira-key>/task.md` from the repository root, the path to the reference `${CLAUDE_PLUGIN_ROOT}/docs/ai-ready-task.md`; `task-builder` reads the template and field rules from the reference itself). If the named agent is unavailable (e.g. in Codex), spawn a **general-purpose** subagent with the equivalent instruction: fetch the ticket (`jira_get_issue` + comments + `jira_get_issue_development_info`/`jira_get_issue_dates` where relevant), gather repo context (README, CLAUDE.md, how to run, relevant code), build the task's core per the template in `${CLAUDE_PLUGIN_ROOT}/docs/ai-ready-task.md`, and save the file.

Limit the assembly to the core: `task-builder` fills the fields the ticket and repository already give substance to, usually Problem/Expected outcome.

From `task-builder`'s report, bring **only the summary** into the main context: the essence, whether the task describes a verifiable circumstance, the file path, which fields are filled/empty and why, how to run the project and check the circumstance, open questions for grilling. Don't re-read the raw ticket or repo dumps.

**Done when:** `.agent-docs/work/<Jira-key>/task.md` exists with its core filled, and the main context holds `task-builder`'s summary (not the raw ticket).

### 2. Shared flow

Hand the flow the task file and `task-builder`'s summary; grilling's input is the ticket. Continue from step A in `${CLAUDE_PLUGIN_ROOT}/docs/task-flow.md`.

**Done when:** every step of the shared flow is done and its quality criteria hold.

## Quality criteria

- The core was assembled by a subagent; the main context holds only the summary, not the raw ticket.
