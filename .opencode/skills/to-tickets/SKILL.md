---
name: to-tickets
description: Turn feature analysis, a wayfinder map or a confirmed problem conversation into one or more short, durable tracker drafts with acceptance criteria and dependencies; no source paths or private implementation details.
disable-model-invocation: true
---

Turn analysis into **durable tracker drafts**, not immediate code-edit instructions. Accept a feature discussion, a wayfinder map, a file, or a confirmed problem from any conversation; no formal starting document is required. One small piece of work needs one ticket.

Read `../../../docs/durable-ticket.md` for the format and `../../../docs/workspace.md` for storage, resolved from this skill's base directory. Drafts can live in an external tracker for months. `get-task` later turns one selected ticket into a separate local execution-time specification.

## Process

### 1. Gather context

Work from the current conversation and any supplied reference. For a wayfinder map, read relevant resolved decisions and supporting material, not every unrelated ticket. Preserve agreed behavior, constraints and non-goals; use the project's domain vocabulary and respect relevant ADRs. No intermediate specification file is required.

For an unstructured problem conversation, extract the symptom, triggering conditions, expected behavior and evidence already gathered. Distinguish a confirmed defect from a suspected cause. If confirmation is missing, ask for verification or offer an explicitly labeled investigation ticket; do not state an unverified bug as a fact. Checking or fixing code is not a side effect of drafting tickets.

**Done when:** the requested outcome and source-supported facts are clear, or missing essentials have been stated without inventing them.

### 2. Check gaps and durability

Every draft needs a concrete Problem, Actions and Definition of done. If any cannot be stated from the source, ask only about that gap (one question at a time), or return to analysis with `grilling`; do not restart a complete interview when the discussion already settled the answers.

Explore code only as far as needed to name domain components, confirm known facts or understand a public contract. Keep source paths, line numbers, private functions and implementation snippets out of the resulting ticket. A public endpoint/event/configuration key is allowed. Preserve essential decisions in the body; link supporting analysis only when it is shareable outside this checkout, never require chat history or a private local file to understand acceptance.

**Done when:** each draft can be written without guessing and will remain meaningful after internal code moves or refactors.

### 3. Draft deliverable slices and dependencies

For a feature, split work into **tracer-bullet vertical slices**; for a small confirmed problem, keep a single well-scoped ticket. Describe outcomes across the layers the change actually needs, not a mandatory schema/API/UI checklist for every task.

<vertical-slice-rules>

- Each slice delivers a narrow but complete observable outcome, rather than one horizontal technical layer
- A completed slice is demoable or verifiable on its own
- Each slice is one coherent piece of work, small enough to prepare and implement independently later
- A necessary prefactor is a separate contract-preserving outcome, not a list of current source edits

</vertical-slice-rules>

Record **Depends on** only for real prerequisites. Use an existing tracker key or the exact summary of another ticket in this draft set, not a sibling filename. Check that all draft references exist and the graph has no cycles. These are planning dependencies, not a local executor's dispatch queue.

For a wide migration, prefer **expand–contract**: introduce a compatible new form, migrate consumers in independently verifiable batches, then remove the old form once no consumer depends on it. Name contracts and domain components, not a frozen inventory of files. If no safe decomposition is known, return that uncertainty to analysis instead of promising a speculative implementation sequence.

**Done when:** one or more independently verifiable outcomes and their genuine prerequisites are identified.

### 4. Confirm the decomposition

Present the proposed breakdown as a numbered list. For each ticket, show:

- **Title**: short descriptive name
- **Depends on**: which other tickets (if any) must complete first
- **What it delivers**: the end-to-end behaviour this ticket makes work

For a new multi-ticket breakdown, ask whether the granularity and dependencies fit, one decision at a time where discussion is needed. Reuse an approval already given for the same decomposition. An explicitly requested single ticket with settled scope does not need an artificial split or another interview.

**Done when:** the breakdown is approved or the single requested outcome was already agreed.

### 5. Save and hand over drafts

Write the approved drafts using the template in `../../../docs/durable-ticket.md`, one file per ticket under `.agent-docs/work/<id>/issues/<NN>-<slug>.md`. Reuse the analyzed work item's ID, or choose a short meaningful slug. Number new files in dependency order, starting from `01` in a new set; inspect existing drafts and never overwrite or renumber them silently.

Do not add local `ready`/`claimed`/`done` status or dispatch implementation. Do not modify the source analysis as a side effect. Print the tracker-ready title and body of each draft, plus its local saved path, so the user can copy it into their tracker. Keep local paths outside the copyable ticket body.

This skill does not publish to a tracker. Publication is a separate explicit user request with destination and content confirmed; approval of a decomposition is not approval to post remote issues.

**Done when:** every draft is saved and presented, the durable-format checks hold, and no code or remote issue was changed.
