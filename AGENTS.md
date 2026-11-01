# bibleskills

An OpenCode V2 plugin backed by Markdown for Windows and macOS: adapter in `src/`, skills in `.opencode/skills/`, subagents in `.opencode/agents/bibleskills/`, shared reference in `docs/`. Run `npm run check` after changes; it includes a packed-package install/load test.

After every change to skills, agents or `docs/`, bump `version` in `package.json` (semver: patch for fixes and wording, minor for new or reworked skills, major for breaking changes like renamed or removed skills). Keep `package-lock.json` in sync. One bump per changeset.

Many skills come from [mattpocock/skills](https://github.com/mattpocock/skills). In those, apply the mechanical conventions below (headings, template wrappers, links, file names) but keep the prose and section order, so upstream changes stay mergeable. Skills authored here follow every convention.

## Skill conventions

**Language.** Instructions in English. Output to the user and artifact contents follow the user's language; template headings, metadata keys and status values stay English. Trigger phrases the user actually types may stay in their language.

**Frontmatter.**
- Model-invoked skill: `description` is "<What it does>. Use when <one trigger per distinct case>." Include the selection boundary for a confusable neighbor. Aim for ~250 characters as an editorial target, not a V2 limit; it is loaded on every turn.
- User-invoked skill: `disable-model-invocation: true` and a one-line, human-facing `description`. OpenCode hides these from automatic discovery, but explicit loading still works; use permissions for access restrictions.

**No H1.** The body starts with a 1–3 line intro saying what the skill produces; the name is already in the frontmatter.

**Three shapes.**
- *Process skill*: intro → optional `## When to use` → `## Process` → optional `## Quality criteria` → templates. Steps are `### N. Name` headings, or a numbered list when every step is a line or two. Each step ends on a completion criterion: `**Done when:** …`.
- *Reference skill* (vocabulary, rules, a method consulted on demand): free `##` sections, no Process.
- *Alias*: a one-line body that calls other skills.

**When to use.** Only in model-invoked skills with a confusable neighbour: the selection signal, a few typical phrasings, and `**Not here:**` naming the neighbour.

**Templates.** Anything the agent fills in is wrapped in an XML tag named `<name-template>`. Fenced code blocks are for examples and code only.

**Reference files.**
- Used by one skill: a sibling file named `UPPERCASE.md`, linked as `[<NAME>.md](<NAME>.md)` (replace the placeholder with its actual name).
- Shared by several skills: `docs/kebab-case.md`, referenced from a skill as `../../../docs/<name>.md`. Resolve bundled paths from the skill's base directory, not the project being worked on. Files inside `docs/` refer to each other by bare file name. Pass absolute paths to subagents.

**Where skills write.** Every project artifact (tasks, specs, tickets, research, glossary, ADRs) goes under `.agent-docs/` in the current checkout, laid out in `docs/workspace.md`. In skill prose, `GLOSSARY.md`, `GLOSSARY-MAP.md` and "ADRs" mean those files; point to `docs/workspace.md` ("Domain docs") rather than restating where they live. Ephemeral output with no project value (a handoff, an HTML report) goes to the OS temp dir.

**Composition.** Call the `skill` tool by the directory-derived ID, e.g. `grilling`; call the `subagent` tool with agent `bibleskills/task-builder`. Users select skills directly with `@<skill>`, e.g. `@grilling`. Do not add slash-command wrappers for skills.

**Platforms.** Tool commands run in the host shell (PowerShell on Windows, usually zsh on macOS). Use `shell.workdir`, quote paths and keep Bash-only scripts explicitly marked. Installer and validation code use Node.js so neither platform needs Bash for setup.
