---
name: review-diff
description: "Review your own (or your agent's) changes since a fixed point on three axes, Logic, Standards and Spec, in parallel reviewer agents. Use when checking work-in-progress against its .agent-docs task/spec, or asked to \"review since X\". Someone else's branch: review-branch."
---

Three-axis review of everything the branch changed since a fixed point the user supplies: committed, staged and unsaved-to-git alike, so the review happens **before** the commit, not after it.

- **Logic**: does the code do the right thing? Bugs, edge cases, failure paths, concurrency, security, compatibility.
- **Standards**: does the code conform to this repo's documented coding standards and the smell baseline?
- **Spec**: does the code faithfully implement the originating task / spec?

Each axis runs as its own **reviewer agent**, in parallel, so they don't pollute each other's context; this skill then aggregates their findings. The contract they share (how to read the code, the severity scale, the finding format) is `${CLAUDE_PLUGIN_ROOT}/docs/review-findings.md`.

Talk to the user in the language they write in.

## Process

### 1. Pin the fixed point

Whatever the user said is the fixed point (a commit SHA, branch name, tag, `main`, `HEAD~5`, etc.). If they didn't specify one, ask for it.

The diff covers the **whole branch as it is now**, uncommitted work included. Capture the diff command once:

```bash
git diff $(git merge-base <fixed-point> HEAD)
```

Two-dot against the merge-base, with no `HEAD` on the right, compares the base with the working tree: commits, staged and unstaged changes all land in one diff. It still misses **untracked files**, so list them too (`git ls-files --others --exclude-standard`) and hand the list to the reviewers as new files to read in full. Also note the commits via `git log <fixed-point>..HEAD --oneline`; "none yet" is a valid answer.

Before going further, confirm the fixed point resolves (`git rev-parse <fixed-point>`) and that the diff or the untracked list is non-empty. A bad ref or nothing to review should fail here, not inside three parallel reviewers.

**Done when:** the fixed point resolves and there is something to review.

### 2. Identify the spec source

Look for the originating spec, in this order:

1. A path the user passed as an argument.
2. A work item referenced in the commit messages or branch name (a Jira key like `MYCOMM-818`, an `.agent-docs/work/<id>` slug): its `task.md`, `spec.md`, or the ticket under `issues/` the commits implement (layout in `${CLAUDE_PLUGIN_ROOT}/docs/workspace.md`).
3. A spec file under `.agent-docs/work/`, `docs/`, or `specs/` matching the branch name or feature.
4. If nothing is found, ask the user where the spec is. If they say there isn't one, the Spec axis is skipped and the final report says "no spec available".

**Done when:** you hold a spec path, or the Spec axis is explicitly skipped.

### 3. Identify the standards sources

Anything in the repo that documents how code should be written, such as `CODING_STANDARDS.md` or `CONTRIBUTING.md`, plus linter and formatter configs.

On top of whatever the repo documents, the Standards axis always carries the **smell baseline** in `${CLAUDE_PLUGIN_ROOT}/docs/code-smells.md`: a fixed set of Fowler code smells that applies even when a repo documents nothing, always as judgement calls, and always overridden by a documented repo standard.

**Done when:** the list of standards sources is known (possibly empty: the baseline still applies).

### 4. Run the three reviewers in parallel

Call the agents `bibleskills:logic-reviewer`, `bibleskills:standards-reviewer` and `bibleskills:spec-reviewer` in parallel (fallback: a general-purpose subagent given `${CLAUDE_PLUGIN_ROOT}/agents/<name>.md` as its instructions, only if the named agent is unavailable). Pass only paths and facts, never the conversation.

Every prompt includes:

- the absolute path to `${CLAUDE_PLUGIN_ROOT}/docs/review-findings.md`;
- the diff command, the untracked-file list and the commit list;
- where the code lives: the **working tree**;
- the path to the domain docs if they exist (`.agent-docs/GLOSSARY.md`, `.agent-docs/adr/`, per `${CLAUDE_PLUGIN_ROOT}/docs/workspace.md`);
- the user's language.

Plus, per reviewer:

- **standards-reviewer**: the standards sources from step 3 and the absolute path to `${CLAUDE_PLUGIN_ROOT}/docs/code-smells.md`.
- **spec-reviewer**: the spec path from step 2. Skip this reviewer if there is no spec.

**Done when:** every reviewer that runs has reported.

### 5. Aggregate

Present the reports under `## Logic`, `## Standards` and `## Spec` headings, verbatim or lightly cleaned, each with its own Open questions and Coverage. Do **not** merge or rerank findings across axes, because the axes are deliberately separate (see _Why separate axes_). Where two axes report the same place, keep both: the agreement is itself a signal.

End with a one-line summary: total findings per axis, the worst issue _within each axis_ (if any), and how many open questions wait for the user. Don't pick a single winner across axes: that's the reranking the separation exists to prevent.

**Done when:** every axis that ran is presented, and the summary line is given.

## Why separate axes

A change can pass two axes and fail the third:

- Code that follows every standard and matches the spec, but miscounts at a boundary → **Logic fail.**
- Code that follows every standard but implements the wrong thing → **Spec fail.**
- Code that does exactly what the spec asked but breaks the project's conventions → **Standards fail.**

Reporting them separately stops one axis from masking another.
