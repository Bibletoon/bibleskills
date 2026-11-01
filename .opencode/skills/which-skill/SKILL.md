---
name: which-skill
description: Ask which skill or flow fits your situation. A router over the bibleskills OpenCode bundle.
disable-model-invocation: true
---

A map of the bundle's skills: find your situation, follow its route. Answer the user's question with the route that fits, in the language they write in.

Users select skills directly with `@<skill>`, e.g. `@grilling`; the `skill` tool uses the short ID, e.g. `grilling`. Everything the skills write about a project goes into `.agent-docs/` at the checkout root (layout in `../../../docs/workspace.md`, resolved from this skill's base directory): commit it in your own projects, keep it in `.git/info/exclude` at work.

## Quick pick

Choose by the **requested result** first. A tracker key alone does not start task preparation, and its absence does not force an interview. Durable drafts for later → `to-tickets`; a small local specification for implementation now → `get-task`; code from that prepared specification → `implement`. Verification, review and issue-summary requests stay those requests.

| You have… | Reach for |
|---|---|
| A tracker ticket, export or local draft to prepare for implementation | `@get-task <reference>` → `@implement <task.md>` |
| A description or settled conversation to hand to an agent | `@get-task` → `@implement <task.md>` |
| An idea to shape into a feature | `@grill-with-docs` → main flow below |
| An idea too big and foggy for one session | `@wayfinder` |
| Feature analysis ready for durable tracker tickets | `@to-tickets` → separately confirmed publication |
| A suspected problem to verify | Ordinary conversation; confirmed finding → `@to-tickets` |
| A hard bug or a regression | `@diagnosing-bugs` |
| Code an agent wrote that works but feels bloated | `@ai-slop-cleaner` |
| Your own work-in-progress to check | `@review-diff` |
| A colleague's branch or MR to review | `@review-branch` |
| A question someone else must answer | `@to-questionnaire` |
| A research question needing a saved, cited note | `@research` |
| A design question code would settle faster than talk | `@prototype` |
| A reply that didn't land | `@wait-what` |
| A session ending, work to carry elsewhere | `@handoff` (see Phase boundaries first) |
| A build that went sideways | `@retro` |
| Spare time for codebase upkeep | `@improve-codebase-architecture` |
| A topic to learn over several sessions | `@teach` (in its own folder, not a work repo) |

## Received task: source → local specification → code

Prepare one selected task against the current repository, regardless of its source.

1. **`@get-task <reference or description>`** accepts a live issue, snapshot/export, local durable ticket, plain description or settled conversation. It inspects relevant code, offers reproduction when appropriate, asks only unresolved requirements/scope/check questions and gets a cold `task-critic` review. The result is a small nine-heading `.agent-docs/work/<id>/task.md`, with current implementation detail; it does not change the source ticket or production code.
2. **`@implement <task.md>`** executes that one local specification within Constraints and Non-goals. It captures a review baseline, implements, cleans its own changes and runs `review-diff` against the same specification. Completion requires fresh final-state checks and the full test suite after cleanup/review fixes. It is not a bulk ticket executor and does not publish or transition tracker issues.

## Feature analysis → durable tracker drafts

For work that will move to a tracker and may wait there for months.

1. **`@grill-with-docs`** sharpens the idea by interview, recording settled terms and hard-to-reverse decisions in `.agent-docs/` (`GLOSSARY.md`, `adr/`) as it goes. Without a repo under you, use `@grilling`: the same interview, nothing saved.
2. **Branch: can every question be settled in conversation?** If one needs a runnable answer (a state model, business logic, a UI you have to see), detour through **`@prototype`**. A prototype usually lives in its own directory or branch, so bridge it with **`@handoff`** out and back.
3. **`@to-tickets`** turns the analysis directly into one or more durable drafts under `.agent-docs/work/<id>/issues/`. Problem, Actions, Definition of done; domain components and public contracts, not source paths, line numbers or private functions. Split only when independently verifiable outcomes justify it. Dependencies name tracker keys or draft summary titles, not local file numbers. No intermediate specification is required.
4. **Publish only on a separate confirmed request**, with destination and content agreed. Draft approval is not publication approval. Whoever picks up a ticket later follows `get-task` → local `task.md` → `implement`; local drafts are not an execution queue.

If the actual goal is implementation now, not a tracker backlog, go directly from settled analysis to `@get-task` without manufacturing a durable ticket first. After implementation, `@retro` can capture lessons about the agent's environment.

**Context hygiene.** Keep the reasoning that feeds draft synthesis together while practical. A prepared local specification must be self-contained enough for implementation in a new session; durable tickets must stand alone outside the checkout. Capture important decisions before compacting at a phase boundary. Run `@retro` in the session it looks back on.

## Suspected problem → verification → durable ticket

Start from any dialogue; no formal artifact or dedicated verification skill is required. Agree what is being checked and use safe evidence gathering to return **confirmed / not confirmed / insufficient data**, evidence, localization and any remaining hypotheses. A verification-only request does not authorize fixes. If confirmed, `@to-tickets` can draft the behavioral bug ticket; if not confirmed, gather more evidence or explicitly agree an investigation ticket. Publication remains separate and confirmed.

## Other entry points

- **A huge, foggy effort** → **`@wayfinder`** charts and resolves decision tickets, producing decisions rather than deliverables. When the route is clear, feed analysis directly to `@to-tickets`. Save it for real fog; a well-scoped feature belongs in `@grill-with-docs`.
- **A confirmed problem to file for later** → **`@to-tickets`** writes a durable ticket with evidence and acceptance criteria. Whoever picks it up later uses `@get-task` against the then-current code.
- **A hard bug** → **`@diagnosing-bugs`** builds a tight red-capable loop before theorizing. Fix/regression-test phases run only when fixing is authorized; verification-only requests stop at evidence and localization. A missing test seam can become an architecture finding, not automatic permission to refactor.

## Review

- **`@ai-slop-cleaner`**: before review, strip what agents tend to leave behind (dead code, duplicates, pass-through wrappers, weak tests) without changing behaviour; `--review` only reports.
- **`@review-diff`**: your own (or your agent's) changes since a fixed point, against the task or spec in `.agent-docs/`, on three axes: Logic, Standards and Spec, each its own reviewer agent, reported separately.
- **`@review-branch`**: a colleague's branch or GitLab MR. It finds the MR and the base itself, pulls the Jira task from the branch name, reads the branch straight from git, and runs the same three reviewer agents, with findings ranked high/med/low and a summary table printed in the reply. Tests are CI's job, not its.

## Codebase health

**`@improve-codebase-architecture`** surveys the codebase for **deepening opportunities** and presents them as an HTML report; picking one turns into an idea for the main flow. **`@codebase-design`** is the bench you design the chosen one on.

## Vocabulary underneath

Model-invoked references other skills pull in; reach for them directly when the **words**, not the process, are the problem.

- **`@grilling`**: the interview primitive: one question at a time, ready answer options, facts are the agent's job and decisions are yours. Call it directly for an interview that saves nothing; `@grill-with-docs`, `@get-task`, `@wayfinder` and `@improve-codebase-architecture` all run it.
- **`@domain-modeling`**: sharpen the project's domain language (a fuzzy term, an overloaded word) and record hard-to-reverse decisions as ADRs, in `.agent-docs/`.
- **`@codebase-design`**: the deep-module vocabulary (module, interface, depth, seam, adapter, leverage, locality) for shaping a module.
- **`@writing-for-agents`**: how to write documents agents consume: skills, `AGENTS.md`, pointed-at docs.

## Phase boundaries

A **phase** is a chunk of work inside a session (the grilling, the implementation, the QA). At the boundary between two you have five options:

- **Continue**: stay put. Costs nothing, loses nothing.
- **New session**: start a fresh OpenCode session when nothing here matters to what's next; the old one stays available.
- **`@handoff`**: a portable markdown file, only for a **new harness**, a **new directory**, a **colleague**, or forking a side task **mid-phase**.
- **Subagent**: send a tightly scoped task to its own window and get a report back.
- **`/compact`**: compact the current session's context. The **default**, but the last to reach for.

Read [PHASE-BOUNDARIES.md](PHASE-BOUNDARIES.md) for the ordered tree behind these and why **Continue** is the one to rule out first. Decide **at** a boundary; mid-phase, continue or split the rest into subagents.

## Standalone

- **`@research`**: a background agent investigates a question against primary sources and leaves a cited file in `.agent-docs/`, while you keep working. Feed the result into `@grill-with-docs`.
- **`@to-questionnaire`**: when the answer is in **someone else's** head, it interviews you about the send (who it's for, what you need back) and writes them a questionnaire.
- **`@wait-what`**: mid-conversation, re-pitch the last message in plain language with the missing context and the glossary's terms.
- **`@teach`**: learn a topic over several sessions; it uses the current directory as its workspace, so run it in a folder of its own.
