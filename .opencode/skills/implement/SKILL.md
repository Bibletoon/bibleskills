---
name: implement
description: Implement one prepared local task.md within its scope, then clean, review and verify the final state.
disable-model-invocation: true
---

Implement **one prepared local specification**, not a durable tracker draft or a ticket graph. Read `../../../docs/ai-ready-task.md`, `../../../docs/workspace.md` and `../../../docs/verification.md`, resolved from this skill's base directory.

## Process

### 1. Select and validate the specification

Use the supplied local `task.md`, or the one unambiguously prepared in this conversation. If several could apply, ask which one. A tracker reference, ordinary description or draft under `issues/` must first go through `get-task`; offer that preparation rather than silently treating it as an executable specification. Existing user documents are not automatically converted or deleted.

Read the file in full and relevant domain docs. Confirm the task's current code references, constraints, non-goals and checks are usable. Resolve stale references or missing requirements with the user before coding; do not reopen settled choices without new evidence.

**Done when:** one executable local specification defines the outcome, scope, checks and stopping point without material ambiguity.

### 2. Capture the review boundary

Before editing, capture `git rev-parse HEAD`, `git status --short`, the existing tracked diff and untracked-file list. Keep the SHA as the fixed review baseline and record pre-existing work separately. Preserve it; do not reset, overwrite or attribute it to this implementation. If overlapping edits cannot be separated safely, ask the user before changing them.

Pass this baseline, the absolute specification path and the changed-file scope to cleanup/review later. A dirty working tree is not permission to clean unrelated work. Do not commit, push or mutate tracker issues unless separately requested.

**Done when:** the baseline and pre-existing changes are recorded and the implementation's ownership boundary is clear.

### 3. Implement within scope

Make the smallest coherent change that satisfies the specification, using repository conventions. Run targeted tests and typechecking regularly; for a bug, establish a failing regression check before the fix when a suitable seam exists. Keep hypotheses separate from observed facts. Stop and ask if satisfying the task requires crossing a constraint or non-goal.

**Done when:** the expected outcome is implemented and targeted checks pass, or a concrete blocker is reported without claiming completion.

### 4. Clean and review

Call the `skill` tool with ID `ai-slop-cleaner`, scoped only to this implementation's changes. Then call `review-diff` with the captured baseline, absolute local specification path and pre-existing-change inventory; do not make it guess a baseline or select a durable draft. Review includes new untracked files. Fix valid in-scope findings; ask about decisions or scope changes. Keep unresolved findings visible rather than silently dismissing them.

**Done when:** cleanup and review have run and findings are fixed or explicitly dispositioned; any blocking remainder prevents a completion claim.

### 5. Verify the final state and hand over

After the last cleanup or review fix, freshly run every Required check, relevant lint/typechecking and the full test suite. Re-check the observable Expected outcome and Stop conditions. Earlier green runs do not prove the final edited state. If a check cannot run, fails or is intentionally deferred, say why and leave that criterion unverified.

End with the saved specification path, a brief change summary, unresolved findings and the verification report from `../../../docs/verification.md`. Implementation does not update the durable ticket or its tracker status.

**Done when:** the specification's completion criteria hold and the full test suite passes, proven by fresh final-state evidence. Otherwise stop with the exact failure/blocker and no claim that the task is complete.
