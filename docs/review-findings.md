# Review findings

The shared contract between the review skills (`review-diff`, `review-branch`) and the reviewer agents (`logic-reviewer`, `standards-reviewer`, `spec-reviewer`): how to read the code under review, how to grade a finding, and the shape every finding takes. Skills pass this file's absolute path to each reviewer instead of restating it; the skill that called the reviewers assembles their findings into its own report.

## Reading the code

The caller names the diff command, the commit list, and where the code lives:

- **Working tree**: the changes are checked out. Read files directly.
- **Git ref** (`origin/<branch>`): the branch is not checked out and must not be. Read a file with `git show <ref>:<path>`, search with `git grep -n <pattern> <ref>`, list files with `git ls-tree -r --name-only <ref>`.

Read whole files at the reviewed version, not just hunks: a hunk is the starting point, not the evidence. Follow the callers of anything whose contract changed. Report only findings you verified against the code. Never modify the repository.

## Severity

- **high**: a critical defect that must be fixed: a bug, wrong behaviour, a security hole, a broken contract, a requirement missing or implemented wrong.
- **med**: worth fixing: an architectural problem, a suboptimal or fragile implementation, a missing edge case with limited impact, scope creep.
- **low**: fix if there is time: code style, naming, small readability issues.

## Confidence

`high` or `medium`. Drop anything lower: a finding you cannot point to in the code is not a finding.

## Finding format

One entry per finding, highest severity first:

- severity (`high` / `med` / `low`), confidence (`high` / `medium`), axis (`Logic` / `Standards` / `Spec`);
- `path:line` at the reviewed version;
- a short title;
- the relevant snippet, up to ~8 lines;
- why it is a problem. A Spec finding quotes the spec line it fails. A Standards finding cites the rule (file and rule) for a documented-standard breach, or names the baseline smell and says it is a judgement call.

Write in the language the caller names. Keep the whole report under ~500 words. If nothing is found, say so in one line rather than inventing nits.
