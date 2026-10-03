# Agent task flow

The shared flow behind two entry points: `get-task` (a task from a Jira ticket) and `create-task` (a task from interviewing the user). The entry point does the **initial assembly** and hands control here; from then on the flow is the same: reproduction → grilling → finalization. Entry points read this file instead of duplicating it.

The task format (definition, template, per-field rules, general quality criteria) is in `ai-ready-task.md` next to this file. The file layout is in `workspace.md`.

Talk to the user, and write the task file's contents, in the language the user writes in.

## Context economy

The flow is long and context-hungry: **don't drag raw material into the main context**. Do any work that doesn't need a live answer from the user through a **subagent**, bringing back only a compact summary. Spawn subagents **without asking the user**. Interaction (the interview, confirmations) stays in the main context, where the conversation happens.

Before each step, judge: is it "gather / read / find / check" (→ subagent) or "ask for a decision / consent" (→ user)? Delegate every action you can without losing meaning.

## What the entry point hands to the flow

After the initial assembly you must have:

- **The task file** `.agent-docs/work/<id>/task.md`, following the template in `ai-ready-task.md` (all 9 headings), with the **core** filled in: usually Problem and Expected outcome, plus any facts that came up on their own. Grilling fills in the rest.
- **A summary** in the main context: the task's essence, whether it describes a **verifiable circumstance** (a bug, a regression, unexpected behaviour), how the project runs (if known), open questions.
- **Grilling inputs**: what's already settled (the ticket, the interview answers); these are not asked again.

From here on, write gathered facts and verification results straight into the task file.

## Step A. Reproduction: a separate step before grilling

Reproduction and grilling are **two different conversations**: don't mix them, don't interleave them, don't ask reproduction questions together with grilling questions.

### Deciding whether to verify

From the summary, decide whether the task describes a verifiable circumstance and whether verifying it locally makes sense.

- **There is a circumstance**: run the verification (below).
- **There is none / verifying makes no sense** (no project, the task isn't about behaviour): skip reproduction, **tell the user explicitly why you're skipping it**, then move on to grilling.

### Verification

Ask the user **exactly one separate question** about reproduction: the marker question **`🎯 Reproduce?`** (in the user's language, e.g. `🎯 Воспроизвести?`), containing a three-point plan: what we're checking, **how the project runs**, and what counts as a successful check. The marker is not part of grilling's `❓` numbering. Ask it **as plain text**, not through `AskUserQuestion` (that tool is only for grilling interview questions). Ask it and wait for the answer before doing anything else.

- If the run method is already in the summary, use it; otherwise find it in the repository before asking (a subagent may do this). Once the user agrees, `bibleskills:local-verifier` works out the run details.
- **Agreement** → run the verification, delegating the non-interactive steps to a subagent:
  - setup and reproduction: call the agent `bibleskills:local-verifier` (fallback: general-purpose with the equivalent instruction "start the project and reproduce the described circumstance"). Besides the circumstance itself and the run method, include in the prompt **every user instruction about the check** (what's already running, where to send requests, which credentials are available, what counts as success), **verbatim**: the subagent doesn't know them and won't guess them;
  - interactive steps (long-lived services, credentials, manual start): involve the user, not the subagent.
- **Refusal** → don't insist, and don't raise reproduction again.

### After verification

Record the results (did it reproduce, the evidence, the likely cause) in the task file: refine **Known facts**, **Hypotheses**, **Expected outcome**. If reproduction was unstable or partial, or the cause stayed unclear, say so plainly and suggest `/bibleskills:diagnosing-bugs` rather than recording a guess as the cause; the user decides. After that, don't raise reproduction again.

**Done when:** verification ran and its results are in the task file, or it was skipped with the reason told to the user, or the user declined.

## Step B. Grilling to full resolution (interactive)

By now reproduction is closed. If not, close it before grilling.

Call the Skill tool with `bibleskills:grilling` (if the Skill tool is unavailable, read `../skills/grilling/SKILL.md` relative to this file) and run the interview over the decision tree of the task's 9 fields (field rules in `ai-ready-task.md`). Grilling's inputs are what the entry point handed over plus the verification results.

**Done when:** the grilling frontier is empty: every one of the 9 fields is either filled or consciously confirmed as not applicable.

## Step C. Finalization

Update the task file: fill, structure and quality per `ai-ready-task.md`.

Then get a **fresh-eyes check**: call the agent `bibleskills:task-critic` (fallback: a general-purpose subagent given `../agents/task-critic.md` (relative to this file) as its instructions, only if the named agent is unavailable). Pass it only paths, never the conversation: the absolute path to the task file, the absolute path to `ai-ready-task.md`, the repository root, the domain docs if they exist, and the user's language. Show the user its verdict and findings. The user decides what to change: apply rewrites they accept, and settle findings that need a decision with grilling questions (one at a time), not by guessing. Re-run the check only if the user asks.

Before finishing, confirm with the user that you've reached a shared understanding.

**Done when:** the task file meets the general quality criteria in `ai-ready-task.md`, every `task-critic` finding is either applied or dismissed by the user, and the user has confirmed the shared understanding.

## Flow quality criteria

On top of the general criteria in `ai-ready-task.md` and the entry point's own criteria:

- Reproduction and grilling are two separate, sequential steps: reproduction was closed (verified, or explicitly skipped with a reason) before grilling began; their questions were not mixed.
- The verifiable circumstance (if any) was checked locally, and the findings are reflected in Known facts / Hypotheses / Expected outcome.
- Grilling finished per the `grilling` skill's rules (the frontier is empty); the result was confirmed with the user.
- `task-critic` read the final task without the conversation, and its findings were shown to the user.
