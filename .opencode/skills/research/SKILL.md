---
name: research
description: Investigate a research question using primary sources and save a cited note. Use when asked to research a topic or gather documented API facts for a decision. Not for a quick lookup, local code navigation or a live interview.
---

Produce a cited research note for a concrete question. Use when the user asks for an investigation or a calling workflow needs one as a saved input to a decision. A routine one-link lookup or search for a local function does not need a research artifact; read or search directly. A live clarification of the user's preferences belongs to `grilling`.

Spin up a **background agent** to do the research, so you keep working while it reads.

Its job:

1. Investigate the question against **primary sources** (official docs, source code, specs, first-party APIs), not a secondary write-up of them. Follow every claim back to the source that owns it.
2. Write the findings to a single Markdown file, citing each claim's source.
3. Save it to `.agent-docs/work/<id>/research/<slug>.md` when it serves a work item, otherwise to `.agent-docs/research/<slug>.md` (layout in `../../../docs/workspace.md`, resolved from this skill's base directory), and say where.
