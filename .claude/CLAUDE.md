# bibleskills

A Claude Code plugin: skills in `skills/`, subagents in `agents/`, shared reference in `docs/`. `ROADMAP.md` tracks planned work. Run `claude plugin validate . --strict` after changes.

Many skills come from [mattpocock/skills](https://github.com/mattpocock/skills). In those, apply the mechanical conventions below (headings, template wrappers, links, file names) but keep the prose and section order, so upstream changes stay mergeable. Skills authored here follow every convention.

## Skill conventions

**Language.** Instructions in English. Output to the user and artifact contents follow the user's language; template headings, metadata keys and status values stay English. Trigger phrases the user actually types may stay in their language.

**Frontmatter.**
- Model-invoked skill: `description` is "<What it does>. Use when <one trigger per distinct case>." Aim for ~250 characters; it is loaded on every turn.
- User-invoked skill: `disable-model-invocation: true` and a one-line, human-facing `description`. The model cannot call these through the Skill tool, so no other skill may depend on one.

**No H1.** The body starts with a 1–3 line intro saying what the skill produces; the name is already in the frontmatter.

**Three shapes.**
- *Process skill*: intro → optional `## When to use` → `## Process` → optional `## Quality criteria` → templates. Steps are `### N. Name` headings, or a numbered list when every step is a line or two. Each step ends on a completion criterion: `**Done when:** …`.
- *Reference skill* (vocabulary, rules, a method consulted on demand): free `##` sections, no Process.
- *Alias*: a one-line body that calls other skills.

**When to use.** Only in model-invoked skills with a confusable neighbour: the selection signal, a few typical phrasings, and `**Not here:**` naming the neighbour.

**Templates.** Anything the agent fills in is wrapped in an XML tag named `<name-template>`. Fenced code blocks are for examples and code only.

**Reference files.**
- Used by one skill: a sibling file named `UPPERCASE.md`, linked as `[NAME.md](NAME.md)`.
- Shared by several skills: `docs/kebab-case.md`, referenced as `` `${CLAUDE_PLUGIN_ROOT}/docs/name.md` ``. Files inside `docs/` refer to each other by bare file name.

**Where skills write.** Every project artifact (tasks, specs, tickets, research, glossary, ADRs) goes under `.agent-docs/` in the current checkout, laid out in `docs/workspace.md`. In skill prose, `GLOSSARY.md`, `GLOSSARY-MAP.md` and "ADRs" mean those files; point to `docs/workspace.md` ("Domain docs") rather than restating where they live. Ephemeral output with no project value (a handoff, an HTML report) goes to the OS temp dir.

**Composition.** Call other skills and agents by their plugin-prefixed name: "Call the Skill tool with `bibleskills:grilling`", agent `bibleskills:task-builder`.
