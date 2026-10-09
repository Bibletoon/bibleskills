---
name: implement
description: "Implement a piece of work based on a spec or set of tickets."
disable-model-invocation: true
---

Implement the work described by the user in the spec or tickets.

Specs and tickets are AI-Ready tasks (`${CLAUDE_PLUGIN_ROOT}/docs/ai-ready-task.md`): stay within their **Constraints** and **Non-goals**.

Run typechecking and single test files regularly.

Once done, call the Skill tool with `bibleskills:ai-slop-cleaner`, scoped to the files this work changed, then `bibleskills:review-diff` to review the work and fix what it finds.

**Done when:** the task's completion criteria hold, if it has any (its **Expected outcome**, **Required checks** and **Stop conditions**), and the full test suite passes, each proven by evidence as `${CLAUDE_PLUGIN_ROOT}/docs/verification.md` defines it and shown in its verification report at the end of your reply. If either does not hold, say so in that report and keep working, or stop with the reason.
