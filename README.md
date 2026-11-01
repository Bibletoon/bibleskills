# bibleskills

A personal [OpenCode V2](https://opencode.ai/v2/docs/) plugin for **Windows and macOS**: feature analysis, durable tracker drafts, small local agent specifications, implementation, review and bug diagnosis. A small server adapter registers 22 Markdown skills and six permission-scoped agents; their Markdown files remain the source of truth.

## Install

Requires **OpenCode 2.2.5 or newer compatible V2**. No manual clone, `npx` command or global file-copy installer is needed. The commands below work after `@bibletoon/bibleskills` is published to npm; preparing this repository does not publish it.

```sh
opencode plugin add @bibletoon/bibleskills@latest
```

Run `/reload` if the definitions are not visible yet, then select `@which-skill`. OpenCode owns the package cache and plugin lifecycle. The plugin reads its own packaged Markdown and supporting files; it does not copy agents, modify configuration, add slash commands or run setup commands on load.

### Update and remove

For a global package plugin installed with `@latest`:

```sh
opencode plugin check
opencode plugin update @bibletoon/bibleskills@latest
```

Exact versions are pinned and skipped by `plugin update`. To change a pin, change the configured package version explicitly. Remove the global entry with `opencode plugin remove @bibletoon/bibleskills@latest` (use the actual configured target if different). Plugin unload disposes its registrations; existing native definitions and unrelated configuration remain intact.

### Share with a repository

Commit this entry in the consuming repository's `opencode.jsonc`, merging with any existing configuration:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugins": ["@bibletoon/bibleskills@3.1.0"]
}
```

OpenCode installs a missing package in the background. A team updates together by changing this version in a reviewed commit; `plugin update` is a global-plugin command, not a way to rewrite the project's pin. No absolute machine-specific paths belong in the committed configuration.

### Local overrides and migration

The adapter leaves already registered native skills with matching IDs and agents under `bibleskills/` untouched. Native sources loaded later follow OpenCode's normal override/merge rules, including appended permission rules. For predictable results, supply a complete native agent rather than relying on partial entries and source-loading order. Unrelated skills and agents are untouched. The plugin registers no default model, so its subagents still inherit the parent's model.

If you previously used `npm run setup`, its copied agents and checkout-backed `skills` entry will continue to win, potentially hiding plugin updates. Before switching, back up your configuration and any local edits, then remove only that old managed `skills` entry and the old managed agents under `agents/bibleskills/`. Inspect `bibleskills-install.json` to identify them. Remove old generated command wrappers separately if present, preserving edited/unrelated commands. The plugin does not delete or migrate these files automatically.

The usual global config directory is `~/.config/opencode` on both platforms, or `$XDG_CONFIG_HOME/opencode`. On Windows, `~` normally means `C:/Users/<you>`, not `%APPDATA%`.

### Invocation and IDs

- **Skills:** select `@implement`, `@get-task PROJ-123`, `@review-diff main` or `@grilling` directly. IDs come from the skill directories; the agent calls the `skill` tool with the short ID, e.g. `grilling`.
- **Subagents:** namespaced IDs such as `bibleskills/logic-reviewer`.

There is no implicit prefix on skill IDs and no slash-command layer. Short skill IDs share OpenCode's skill registry; matching native definitions win over this plugin. Agents have their own `bibleskills/` namespace. The runtime plugin ID is `bibleskills`.

### Trackers and GitLab reviews

Use a connected integration for the source tracker in `get-task` (Jira, GitHub, GitLab or another system); Jira-backed branch reviews use the same reading contract. No server alias or tool spelling is required: the caller/agent discovers installed reading operations and their actual schemas. MCP tools normally run through Code Mode (`execute`), but directly exposed tools are supported too. An issue URL helps choose the right instance. Without access, supply issue text/export; the result identifies it as a snapshot, not a live fetch. Plain descriptions and local drafts need no tracker. See [Tracker access](docs/tracker-access.md) for discovery, approvals and fallback rules.

The task builder asks before namespaced tool actions, including MCP calls and reading MCP resource contents; it does not automatically trust an operation because its name looks read-only. This is an approval boundary, not a semantic read-only sandbox. The workflow permits only source reading, never issue mutations. For unattended use, configure a narrow allowlist for the exact verified read-tool actions from your own catalog, rather than granting all namespaced tools access.

Add a GitLab MCP integration if you want merge-request discovery; its read tools are discovered in the same way. These integrations and credentials are **not** installed by this repository. Use `opencode mcp list` to check connections and `/mcps` to sign in when needed.

### Developing locally

Install Node.js **22.19+** and Git, then clone this repository. For source checks:

```sh
npm ci --ignore-scripts
npm run check
opencode .
```

OpenCode discovers `.opencode/skills` and `.opencode/agents` automatically inside this checkout. To test the runtime adapter, use a separate project with `plugins` pointing at the absolute path to this checkout's **directory**, not to `src/index.mjs`. Skill references resolve from each packaged `SKILL.md`; dispatchers pass absolute paths to subagents.

`npm run check` validates frontmatter, IDs, references and removed integration points, then runs installer, permission, plugin lifecycle and packed-package tests. The package test packs the real tarball, installs it outside the checkout (preferring the npm cache; missing metadata may require registry access) and loads its entry point and assets. CI runs on Windows and macOS. Transform tests model the host; they are not model-driven workflow evaluations or a runtime permission sandbox proof.

Use `/reload` to refresh local definitions explicitly. The old `npm run setup` remains a checkout-backed development/legacy option, not the npm installation path: it still requires keeping this checkout in place and rerunning setup after agent changes. It is not shipped as an `npx` executable. The repository's `AGENTS.md` is for maintaining this bundle and is not shipped as instructions for consuming projects.

### Package and publish

The project is MIT-licensed (`LICENSE`); upstream copyright notices are retained in `THIRD_PARTY_LICENSES.md`. To publish `@bibletoon/bibleskills`, use an npm account named `bibletoon`, or an account with publish rights in an npm organization named `bibletoon`. A matching GitHub username does not grant npm scope ownership. Confirm your email and enable two-factor authentication for interactive publishing. Public packages need no paid private-package plan.

From the repository root, using Node.js 22.19+ and a current compatible npm CLI:

```sh
npm login --registry=https://registry.npmjs.org/
npm whoami --registry=https://registry.npmjs.org/
npm ci --ignore-scripts
npm run check
npm pack --dry-run
npm publish --access public --registry=https://registry.npmjs.org/
```

Review the pack file list before publishing: the tarball includes the adapter, Markdown skills/agents, shared docs, MIT license and third-party notices, but not tests, project instructions or an install lifecycle script. `prepublishOnly` reruns checks. Complete browser login and any 2FA prompts in your own terminal; never put credentials or tokens in chat or the repository. Verify the release with `npm view @bibletoon/bibleskills@3.1.0 version --registry=https://registry.npmjs.org/`. No publication or account configuration is performed by setup. Publishing makes the package contents public; committing/pushing to GitHub alone does not publish to npm.

For later releases, update the version in `package.json` and `package-lock.json`, run the checks and publish again. A published name/version cannot be overwritten. On each other device, install OpenCode and run the installation command above; public package consumption needs no npm login, checkout or copied npm token. Configure that device's model providers and tracker integrations separately: the plugin contains no accounts or credentials.

### Permission boundaries

All six agents explicitly use `mode: subagent`. The task critic has only file-inspection access. Reviewers deny editing and allow selected Git inspection commands; they cannot launch another agent or fall back to arbitrary shell execution. The local verifier asks for shell approval and cannot use editing tools. The task builder's editing tools are restricted to `.agent-docs/work/*/task.md`; its MCP calls require approval by default, and shell/delegation/image generation remain denied.

These are tool permission boundaries, not an OS sandbox: an approved setup/test command can still have side effects. Do not approve commands against production data. A missing configured agent is a setup error, not a reason to silently substitute an unrestricted agent.

## Where skills write

Everything the skills write about a project (tasks, specs, tickets, research, the glossary, ADRs) goes into **one folder, `.agent-docs/`, at the root of the current checkout**:

```text
.agent-docs/
├── GLOSSARY.md            domain glossary
├── adr/                   architecture decision records
├── research/              research not tied to a work item
└── work/<id>/             one folder per work item (tracker key or slug)
    ├── task.md                 local specification from get-task
    ├── map.md  questionnaire.md
    ├── decisions/NN-<slug>.md   wayfinder decision tickets
    └── issues/NN-<slug>.md      durable tracker drafts, not an execution queue
```

Commit it in projects where you want the docs versioned. Where you don't (e.g. a team repo with no shared AI conventions), ignore it locally; the rule applies to every worktree of the clone:

macOS:

```sh
echo "/.agent-docs/" >> "$(git rev-parse --git-common-dir)/info/exclude"
```

Windows (PowerShell):

```powershell
Add-Content -LiteralPath (Join-Path (git rev-parse --git-common-dir) 'info/exclude') -Value '/.agent-docs/'
```

Full layout and conventions: [docs/workspace.md](docs/workspace.md).

## Three workflows

1. **Feature → tracker:** analysis in conversation or `@wayfinder` → `@to-tickets` → separately confirmed publication. One draft per outcome; no mandatory intermediate specification. Durable tickets describe Problem, Actions and Definition of done using behavior, domain components and public contracts, without source paths, lines or private implementation snippets.
2. **Received task → code:** tracker reference, export, local draft or description → `@get-task` → `.agent-docs/work/<id>/task.md` → `@implement <task.md>`. Preparation checks current code and clarifies only unresolved requirements, scope and checks; implementation works from that one local specification, then cleans, reviews and verifies the final state.
3. **Suspected problem → ticket:** any conversation → ordinary verification and localization → confirmed finding → `@to-tickets` → separately confirmed publication. No dedicated verification skill or mandatory intermediate document. Verification-only requests never silently become code fixes; uncertainty stays explicit, or becomes an agreed investigation ticket.

[Durable tickets](docs/durable-ticket.md) may wait in a tracker for months. [Local specifications](docs/ai-ready-task.md) contain current code details and the existing nine-heading AI-Ready format. `get-task` does not rewrite the durable source or mutate tracker issues. Legacy local artifacts are not automatically deleted or converted.

## Skills

**You** = omitted from automatic discovery, normally started explicitly; **Agent** = OpenCode can also discover and load it on its own. Visibility flags are not access controls.

### Selection boundaries

- `get-task` requires intent to **prepare a small local specification for an agent**, regardless of source. A key mentioned as background does not choose the workflow. Implementation, review, verification and issue summaries stay those requests. `to-tickets` instead produces durable drafts for later, not executable source-edit instructions.
- `diagnosing-bugs` is for unexplained regressions, flakes, performance regressions and failures that survived an initial fix, not every compiler/configuration error.
- `research` produces a saved, cited note for a research question; a quick documentation lookup or local code search does not need that artifact.
- `codebase-design` supplies design vocabulary and methods. Loading it is not permission to survey or refactor the repository.

### Tasks and planning

| Skill | Invoked by | What it does |
|---|---|---|
| `get-task` | Agent | Prepares one local task.md from a tracker reference, snapshot, local draft or description; clarifies gaps and gets a cold review |
| `to-tickets` | You | Turns analysis or a confirmed problem into one or more durable tracker drafts with acceptance criteria and dependencies |
| `wayfinder` | You | Charts a huge, foggy effort as a map of decision tickets and resolves them one per session |
| `to-questionnaire` | You | Writes a questionnaire for someone who holds the answer you lack |

### Thinking and domain

| Skill | Invoked by | What it does |
|---|---|---|
| `grilling` | Agent | The interview primitive: one question at a time, with ready answer options |
| `grill-with-docs` | You | A grilling session that records glossary terms and ADRs as it goes |
| `domain-modeling` | Agent | Sharpens domain language; maintains `GLOSSARY.md` and ADRs |
| `codebase-design` | Agent | Deep-module vocabulary: module, interface, depth, seam, adapter |
| `prototype` | Agent | A throwaway prototype (logic demo or UI variants) to settle a design question |
| `research` | Agent | Investigates a concrete question against primary sources and saves a cited note |

### Building and reviewing

| Skill | Invoked by | What it does |
|---|---|---|
| `implement` | You | Implements one prepared local task.md, cleans its changes, reviews against a captured baseline, then freshly verifies criteria and the full test suite |
| `ai-slop-cleaner` | Agent | Cleans AI-generated slop without changing behaviour: tests first, deletion first, one smell per pass |
| `review-diff` | Agent | Reviews your own changes against the task/spec: Logic, Standards and Spec axes, each a reviewer agent |
| `review-branch` | You | Reviews a colleague's branch or GitLab MR: Logic, Standards and Spec, findings ranked high/med/low with a summary table, printed in the reply |
| `diagnosing-bugs` | Agent | A disciplined loop for hard bugs: build a red-capable feedback loop before theorising |
| `improve-codebase-architecture` | You | Surveys the codebase for deepening opportunities as an HTML report |

### Session and environment

| Skill | Invoked by | What it does |
|---|---|---|
| `which-skill` | You | Router: which skill or flow fits your situation |
| `handoff` | You | Compacts the conversation into a handoff document for another session |
| `retro` | You | A retrospective that suggests changes to the agent's environment |
| `wait-what` | You | Re-pitches the last message that didn't land |
| `writing-for-agents` | Agent | How to write skills, `AGENTS.md` and other docs agents read |
| `teach` | You | Teaches a topic over several sessions in a dedicated folder |

### Subagents

| Agent | Used by | What it does |
|---|---|---|
| `task-builder` | `get-task` | Reads the selected tracker/snapshot/local/description source, inspects relevant code and builds the local specification's core |
| `local-verifier` | `get-task`; verification when delegated | Starts the project locally with consent and checks the described behavior, without fixing code |
| `task-critic` | `get-task` | Reads a local specification cold and reports what an executor would misread, miss or get stuck on; not a durable-ticket reviewer |
| `logic-reviewer` | `review-diff`, `review-branch` | The Logic axis: bugs, edge cases, failure paths, concurrency, security, compatibility of changed contracts |
| `standards-reviewer` | `review-diff`, `review-branch` | The Standards axis: the repo's documented standards plus the smell baseline in `docs/code-smells.md` |
| `spec-reviewer` | `review-diff`, `review-branch` | The Spec axis: missing/partial requirements, scope creep and implemented-but-wrong, against the local specification or explicitly selected tracker/MR brief |

## Requirements

- **OpenCode 2.2.5+**, compatible V2, on Windows or macOS. The adapter targets `@opencode/plugin` 2.2.5. Interactive interviews need a client that supports `question`; otherwise the skill uses plain text.
- **Node.js 22.19+** only for developing, packaging or using the legacy installer. Normal plugin installation is managed by OpenCode.
- **Git.** Everything assumes a git checkout.
- **A source-tracker integration** for live issue reads in `get-task` (Jira-capable for Jira-backed `review-branch`), or user-supplied text/export. No connection is required for local drafts or plain descriptions; no fixed server alias is assumed.
- **GitLab MCP server** (optional) for `review-branch` to find the MR and its target branch; without it the base branch is inferred from the git history.
- **Bash** only for the optional `diagnosing-bugs` HITL template: `/bin/bash` on macOS, Git Bash on Windows. The existing interactive template is not a non-interactive OpenCode shell harness; run it in your own terminal when using it. Other commands must match the host shell (PowerShell on Windows, usually zsh on macOS).

## Repository layout

```text
.opencode/skills/<name>/       SKILL.md and skill-specific references/scripts
.opencode/agents/bibleskills/  six subagent definitions and their V2 permissions
src/index.mjs                 V2 server plugin adapter
docs/                         shared task format, flow, workspace, review and verification references
scripts/                      shared loader helpers, legacy installer and validator
test/                         Node.js tests (temporary config and consumer directories)
.github/workflows/check.yml   Windows/macOS checks
AGENTS.md                     conventions for maintaining this bundle
package.json                  bundle version, dependencies and check/setup commands
```

## Credits

- Most skills started from **[mattpocock/skills](https://github.com/mattpocock/skills)** by Matt Pocock (MIT; see [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md)) and have since been adapted: local files instead of an issue tracker, one-question grilling, the AI-Ready task format, plugin packaging.
- `ai-slop-cleaner` is adapted from **[oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode)** by Yeachan Heo (MIT; see [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md)).
