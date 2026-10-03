---
name: research
description: Investigate a question against high-trust primary sources and capture the findings as a Markdown file in .agent-docs. Use when the user wants a topic researched, docs or API facts gathered, or reading legwork delegated to a background agent.
---

Spin up a **background agent** to do the research, so you keep working while it reads.

Its job:

1. Investigate the question against **primary sources** (official docs, source code, specs, first-party APIs), not a secondary write-up of them. Follow every claim back to the source that owns it.
2. Write the findings to a single Markdown file, citing each claim's source.
3. Save it to `.agent-docs/work/<id>/research/<slug>.md` when it serves a work item, otherwise to `.agent-docs/research/<slug>.md` (layout in `${CLAUDE_PLUGIN_ROOT}/docs/workspace.md`), and say where.
