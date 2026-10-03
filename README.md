# bibleskills

A personal [Claude Code](https://code.claude.com) plugin of engineering skills: one-question-at-a-time grilling, agent-ready tasks built from a Jira ticket or an interview, specs and tickets kept as local files, diff and branch review, bug diagnosis, and a router that tells you which skill to reach for.

## Install

The repository is its own plugin marketplace.

```text
/plugin marketplace add bibletoon/bibleskills
/plugin install bibleskills@bibleskills
```

Every skill is namespaced with the plugin prefix: `/bibleskills:<skill>`. Not sure where to start? Run `/bibleskills:which-skill`.

### Developing locally

```bash
claude --plugin-dir /path/to/bibleskills   # load this checkout for one session
```

Run `/reload-plugins` after editing, and `claude plugin validate . --strict` before committing.

## Where skills write

Everything the skills write about a project (tasks, specs, tickets, research, the glossary, ADRs) goes into **one folder, `.agent-docs/`, at the root of the current checkout**:

```text
.agent-docs/
├── GLOSSARY.md            domain glossary
├── adr/                   architecture decision records
├── research/              research not tied to a work item
└── work/<id>/             one folder per work item (Jira key or slug)
    ├── task.md  spec.md  jira.md  map.md  questionnaire.md  review.md
    ├── decisions/NN-<slug>.md   wayfinder decision tickets
    └── issues/NN-<slug>.md      build tickets
```

Commit it in projects where you want the docs versioned. Where you don't (e.g. a team repo with no shared AI conventions), ignore it locally; the rule applies to every worktree of the clone:

```bash
echo "/.agent-docs/" >> "$(git rev-parse --git-common-dir)/info/exclude"
```

Full layout and conventions: [docs/workspace.md](docs/workspace.md).

## Skills

**You** = invoked only by typing it; **Agent** = Claude can also reach for it on its own.

### Tasks and planning

| Skill | Invoked by | What it does |
|---|---|---|
| `get-task` | Agent | Builds an AI-Ready task from a Jira ticket, offers to reproduce the issue locally, grills until every field is settled |
| `create-task` | Agent | The same, starting from an interview when there's no ticket |
| `to-spec` | You | Turns the conversation into an AI-Ready spec |
| `to-tickets` | You | Splits a spec into tracer-bullet tickets with blocking edges |
| `to-jira` | You | Writes a durable ticket (behaviour and components, no paths) to paste into Jira for later |
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
| `research` | Agent | A background agent researches primary sources and leaves a cited note |

### Building and reviewing

| Skill | Invoked by | What it does |
|---|---|---|
| `implement` | You | Implements a task, spec or ticket within its constraints, cleans up, reviews and commits |
| `implement-spec` | You | Implements a whole spec: parallel subagents over the ticket graph, one integration branch |
| `ai-slop-cleaner` | Agent | Cleans AI-generated slop without changing behaviour: tests first, deletion first, one smell per pass |
| `review-diff` | Agent | Reviews your own changes against the task/spec: Standards and Spec axes |
| `review-branch` | You | Reviews a colleague's branch or GitLab MR: Logic, Standards and Task, with ready-to-post comments |
| `diagnosing-bugs` | Agent | A disciplined loop for hard bugs: build a red-capable feedback loop before theorising |
| `pr` | Agent | Shapes an MR/PR body: a minimal visual, before/after evidence, merge danger |
| `improve-codebase-architecture` | You | Surveys the codebase for deepening opportunities as an HTML report |

### Session and environment

| Skill | Invoked by | What it does |
|---|---|---|
| `which-skill` | You | Router: which skill or flow fits your situation |
| `handoff` | You | Compacts the conversation into a handoff document for another session |
| `retro` | You | A retrospective that suggests changes to the agent's environment |
| `wait-what` | You | Re-pitches the last message that didn't land |
| `wizard` | Agent | Generates an interactive bash script for steps only a human can do |
| `writing-for-agents` | Agent | How to write skills, `CLAUDE.md`/`AGENTS.md` and other docs agents read |
| `teach` | You | Teaches a topic over several sessions in a dedicated folder |

### Subagents

| Agent | Used by | What it does |
|---|---|---|
| `task-builder` | `get-task` | Fetches the Jira ticket and repo context, builds the task's core, returns a compact summary |
| `local-verifier` | `get-task`, `create-task` | Starts the project locally and reproduces the described behaviour |
| `task-critic` | `get-task`, `create-task`, `to-spec` | Reads the finished task or spec cold, without the conversation, and reports what an executor would misread, miss or get stuck on |

## Requirements

- **Git.** Everything assumes a git checkout.
- **Jira MCP server `jit`** for `get-task` and `review-branch` (fetching tickets).
- **GitLab MCP server** (optional) for `review-branch` to find the MR and its target branch; without it the base branch is inferred from the git history.
- **Bash** for `wizard` and the `diagnosing-bugs` HITL loop; on Windows, Git Bash.

## Repository layout

```text
.claude-plugin/   plugin.json, marketplace.json
skills/<name>/    SKILL.md plus any reference files used by that skill only
agents/           subagents (task-builder, local-verifier, task-critic)
docs/             reference shared by several skills (task format, task flow, workspace, code smells)
.claude/CLAUDE.md conventions for editing this repo's skills
ROADMAP.md        planned work
```

## Credits

- Most skills started from **[mattpocock/skills](https://github.com/mattpocock/skills)** by Matt Pocock (MIT; see [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md)) and have since been adapted: local files instead of an issue tracker, one-question grilling, the AI-Ready task format, plugin packaging.
- `ai-slop-cleaner` is adapted from **[oh-my-claudecode](https://github.com/Yeachan-Heo/oh-my-claudecode)** by Yeachan Heo (MIT; see [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md)).
- The `pr` skill's visuals come from [Dex Horthy](https://github.com/dexhorthy)'s `show-me` skill ([skills/pr/CREDITS.md](skills/pr/CREDITS.md)).
