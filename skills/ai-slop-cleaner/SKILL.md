---
name: ai-slop-cleaner
description: "Clean AI-generated code slop (dead code, duplication, needless wrappers, weak tests) without changing behaviour: tests first, deletion first, one smell per pass. Use when asked to deslop / anti-slop / clean up code an agent wrote, or after implement."
argument-hint: "<files or area> [--review]"
---

A bounded cleanup pass for code that works but is bloated, repetitive, over-abstracted or weakly tested, typically right after an agent wrote it. Behaviour stays the same; the diff gets smaller. Ends with an evidence report. Adapted from oh-my-claudecode's `ai-slop-cleaner` (MIT).

Talk to the user, and write the report, in the language the user writes in.

## When to use

- The user says "deslop", "anti-slop", "AI slop", or asks to clean up code an agent just wrote.
- `implement` / `implement-spec` call it on the files their work changed.
- Code was left with duplicate logic, dead code, wrapper layers, boundary leaks or weak regression coverage.
- A reviewer-only anti-slop pass is wanted: `--review`.

**Not here:** a new feature or behaviour change; a broad redesign; a generic refactor with no simplification intent; formatting (that's the formatter's job). If behaviour is too unclear to protect with tests or a concrete verification plan, say so and stop. Claude Code's built-in `/simplify` is a lighter quality pass over a diff; this skill is the one that locks behaviour first and works smell by smell.

## Scope

Work only on the scope you were given: an explicit file list, an area, or "the files this work changed". Never silently widen a changed-file scope into broader cleanup; ask first.

## Posture

- Preserve behaviour unless the user explicitly asks to change it.
- Prefer deletion over addition. Reuse existing utilities and patterns before introducing new ones; add no dependencies.
- Keep diffs small, reversible and smell-focused; don't bundle unrelated refactors.
- New user instructions narrow or extend the scope locally without dropping earlier constraints.

## Process

### 1. Lock current behaviour

Identify what must stay the same. Add or run the narrowest regression tests that cover it. If tests can't come first, write down the verification plan (commands, manual checks) before touching code.

**Done when:** the behaviour to preserve is covered by tests that pass now, or by a written verification plan.

### 2. Write a cleanup plan

Bound the pass to the scope. Classify every smell you will remove (categories below) and order the work from the safest deletion to the riskiest consolidation.

**Done when:** the plan lists concrete smells with their locations, in order.

### 3. Clean one smell at a time

Work in passes, re-running the targeted verification after each:

1. Dead code deletion
2. Duplicate removal
3. Naming and error-handling cleanup
4. Test reinforcement

**Done when:** every planned smell is removed or consciously left (with a reason), and verification is green after the last pass.

### 4. Run the quality gates

Run the relevant lint, typecheck and unit/integration tests for the touched area, plus any static or security checks the repo has. If a gate fails, fix it or back out the risky cleanup instead of forcing it through.

**Done when:** every gate passes.

### 5. Report

Report, with evidence:

- **Changed files**
- **Simplifications**: what was removed or merged, and why
- **Behaviour lock**: tests and commands run, with results
- **Remaining risks**: anything left untouched on purpose

**Done when:** the report is given.

## Smell categories

- **Duplication**: repeated logic, copy-paste branches, redundant helpers.
- **Dead code**: unused code and exports, unreachable branches, stale flags, debug leftovers.
- **Needless abstraction**: pass-through wrappers, speculative indirection, single-use helper layers.
- **Boundary violations**: hidden coupling, misplaced responsibilities, wrong-layer imports or side effects.
- **Missing tests**: behaviour not locked, weak regression coverage, edge-case gaps.
- **UI/design defaults**: generic visual patterns that make an AI-built interface feel unreviewed (checklist below).

### UI/design checklist

Review prompts, not bans: keep intentional brand, accessibility, density or design-system choices that have a clear rationale.

- **Readability**: body text around 11–12px is usually too small; scripts with dense glyphs (CJK, Cyrillic at small sizes) need more.
- **Shadow restraint**: shadows on every surface, logo, card or icon; keep them only where they clarify elevation or interaction.
- **Content hierarchy**: eyebrow + title + description + extra paragraph stuffing when the title already carries the message; decorative emoji badges outside the product's voice.
- **Palette rationale**: default AI blue/purple (Tailwind-like `#3B82F6`) with no brand or system reason.
- **Layout rhythm**: uniformly perfect 3- or 4-column grids where emphasis, asymmetry or varied card weights would serve the content better.
- **Gradient restraint**: extreme gradients the brand doesn't deliberately own.

## Review mode (`--review`)

A reviewer-only pass after cleanup has been drafted, to keep writing and approving separate: the same pass must not both make high-impact cleanup and approve it.

1. Don't edit files.
2. Review the cleanup plan, the changed files and the regression coverage.
3. Check for: leftover dead code or unused exports; duplicate logic that should have been consolidated; wrappers or abstractions that still blur boundaries; missing tests or weak verification for preserved behaviour; cleanup that changed behaviour without intent.
4. Give a verdict with the required follow-ups, and hand them back to a separate writer pass rather than fixing and approving in one step.

**Done when:** the verdict and follow-ups are reported.
