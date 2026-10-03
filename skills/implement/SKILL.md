---
name: implement
description: "Implement a piece of work based on a spec or set of tickets."
disable-model-invocation: true
---

Implement the work described by the user in the spec or tickets.

Specs and tickets are AI-Ready tasks (`${CLAUDE_PLUGIN_ROOT}/docs/ai-ready-task.md`): stay within their **Constraints** and **Non-goals**, run every **Required check**, and stop at their **Stop conditions**.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

Once done, call the Skill tool with `bibleskills:ai-slop-cleaner`, scoped to the files this work changed, then `bibleskills:review-diff` to review the work.

Commit your work to the current branch.
