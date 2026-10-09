# Review findings

The shared contract between the review skills (`review-diff`, `review-branch`) and the reviewer agents (`logic-reviewer`, `standards-reviewer`, `spec-reviewer`): how to read the code under review, what counts as a finding, how to grade it, and the shape every finding takes. Skills pass this file's absolute path to each reviewer instead of restating it; the skill that called the reviewers assembles their findings into its own report.

## Reading the code

The caller names the diff command, the commit list, and where the code lives:

- **Working tree**: the changes are checked out, and may include uncommitted work. Read files directly; a file in the caller's untracked list is new and has no hunk, so read it in full.
- **Git ref** (`origin/<branch>`): the branch is not checked out and must not be. Read a file with `git show <ref>:<path>`, search with `git grep -n <pattern> <ref>`, list files with `git ls-tree -r --name-only <ref>`.

Read whole files at the reviewed version, not just hunks: a hunk is the starting point, not the evidence. Follow the callers of anything whose contract changed. Never modify the repository.

## Before you write a finding

State the claim to yourself in four parts. If one part is missing, it is not a finding yet:

1. **What is wrong**: the concrete behaviour, not the pattern ("the loop skips the last element", not "off-by-one risk").
2. **How it triggers**: the input, state or sequence that reaches it. For a security finding, who the attacker is and the path they take; a vulnerability without a threat model is not a finding.
3. **What happens then**: the consequence for the system or the person using it.
4. **The line that makes it true**: the `path:line` you can quote. "The pattern looks dangerous" and "similar code was wrong elsewhere" are leads to verify, not evidence.

Grade by the consequence, not by the text: a reasonable person's expectation of the software is a requirement, and a spec's silence is not permission. Something the spec never mentions but any user would expect belongs in the findings; something you are unsure the spec intends belongs in Open questions.

## Not a finding

Leave these out of the findings, whatever the severity would have been:

- code the diff did not touch (pre-existing problems; mention one at most in Open questions if it is severe and the change made it reachable);
- anything the formatter, linter or type checker will catch;
- a behaviour change the spec or the commit messages say is intended;
- "consider adding …" with no failure the addition prevents;
- a rule you attribute to a standards file that does not literally contain it;
- a suppressed warning (`lint-ignore`, `noqa`, `@ts-ignore`) with a reason given next to it;
- style preferences the repo does not document.

## Severity

- **high**: a critical defect that must be fixed: a bug, wrong behaviour, a security hole, a broken contract, a requirement missing or implemented wrong.
- **med**: worth fixing: an architectural problem, a suboptimal or fragile implementation, a missing edge case with limited impact, scope creep.
- **low**: fix if there is time: code style, naming, small readability issues.

## Confidence

Confidence is about what you verified, not how you feel:

- **high**: you traced the trigger through the code at the reviewed version and can quote the line that makes the claim true.
- **medium**: the code strongly suggests it, but one step is unverified (a caller you could not find, a runtime value you could not confirm). Name that step in the finding.

A claim you could not verify at all does not become a `low` finding: a `high` or `med` severity claim at low confidence goes to **Open questions**; anything else is dropped.

## Finding format

One entry per finding, highest severity first:

- severity (`high` / `med` / `low`), confidence (`high` / `medium`), axis (`Logic` / `Standards` / `Spec`);
- `path:line` at the reviewed version;
- a short title;
- the relevant snippet, up to ~8 lines;
- why it is a problem, as the four parts above. A Spec finding quotes the spec line it fails. A Standards finding cites the rule (file and rule) for a documented-standard breach, or names the baseline smell and says it is a judgement call.

After the findings, two short sections:

- **Open questions**: one line each, with the reason: a serious claim you could not verify, something the spec is silent on and you declined to judge, a pre-existing problem the change made reachable. They are for the human to decide, and never count as findings.
- **Coverage**: one line: what you read in full, and what you did not get to.

Write in the language the caller names. Keep the whole report under ~500 words. If nothing is found, say so in one line rather than inventing nits.
