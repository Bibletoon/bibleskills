---
name: implement-spec
description: "Implement the result of /to-spec and /to-tickets in code."
disable-model-invocation: true
---

You have been provided a spec (`.agent-docs/work/<id>/spec.md`). This spec should have tickets associated with it (`.agent-docs/work/<id>/issues/`), describing how to implement the spec. The file conventions (statuses, blocking, frontier) are in `${CLAUDE_PLUGIN_ROOT}/docs/workspace.md`.

The goal is the entire spec implemented on a single **integration branch**, with every ticket's **Status** set to `done`.

The tickets are not a list of steps. They are a **task graph** with blocking relationships between them. This means there is always a **frontier** of tickets which are ready to be grabbed.

Communication to and from subagents should be sparse. Communicate primarily through **context pointers**: to the spec, tickets, research notes, and previous commits. Don't duplicate information already available via pointers.

**Implementer subagents** should be run in the background where possible for maximum concurrency.

## Process

1. Read the spec and tickets to understand the task graph.

2. (optional) Use an **exploration subagent** to conduct any exploration required by the tickets - relevant codebase files or external documentation. Ensure the exploration subagent can save files - it should save its markdown notes in `.agent-docs/work/<id>/notes/` and pass their absolute paths on, so subagents in other worktrees can read them. This lets **implementer subagents** focus on implementation rather than exploration.

3. Create the integration branch. If the user asks for a PR, open a draft PR after the first merge in step 5 (a branch with no commits ahead of main can't open one), linking the spec.

   You own the ticket files: update them in your own working directory, never from an implementer's worktree. Set a ticket's **Status** to `claimed` when you dispatch its implementer, and to `done` once its work is merged into the integration branch.

4. Use **implementer subagents** to implement each ticket, each in its own worktree on its own branch. Each implementer subagent:
   - confirms its worktree is based on the integration branch before starting, and resets onto it if not;
   - treats the ticket as an AI-Ready task: stays within its Constraints and Non-goals, runs every Required check, stops at its Stop conditions;
   - touches only what its ticket owns: a problem found outside the ticket (a bug in neighbouring code, a smell, a missing test) is **reported, not fixed**: in its report back to you, or as a note in `.agent-docs/work/<id>/notes/` (never in the ticket files, which you own), so you decide whether it becomes a new ticket; no cleanup or review passes of its own, those run once on the integration branch in step 7;
   - merges the integration branch tip into its own branch before reporting done;
   - is done only when the ticket's criteria hold (Expected outcome, Required checks, Stop conditions), each verified with fresh output, and the tests of the area it touched pass; the full suite belongs to the integration branch.

5. Once an **implementer subagent** completes, merge its work to the integration branch with a **merger subagent**. The merger runs the full test suite on the integration branch after the merge and reports the result: the branch stays green merge to merge. A red suite after a clean merge means two tickets conflict in behaviour; stop dispatching, fix it on the integration branch (a single implementer subagent, scoped to the failure), and only then continue.

6. If this changes the **frontier** of available tickets, kick off more **implementer subagents** to work on the new tickets. This allows for maximum concurrency.

7. Once all tickets are complete, run one cleanup pass: an **implementer subagent** calls the Skill tool with `bibleskills:ai-slop-cleaner`, scoped to the files changed on the integration branch. Then call the Skill tool with `bibleskills:review-diff` on the integration branch. Fix all issues raised by the code review in a single **implementer subagent**.

8. Confirm every ticket is `done`. If a draft PR exists, mark it ready for review. Report the integration branch.

9. Clean up all **implementer subagent** worktrees.
