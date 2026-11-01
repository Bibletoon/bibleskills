---
name: get-task
description: "Prepare a small local specification for an agent from a tracker ticket, export, file or plain description (\"подготовь задачу для агента\"). Use when clarifying scope before implementation. Not for durable tracker drafts, coding or issue summaries."
---

Prepare one small **local agent specification**, `.agent-docs/work/<id>/task.md`, against the current code. Inputs may be a tracker ticket, export, local draft, plain description or decisions already settled in this conversation. Resolve bundled paths from this skill's base directory; read `../../../docs/ai-ready-task.md`, `../../../docs/workspace.md` and `../../../docs/task-flow.md` before starting.

## When to use

**Selection requires a specification-preparation request**, not a particular source. The user wants requirements, scope and checks clarified for an agent to implement now. A tracker key alone does not select this workflow, and no key is required for a plain description. If the desired output is ambiguous, ask whether the user wants a durable tracker draft, a local implementation specification, or the code changed.

Typical phrasings:
- «Подготовь задачу для агента по PROJ-123 / этому URL»
- «Уточни скоуп и сделай небольшую спецификацию по моему описанию»
- «Оформи обсуждённое как task.md для реализации»
- «Подготовь к реализации этот локальный тикет / экспорт»

**Not here:** long-lived drafts for an external tracker belong to `to-tickets`. Direct implementation, review, an issue summary or a question about whether a problem exists stay those requests, not an automatic preparation interview. If the conversation already settles a field, carry the answer forward rather than asking again.

## Process

### 1. Resolve the source and identifier

Read a supplied file/export or local durable ticket; use conversation context when that is the source. For a live issue, follow `../../../docs/tracker-access.md` and keep the issue's URL/instance if supplied. A key merely mentioned as background is not automatically the source. If several tasks are provided, ask which one to prepare; do not silently combine their scopes.

Use a confirmed external issue key when available, otherwise propose a short kebab-case slug derived from the work and confirm it with the user. Missing tracker access is not a reason to invent issue content; request a snapshot or restored access. A plain description, by contrast, needs neither a tracker nor an issue key. For a local ticket within a larger draft set, choose a ticket-specific work ID so preparing another ticket does not overwrite this one's specification.

The destination is `.agent-docs/work/<id>/task.md`. Read an existing destination before updating it; preserve gathered facts and ask before replacing a materially different task. If even the core problem is unclear, ask the minimum single question needed, using `grilling`'s `question` format. Do not interview mechanically over all fields yet.

**Done when:** one source and destination are unambiguous and there is enough substance to assemble the core without guessing.

### 2. Assemble the core (subagent)

Call the `subagent` tool with agent `bibleskills/task-builder`. Pass the source kind (live reference, snapshot/local ticket, or description), its reference or clearly delimited text, the chosen work ID, repository and destination paths, and absolute paths to `../../../docs/ai-ready-task.md`, `../../../docs/durable-ticket.md` and `../../../docs/tracker-access.md`. Pass a compact summary of settled decisions, alternatives/reasons and all user constraints; not the whole conversation. If the named agent is unavailable, ask the user to install the bundle or `/reload`, not to bypass its permissions with an unrestricted fallback.

The builder gathers only relevant code facts and writes the nine-heading template with a minimal core, usually Problem/Expected outcome and facts already supported by the source. Concrete paths, interfaces and checks belong in this local file, not back in the durable ticket. A stale assumption in the source is an open question, not permission to redesign the requirement.

From `task-builder`'s report, bring **only the summary** into the main context: the essence, whether the task describes a verifiable circumstance, the file path, which fields are filled/empty and why, how to run the project and check the circumstance, open questions for grilling. Don't re-read the raw ticket or repo dumps.

**Done when:** the local `task.md` exists with its core filled and the main context holds the builder's summary, source/access gaps and settled inputs, not raw tool dumps. If source access blocked assembly, stop with that blocker instead of claiming the file is ready.

### 3. Reproduce, clarify and finalize

Continue from step A in `../../../docs/task-flow.md`, passing the file, builder summary and everything already settled in the conversation/source. That flow handles reproduction when appropriate, questions only on unresolved requirements/scope/checks, and a cold `task-critic` review. Keep the specification small and independently executable. Preparation does not write production code, publish tickets or change tracker status.

**Done when:** every step of the shared flow is done and its quality criteria hold.

## Quality criteria

- The source may be a tracker ticket or an ordinary description; neither is silently substituted for the other.
- The local specification contains current implementation detail, explicit scope and verifiable completion criteria, without duplicating raw analysis.
- The durable source is unchanged, and no implementation or tracker mutation happened during preparation.
- The next step is `@implement` with the saved local specification, not automatic execution.
