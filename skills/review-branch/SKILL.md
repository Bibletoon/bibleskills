---
name: review-branch
description: "Review someone else's branch or GitLab MR for logic bugs, standards and fit to its Jira task, with ready-to-post comments."
argument-hint: "<branch | MR number or URL>"
disable-model-invocation: true
---

Review a branch someone else wrote (a colleague's MR, not your own or your agent's work) on three axes: **Logic**, **Standards** and **Task**. Produces a report with severities and comments ready to post for the author, saved under `.agent-docs/`. The branch is read straight from git, so your own checkout is never switched or modified; tests are CI's job, not this review's. For your own work against its spec, use `review-diff` instead.

Talk to the user, and write the report and its comments, in the language the user writes in.

## Process

### 1. Resolve the branch and its MR

The argument is a branch name, an MR number (`!123`) or an MR URL. Run `git fetch origin` and resolve the branch as `origin/<branch>`.

If a GitLab MCP server is available, use its merge-request tools to find the MR: by number or URL directly, or by the open MR whose **source branch** is `<branch>`. Take its target branch, title, description and web URL. Several open MRs for one branch: ask which one. No GitLab MCP, or no MR: carry on without it.

**Done when:** `git rev-parse origin/<branch>` succeeds, and the MR is either known or confirmed absent.

### 2. Pick the base

- An MR exists: the base is `origin/<target-branch>`.
- Otherwise take the remote branches among `main`, `master`, `develop` and `release/*` that exist, count `git rev-list --count origin/<candidate>..origin/<branch>` for each, and pick the one with the fewest commits. On a tie, ask one question with the tied candidates as options.

Show the user before going further: the base, the commit count, and the `git diff --stat <base>...origin/<branch>` summary line.

**Done when:** the base is unambiguous or confirmed, and the diff is non-empty.

### 3. Gather the task (sub-agent)

Look for a Jira key (`[A-Z]+-\d+`) in the branch name, then in the MR title and description, then in the commit messages (`git log <base>..origin/<branch>`).

- **Key found:** a sub-agent fetches the ticket through the `jit` MCP server (`jira_get_issue` + comments) and returns only a brief: the essence, acceptance criteria, decisions from the comments, anything explicitly out of scope. Don't bring the raw ticket into the main context.
- **No key, but the MR description states what the change should do:** use it as the task, and say so in the report.
- **Nothing:** ask the user once for a key or a pasted description. If there is none, the Task axis is skipped.

**Done when:** you hold a task brief, or the Task axis is explicitly skipped.

### 4. Run the three axes in parallel sub-agents

Every prompt includes: the branch ref `origin/<branch>`, the diff command (`git diff <base>...origin/<branch>`), the commit list, and the path to the domain docs in your checkout if they exist (`.agent-docs/GLOSSARY.md` and ADRs, per `${CLAUDE_PLUGIN_ROOT}/docs/workspace.md`). And these shared rules:

> Read whole files at the branch's version, not just hunks: a hunk is the starting point, not the evidence. Don't check the branch out; read it from git: `git show origin/<branch>:<path>` for a file, `git grep -n <pattern> origin/<branch>` to search (e.g. callers of a changed function), `git ls-tree -r --name-only origin/<branch>` to list files. Report only findings you verified against the code. For each finding give: severity (`blocker` / `should fix` / `nit`), confidence (`high` / `medium`; drop anything lower), `path:line` at the branch's version, the relevant snippet (up to ~8 lines), why it is a problem, and a comment ready to post for the author: polite, concrete, in <the user's language>. Under 500 words.

- **Logic:** bugs and wrong behaviour, unhandled edge cases (empty, null, boundaries, large inputs), error handling and failure paths, concurrency and ordering, resource leaks, security (injection, authz, secrets, unsafe input), backward compatibility of changed contracts (APIs, schemas, migrations, configs).
- **Standards:** the repo's documented standards (`CODING_STANDARDS.md`, `CONTRIBUTING.md`, linter and formatter configs, read at the branch's version) plus the smell baseline at `${CLAUDE_PLUGIN_ROOT}/docs/code-smells.md` (pass its absolute path). Cite the rule for documented-standard breaches; baseline smells are always judgement calls and a documented repo standard overrides them. Skip anything tooling enforces.
- **Task** (only with a task brief): requirements missing or partial; behaviour nobody asked for (scope creep); requirements that look implemented but wrong. Quote the task line for each finding.

**Done when:** every axis that runs has reported.

### 5. Write the report

Assemble the report from the template below. Keep each axis's findings in its own section, ordered by severity within it; don't merge or rerank across axes. If `.agent-docs/work/<id>/review.md` already exists (a re-review after fixes), compare against it first and fill the "Since last review" section.

Save to `.agent-docs/work/<id>/review.md` (`<id>` the Jira key, otherwise a slug of the branch name; layout in `${CLAUDE_PLUGIN_ROOT}/docs/workspace.md`), and print it in your reply.

**Done when:** the report is saved and printed.

<review-template>

# Review: <branch> → <base>

<MR link and title, if any> · Task: <Jira key / "MR description" / "none"> · <N> commits, <M> files

## Summary

- Logic: <n> findings (<b> blockers) · Standards: <n> · Task: <n or "skipped: no task">
- Blockers:
  - <one line each, pointing at the finding below>

## Since last review

<only on a re-review: fixed / still open / new>

## Logic

### <severity> · <path:line> · <short title>

<snippet>

<why it's a problem> (confidence: <high/medium>)

> <comment ready to post for the author>

## Standards

<same shape>

## Task

<same shape, each finding quoting the task line>

</review-template>
