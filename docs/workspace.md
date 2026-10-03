# Workspace

Everything the skills write about a project lives in **one folder, `.agent-docs/`, at the root of the current checkout** (the worktree you're in: `git rev-parse --show-toplevel`, or the current directory outside a repo). Tasks, specs, tickets, maps, research, the glossary and ADRs all go there; skills write nowhere else in the repo. Whether `.agent-docs/` is committed or ignored is the repo's choice (a local `.git/info/exclude` entry is enough); nothing in the skills depends on it.

Skills point here instead of restating it. When a skill names `GLOSSARY.md`, `GLOSSARY-MAP.md` or "ADRs", it means the files under `.agent-docs/` below.

## Layout

```
.agent-docs/
├── GLOSSARY.md                    ← the domain glossary (single context)
├── GLOSSARY-MAP.md                ← multi-context only: points to each context's glossary
├── contexts/<context>/            ← multi-context only
│   ├── GLOSSARY.md
│   └── adr/
├── adr/
│   └── 0001-<slug>.md             ← architecture decision records
├── research/<slug>.md             ← research not tied to a work item
└── work/<id>/                     ← one directory per work item
    ├── task.md                    ← get-task / create-task
    ├── spec.md                    ← to-spec
    ├── jira.md                    ← to-jira
    ├── map.md                     ← wayfinder
    ├── questionnaire.md           ← to-questionnaire
    ├── research/<slug>.md         ← research for this item (e.g. wayfinder research tickets)
    ├── notes/                     ← scratch notes shared by subagents (e.g. implement-spec exploration)
    ├── decisions/
    │   └── 01-<slug>.md           ← wayfinder decision tickets (questions to resolve)
    └── issues/
        ├── 01-<slug>.md           ← to-tickets build tickets (work to implement)
        └── 02-<slug>.md
```

- `<id>` is the Jira key when there is one (`MYCOMM-818`), otherwise a short kebab-case slug of the work's essence (`add-status-to-orders`). An item that grows (task → spec → tickets) keeps its directory.
- Tickets are one file each, numbered from `01` in dependency order (blockers first), never a single combined file. Decision tickets (`decisions/`) and build tickets (`issues/`) are numbered independently and never mixed: a work item can hold both when a wayfinder map turns into a spec and tickets.
- Create files and directories lazily, when there is something to write.
- Write artifact contents in the language the user writes in. Template headings, metadata keys (`Status`, `Blocked by`, `Type`) and status values stay in English, so skills can parse them.

## Domain docs

### Before exploring, read these

- `.agent-docs/GLOSSARY.md`, or, if `.agent-docs/GLOSSARY-MAP.md` exists, the glossary of each context relevant to the topic.
- ADRs in `.agent-docs/adr/` (and `.agent-docs/contexts/<context>/adr/`) that touch the area you're about to work in.

If they don't exist, **proceed silently**: don't flag their absence and don't suggest creating them upfront. The `domain-modeling` skill creates them lazily when terms or decisions actually get resolved. Docs the repo itself keeps elsewhere (a README, its own `docs/`) are context to read, never a place for skills to write.

### Use the glossary's vocabulary

When your output names a domain concept (a task, a ticket title, a refactor proposal, a hypothesis, a test name), use the term as the glossary defines it. Don't drift to synonyms the glossary explicitly avoids. If the concept isn't in the glossary yet, either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `domain-modeling`).

### Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding: _"Contradicts ADR-0007 (event-sourced orders), but worth reopening because…"_

## Metadata lines

Tickets carry metadata as bold lines directly under the title:

- `**Status:**` one of `ready` → `claimed` → `done`, or `dropped`.
  - `ready`: open, can be grabbed once unblocked.
  - `claimed`: someone is working on it. Set it and save the file **before** any work, so concurrent sessions skip it.
  - `done`: resolved. Set it when the work is finished.
  - `dropped`: ruled out (e.g. out of scope); off the frontier for good.
- `**Blocked by:**` the ticket numbers that gate this one (`01, 03`), or `None`. A ticket is **unblocked** when every ticket it lists is `done` or `dropped`.
- `**Type:**` wayfinder tickets only: `research` / `prototype` / `grilling` / `task`.

The **frontier** is every ticket in one folder (`issues/` for build tickets, `decisions/` for wayfinder) that is `ready` and unblocked; lowest number first. `Blocked by` numbers refer to tickets in the same folder.

## Referring to artifacts

- Refer to another artifact by its path relative to the checkout root (`.agent-docs/work/add-status-to-orders/spec.md`), wrapped in a Markdown link where a human reads it.
- A reference a user passes (a path, an `<id>`, a ticket number within an item) resolves against `.agent-docs/work/`.
- Notes, answers and history append to the bottom of the file they concern, under a heading (`## Answer`, `## Notes`), rather than living in a separate file.
