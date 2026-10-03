---
name: which-skill
description: Ask which skill or flow fits your situation. A router over the bibleskills plugin.
disable-model-invocation: true
---

A map of the plugin's skills: find your situation, follow its route. Answer the user's question with the route that fits, in the language they write in.

Every skill is typed with the plugin prefix: `/grill-with-docs` below means `/bibleskills:grill-with-docs`. Everything the skills write about a project goes into `.agent-docs/` at the checkout root (layout in `${CLAUDE_PLUGIN_ROOT}/docs/workspace.md`): commit it in your own projects, keep it in `.git/info/exclude` at work.

## Quick pick

| You have… | Reach for |
|---|---|
| A Jira ticket to hand to an agent | `/get-task <KEY>` → `/implement` |
| A task in your head to hand to an agent | `/create-task` → `/implement` |
| An idea to shape into a feature | `/grill-with-docs` → main flow below |
| An idea too big and foggy for one session | `/wayfinder` |
| A problem you won't fix now, to file in Jira | `/to-jira` |
| A hard bug or a regression | `/diagnosing-bugs` |
| Code an agent wrote that works but feels bloated | `/ai-slop-cleaner` |
| Your own work-in-progress to check | `/review-diff` |
| A colleague's branch or MR to review | `/review-branch` |
| A question someone else must answer | `/to-questionnaire` |
| Reading legwork (docs, APIs, specs) | `/research` |
| A step only a human can do (dashboards, secrets, cutover) | `/wizard` |
| A design question code would settle faster than talk | `/prototype` |
| A reply that didn't land | `/wait-what` |
| A session ending, work to carry elsewhere | `/handoff` (see Phase boundaries first) |
| A build that went sideways | `/retro` |
| Spare time for codebase upkeep | `/improve-codebase-architecture` |
| A topic to learn over several sessions | `/teach` (in its own folder, not a work repo) |

## A single task: ticket or description → done

The shortest route, for work that fits one session.

1. **`/get-task <KEY>`** builds an AI-Ready task (`.agent-docs/work/<KEY>/task.md`) from the Jira ticket; **`/create-task`** builds one by interviewing you when there's no ticket. Both offer to reproduce the described behaviour locally first, grill the task one question at a time until every field is settled, then have a subagent read it cold, without the conversation, to catch what an executor would misread.
2. **`/implement`** does the work against the task: stays inside its Constraints and Non-goals, runs its Required checks, stops at its Stop conditions, then runs `/review-diff` and commits.

## The main flow: idea → ship

For an idea that still needs shaping, or a build that spans sessions.

1. **`/grill-with-docs`** sharpens the idea by interview, recording settled terms and hard-to-reverse decisions in `.agent-docs/` (`GLOSSARY.md`, `adr/`) as it goes. Without a repo under you, use `/grilling`: the same interview, nothing saved.
2. **Branch: can every question be settled in conversation?** If one needs a runnable answer (a state model, business logic, a UI you have to see), detour through **`/prototype`**. A prototype usually lives in its own directory or branch, so bridge it with **`/handoff`** out and back.
3. **Branch: is this a multi-session build?**
   - **No** → **`/to-spec`** turns the conversation into an AI-Ready spec, and **`/implement`** builds it right here.
   - **Yes** → **`/to-spec`**, then **`/to-tickets`** splits it into tracer-bullet tickets (`.agent-docs/work/<id>/issues/`), each declaring what blocks it. Then either:
     - **`/implement`** one ticket at a time, `/clear`ing between them: each ticket is self-contained, so the last one's context is disposable;
     - **`/implement-spec`** for the whole spec in one run: implementer subagents work the ready frontier in parallel and land everything on one integration branch.
4. **Clean, review and ship.** `/implement` and `/implement-spec` close with **`/ai-slop-cleaner`** over the changed files (behaviour locked by tests, deletion first) and then **`/review-diff`** (Standards + Spec). When the work goes up as an MR/PR, **`/pr`** shapes the body: the smallest visual of the change, before/after evidence, a one-way or two-way door call. It's model-invoked, so the agent reaches for it whenever it writes one.
5. **`/retro`** closes the loop, especially after a build that went sideways: it suggests changes to the agent's **environment** (navigation pointers, automated checks, the standards `/review-diff` enforces, steering files), not to the code.

**Context hygiene.** Keep steps 1–3 in one unbroken context window, so grilling, spec and tickets build on the same thinking; each `/implement` then starts fresh from its ticket. If the session nears the [smart zone](https://www.aihero.dev/ai-coding-dictionary/smart-zone) limit (~150k tokens) before `/to-tickets`, `/compact` at the nearest phase boundary rather than pushing on degraded. Run `/retro` in the session it looks back on, before clearing.

## Other entry points

- **A huge, foggy effort** (a greenfield project, a feature too big for one session) → **`/wayfinder`**. It charts a map of **decision tickets** in `.agent-docs/work/<id>/` and resolves them one per session, producing **decisions, not deliverables**. When the way is clear it hands off to **`/to-spec`** and the main flow; it never builds. Save it for real fog: a well-scoped feature belongs in `/grill-with-docs`.
- **A problem to file for later** → **`/to-jira`** writes a **durable** ticket (behaviour and component names, no paths or lines) to paste into Jira. Whoever picks it up runs `/get-task` on its key, which makes it concrete against the code as it is then. Grill first if the problem is still fuzzy.
- **Something's broken** → **`/diagnosing-bugs`**, for the bug that resists a first glance, the flake, the regression between two known-good states. It refuses to theorise until it has a tight loop that goes red on *this* bug, then fixes with a regression test. When the finding is "there's no good seam to lock this down", it hands off to `/improve-codebase-architecture`.

## Review

- **`/ai-slop-cleaner`**: before review, strip what agents tend to leave behind (dead code, duplicates, pass-through wrappers, weak tests) without changing behaviour; `--review` only reports. Lighter than it, Claude Code's built-in `/simplify` does a quick quality pass over a diff.
- **`/review-diff`**: your own (or your agent's) changes since a fixed point, against the task or spec in `.agent-docs/`, on two axes: Standards and Spec.
- **`/review-branch`**: a colleague's branch or GitLab MR. It finds the MR and the base itself, pulls the Jira task from the branch name, reads the branch straight from git, and reviews Logic, Standards and Task with severities and comments ready to post. Tests are CI's job, not its.

## Codebase health

**`/improve-codebase-architecture`** surveys the codebase for **deepening opportunities** and presents them as an HTML report; picking one turns into an idea for the main flow. **`/codebase-design`** is the bench you design the chosen one on.

## Vocabulary underneath

Model-invoked references other skills pull in; reach for them directly when the **words**, not the process, are the problem.

- **`/grilling`**: the interview primitive: one question at a time, ready answer options, facts are the agent's job and decisions are yours. Call it directly for an interview that saves nothing; `/grill-with-docs`, `/get-task`, `/create-task`, `/wayfinder` and `/improve-codebase-architecture` all run it.
- **`/domain-modeling`**: sharpen the project's domain language (a fuzzy term, an overloaded word) and record hard-to-reverse decisions as ADRs, in `.agent-docs/`.
- **`/codebase-design`**: the deep-module vocabulary (module, interface, depth, seam, adapter, leverage, locality) for shaping a module.
- **`/writing-for-agents`**: how to write documents agents consume: skills, `CLAUDE.md`/`AGENTS.md`, pointed-at docs.

## Phase boundaries

A **phase** is a chunk of work inside a session (the grilling, the implementation, the QA). At the boundary between two you have five options:

- **Continue**: stay put. Costs nothing, loses nothing.
- **`/clear`**: empty the window, when nothing here matters to what's next.
- **`/handoff`**: a portable markdown file, only for a **new harness**, a **new directory**, a **colleague**, or forking a side task **mid-phase**.
- **Subagent**: send a tightly scoped task to its own window and get a report back.
- **`/compact`**: compress this context into a fresh session. The **default**, but the last to reach for.

Read [PHASE-BOUNDARIES.md](PHASE-BOUNDARIES.md) for the ordered tree behind these and why **Continue** is the one to rule out first. Decide **at** a boundary; mid-phase, continue or split the rest into subagents.

## Standalone

- **`/research`**: a background agent investigates a question against primary sources and leaves a cited file in `.agent-docs/`, while you keep working. Feed the result into `/grill-with-docs`.
- **`/to-questionnaire`**: when the answer is in **someone else's** head, it interviews you about the send (who it's for, what you need back) and writes them a questionnaire.
- **`/wizard`**: an interactive bash script that walks a human through steps only they can take (dashboards, credentials, CI secrets, a one-off cutover), writing the values where they belong. The agent reaches for it itself when it hits such a wall.
- **`/wait-what`**: mid-conversation, re-pitch the last message in plain language with the missing context and the glossary's terms.
- **`/teach`**: learn a topic over several sessions; it uses the current directory as its workspace, so run it in a folder of its own.
