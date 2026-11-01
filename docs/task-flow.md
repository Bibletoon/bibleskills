# Agent task flow

The preparation flow behind `get-task`, whether its source is a live tracker issue, export, local durable ticket, plain description or settled conversation. After initial assembly: reproduction when appropriate → unresolved-only clarification → finalization. The result is one small local specification, not a published ticket or permission to implement.

The task format (definition, template, per-field rules, general quality criteria) is in `ai-ready-task.md` next to this file. The file layout is in `workspace.md`.

Talk to the user, and write the task file's contents, in the language the user writes in.

## Context economy

The flow is long and context-hungry: **don't drag raw material into the main context**. Do any work that doesn't need a live answer from the user through a **subagent**, bringing back only a compact summary. Spawn subagents **without asking the user**. Interaction (the interview, confirmations) stays in the main context, where the conversation happens.

Before each step, judge: is it "gather / read / find / check" (→ subagent) or "ask for a decision / consent" (→ user)? Delegate every action you can without losing meaning.

## What the entry point hands to the flow

After the initial assembly you must have:

- **The task file** `.agent-docs/work/<id>/task.md`, following the template in `ai-ready-task.md` (all 9 headings), with the **core** filled in: usually Problem and Expected outcome, plus any facts that came up on their own. Grilling fills in the rest.
- **A summary** in the main context: the task's essence, whether it describes a **verifiable circumstance** (a bug, a regression, unexpected behaviour), how the project runs (if known), open questions.
- **Settled inputs**: source facts, prior answers, scope decisions and alternatives/reasons; these are carried forward, not asked again.

From here on, write gathered facts and verification results straight into the task file.

## Step A. Reproduction: a separate step before grilling

Reproduction and grilling are **two different conversations**: don't mix them, don't interleave them, don't ask reproduction questions together with grilling questions.

### Deciding whether to verify

From the summary, decide whether the task describes a verifiable circumstance and whether verifying it locally makes sense.

- **There is a circumstance**: offer verification (below). If it was already checked in this conversation, reuse the evidence when it still describes the current state; do not repeat the consent question or run without a reason.
- **There is none / verifying makes no sense** (no project, the task isn't about behaviour): skip reproduction, **tell the user explicitly why you're skipping it**, then move on to grilling.

### Verification

Ask the user **exactly one separate question** about reproduction: the marker question **`🎯 Reproduce?`** (in the user's language, e.g. `🎯 Воспроизвести?`), containing a three-point plan: what we're checking, **how the project runs**, and what counts as a successful check. The marker is not part of grilling's `❓` numbering. Ask it **as plain text**, not through `question` (that tool is only for grilling interview questions in this flow). Ask it and wait for the answer before doing anything else.

- If the run method is already in the summary, use it; otherwise find it in the repository before asking (a subagent may do this). Once the user agrees, `bibleskills/local-verifier` works out the run details.
- **Agreement** → run the verification, delegating the non-interactive steps to a subagent:
  - setup and reproduction: call the `subagent` tool with agent `bibleskills/local-verifier`. If it is missing, ask the user to install the bundle or `/reload`, rather than silently bypassing its permissions. Besides the circumstance itself and the run method, include in the prompt **every user instruction about the check** (what's already running, where to send requests, which credentials are available, what counts as success), **verbatim**: the subagent doesn't know them and won't guess them;
  - interactive steps (long-lived services, credentials, manual start): involve the user, not the subagent.
- **Refusal** → don't insist, and don't raise reproduction again.

### After verification

Record the verdict (confirmed / not confirmed / insufficient data), evidence and limitations in the task file: refine **Known facts**, **Hypotheses**, **Expected outcome**. Observations are facts; a likely cause stays a hypothesis until supported. If the symptom did not reproduce, do not encode it as a confirmed bug: settle with the user whether to prepare an investigation or supply more evidence. If reproduction was unstable or partial, suggest `@diagnosing-bugs` only when a deeper diagnostic loop is needed. That suggestion never authorizes a fix. After that, don't raise reproduction again.

**Done when:** verification ran and its results are in the task file, or it was skipped with the reason told to the user, or the user declined.

## Step B. Clarify unresolved requirements, scope and checks

By now reproduction is closed. If not, close it before grilling.

Inspect the 9 fields using the rules in `ai-ready-task.md`, applying settled inputs and reproduction results first. Call the `skill` tool with ID `grilling` for remaining decisions, one question at a time. Resolve behavioral requirements, scope/non-goals, constraints, required checks and completion criteria only where the source or conversation leaves a real gap. Empty optional fields can be consciously inapplicable without a question each. If everything is settled, skip the interview; do not ask nine mechanical questions.

**Done when:** the unresolved frontier is empty: every field is meaningfully filled or consciously inapplicable, and no requirement, scope boundary or check requires the executor to guess.

## Step C. Finalization

Update the task file per `ai-ready-task.md`. Keep the nine-heading structure but compress content to decision-rich facts, current code entry points and concrete checks; leave optional fields empty rather than adding filler or raw analysis. Include source provenance and access gaps where they affect reliability. Source links supplement the requirements, not replace them.

Then get a **fresh-eyes check**: call the `subagent` tool with agent `bibleskills/task-critic`. If it is missing, ask the user to install the bundle or `/reload`, rather than bypassing its read-only permissions. Pass it only paths, never the conversation: the absolute path to the task file, the absolute path to `ai-ready-task.md`, the repository root, the domain docs if they exist, and the user's language. Show the user its verdict and findings. The user decides what to change: apply rewrites they accept, and settle findings that need a decision with grilling questions (one at a time), not by guessing. Re-run the check only if the user asks.

Before finishing, confirm with the user that you've reached a shared understanding.

**Done when:** the task file meets the general quality criteria in `ai-ready-task.md`, every `task-critic` finding is either applied or dismissed by the user, and the user has confirmed the shared understanding.

## Flow quality criteria

On top of the general criteria in `ai-ready-task.md` and the entry point's own criteria:

- Reproduction and grilling are two separate, sequential steps: reproduction was closed (verified, or explicitly skipped with a reason) before grilling began; their questions were not mixed.
- A verifiable circumstance was checked with consent, reused from current evidence, or explicitly skipped/declined; limitations are visible in Known facts / Hypotheses / Expected outcome.
- Only unresolved decisions were grilled; the frontier is empty and the result was confirmed with the user.
- `task-critic` read the final task without the conversation, and its findings were shown to the user.
- Production code, durable source drafts and remote tracker issues remain unchanged. Hand over the path for `@implement`; do not start execution automatically.
