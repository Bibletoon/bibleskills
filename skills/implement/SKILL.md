---
name: implement
description: "Implement a piece of work based on a spec or set of tickets."
disable-model-invocation: true
---

Implement the work described by the user in the spec or tickets.

Specs and tickets are AI-Ready tasks (`${CLAUDE_PLUGIN_ROOT}/docs/ai-ready-task.md`): stay within their **Constraints** and **Non-goals**, run every **Required check**, and stop at their **Stop conditions**.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

Once done, call the Skill tool with `bibleskills:ai-slop-cleaner`, scoped to the files this work changed, then `bibleskills:review-diff` to review the work and fix what it finds.

**Done when:** the task's completion criteria hold, if it has any (its **Expected outcome**, **Required checks** and **Stop conditions**, each verified with fresh output, not from memory), and the full test suite passes. Report the evidence for both; if either does not hold, say so and keep working or stop with the reason.
