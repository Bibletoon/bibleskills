---
name: review-branch
description: "Review someone else's branch or GitLab MR for logic bugs, standards and fit to its Jira task, with findings ranked high/med/low."
disable-model-invocation: true
---

Review a branch someone else wrote (a colleague's MR, not your own or your agent's work) on three axes: **Logic**, **Standards** and **Spec** (fit to its Jira task or MR description). Produces a report in the reply with findings grouped by severity (high / med / low) and a summary table; nothing is written to the repo. The branch is read straight from git, so your own checkout is never switched or modified; tests are CI's job, not this review's. For your own work against its spec, use `review-diff` instead.

Each axis runs as its own **reviewer agent**, in parallel. The contract they share (how to read the code, the severity scale, the finding format) is `../../../docs/review-findings.md`. Resolve bundled paths from this skill's base directory.

Talk to the user, and write the report, in the language the user writes in.

## Process

### 1. Resolve the branch and its MR

The argument is a branch name, an MR number (`!123`) or an MR URL. Run `git fetch origin` and resolve the branch as `origin/<branch>`.

If a GitLab MCP integration is available, discover its actual read-operation names and input schemas from the available catalog (through `execute` for Code Mode tools, or directly when exposed that way). Use them to find the MR: by number or URL directly, or by the open MR whose **source branch** is `<branch>`. Take its target branch, title, description and web URL. Several open MRs for one branch: ask which one. No integration or confirmed no MR: carry on without it. An authentication/permission/request failure is not proof that no MR exists: report it and ask for the MR metadata or branch before proceeding.

**Done when:** `git rev-parse origin/<branch>` succeeds, and the MR is either known or confirmed absent.

### 2. Pick the base

- An MR exists: the base is `origin/<target-branch>`.
- Otherwise take the remote branches among `main`, `master`, `develop` and `release/*` that exist, count `git rev-list --count origin/<candidate>..origin/<branch>` for each, and pick the one with the fewest commits. On a tie, ask one question with the tied candidates as options.

Show the user before going further: the base, the commit count, and the `git diff --stat <base>...origin/<branch>` summary line.

**Done when:** the base is unambiguous or confirmed, and the diff is non-empty.

### 3. Gather the task (sub-agent)

Look for a Jira key (`[A-Z]+-\d+`) in the branch name, then in the MR title and description, then in the commit messages (`git log <base>..origin/<branch>`).

- **Key found:** a sub-agent reads the ticket and comments using the shared access contract in `../../../docs/tracker-access.md` (pass its absolute path, the key and issue URL/instance if known). It discovers the installed integration and actual operation schemas, or uses a user-supplied snapshot, and returns only a brief: the essence, acceptance criteria, decisions from the comments, anything explicitly out of scope, and source/access gaps. Don't bring the raw ticket into the main context. If access is unavailable, request a pasted/exported issue or use a sufficient MR description with its source made explicit; never treat the access failure as an empty ticket.
- **No key, but the MR description states what the change should do:** use it as the brief, and say so in the report.
- **Nothing:** ask the user once for a key or a pasted description. If there is none, the Spec axis is skipped.

**Done when:** you hold a task brief, or the Spec axis is explicitly skipped.

### 4. Run the three reviewers in parallel

Call the `subagent` tool with agents `bibleskills/logic-reviewer`, `bibleskills/standards-reviewer` and `bibleskills/spec-reviewer` in parallel. If a named agent is unavailable, stop and ask the user to run the bundle's installer or `/reload`; do not bypass its read-only permissions with an unrestricted fallback. Pass only paths and facts, never the conversation.

Every prompt includes:

- the absolute path to `../../../docs/review-findings.md`;
- the diff command (`git diff --no-ext-diff --no-textconv <base>...origin/<branch>`) and the commit list;
- where the code lives: the **git ref** `origin/<branch>`, not checked out;
- the path to the domain docs in your checkout if they exist (`.agent-docs/GLOSSARY.md`, `.agent-docs/adr/`, per `../../../docs/workspace.md`);
- the user's language.

Plus, per reviewer:

- **standards-reviewer**: the repo's documented standards (`CODING_STANDARDS.md`, `CONTRIBUTING.md`, linter and formatter configs, to read at the branch's version) and the absolute path to `../../../docs/code-smells.md`.
- **spec-reviewer**: the task brief from step 3, pasted. Skip this reviewer if there is no brief.

**Done when:** every reviewer that runs has reported.

### 5. Write the report

Assemble the report from the template below. Group findings by severity, not by axis; tag each with its axis. Check each severity against the scale in `../../../docs/review-findings.md` and correct it if a reviewer got it wrong; merge duplicates reported by two axes into one finding tagged with both. Number findings across the report (1, 2, 3…) so the summary table can refer to them. Leave out empty severity sections. The summary table lists every finding, high first. Collect the reviewers' Open questions into one section, tagged by axis, and their Coverage lines into one; neither counts as a finding.

Print the report in your reply. Don't save it anywhere: the MR is the place for the findings, and the user decides which ones to post.

**Done when:** the report is printed.

<review-template>

# Review: <branch> → <base>

<MR link and title, if any> · Task: <Jira key / "MR description" / "none: Spec axis skipped"> · <N> commits, <M> files

## High

### <#>. <short title>

`<path:line>` · <Logic / Standards / Spec> · confidence: <high / medium>

<snippet>

<why it's a problem; for Spec findings, quote the task line>

## Med

<same shape>

## Low

<same shape>

## Summary

| # | Severity | Description | Location |
|---|---|---|---|
| <#> | <high / med / low> | <one line> | `<path:line>` |

## Open questions

- <Logic / Standards / Spec> · <one line: the claim or the thing declined to judge, and why it is here>

## Coverage

<one line per axis: what was read in full, what was not>

</review-template>
