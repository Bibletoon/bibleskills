---
name: implement
description: "Implement a piece of work based on a spec or set of tickets."
disable-model-invocation: true
---

Implement the work described by the user in the spec or tickets.

Specs and tickets are AI-Ready tasks (`${CLAUDE_PLUGIN_ROOT}/docs/ai-ready-task.md`): stay within their **Constraints** and **Non-goals**, run every **Required check**, and stop at their **Stop conditions**.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

Once done, call the Skill tool with `bibleskills:ai-slop-cleaner`, scoped to the files this work changed, then `bibleskills:review-diff` to review the work and fix what it finds.

Before claiming the work is done, pass the gate in `${CLAUDE_PLUGIN_ROOT}/docs/verification.md`: for the task's completion criteria, if it has any (its **Expected outcome**, **Required checks** and **Stop conditions**), and for the full test suite. Each claim needs a command run after the last edit and its output read; a subagent's report, an earlier run or "should pass" is not evidence.

**Done when:** every criterion of the task holds and the full test suite passes, both shown in the verification report from `${CLAUDE_PLUGIN_ROOT}/docs/verification.md` at the end of your reply. If either does not hold, say so in that report and keep working, or stop with the reason.
