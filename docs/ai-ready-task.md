# AI-Ready Task

The single agent-task format across the library: `get-task` and `create-task` build it (shared flow in `task-flow.md`), `to-spec` writes specs in it and `to-tickets` writes tickets in it; `implement` and `implement-spec` work from it. This file holds the definition, the template, the per-field rules and the general quality criteria. Skills read this file instead of duplicating it, and may add their own quality criteria and metadata on top (e.g. local verification, grilling, blocking tickets).

## What an AI-Ready Task is

An AI-Ready Task is a task (a file under `.agent-docs/work/`, layout in `workspace.md`) that an agent can execute **without reading the source** (the Jira ticket, the conversation with the user, the originating spec). The task identifier is a Jira key (e.g. `MYCOMM-818`), a kebab-case slug (e.g. `add-status-to-orders`), or a ticket number plus slug (e.g. `03-cancel-endpoint`). The task translates a "human" problem statement into specifics (endpoints, functions, files, numbers) and is laid out in a fixed template of 9 fields.

Write the field contents in the language the user writes in; the template's headings stay as they are.

**The task is executed right after it is created**, so concreteness beats durability: file paths, function names, endpoints and short snippets (a schema, a type, a state shape from a prototype) are welcome. If a task is going to sit for a long time, it is re-checked against the current code before execution rather than written vaguely up front.

The exception is a ticket the user files in Jira for later: `to-jira` writes it in a **durable** form (behaviour and component names, no paths or line numbers), using the same section names. `get-task` adds the specifics when the ticket is picked up.

**Key principle: don't fill a field just to tick a box.** Every field guards against a specific failure scenario; if that scenario is impossible for this task, the field **stays empty** (the template structure is always complete, only how much is filled in changes). The simpler the task, the more empty fields. "Fully resolved" doesn't mean "all 9 fields non-empty"; it means **every field is either meaningfully filled or consciously confirmed as not applicable**, and no field is skipped silently.

## Template

Which fields get filled is decided by the rules below and the key principle above. Don't shorten the file: the structure is constant, only the fill changes.

<task-template>

# Task <TASK_ID>

## Problem

## Expected outcome

## Known facts

## Hypotheses

## Constraints

## Non-goals

## Source of truth

## Required checks

## Stop conditions

</task-template>

## Field rules (decide per task)

### Problem
**Contains:** the concrete action/command, the target artifact (file/function/endpoint), the starting state (if it matters). No value judgements ("improve orders" → "add a `status` field to GET /orders"). **Guards against:** the agent solves a generic problem and does the wrong thing.
**May skip:** only if the change is purely cosmetic (a button colour) or the task is already reduced to an unambiguous action ("merge PR #42"), where misinterpretation is impossible. Otherwise Problem is required.

### Expected outcome
**Contains:** a verifiable result: the artifact/format ("a new file", "API responds 201 with body"), the verification criterion, the number of changes, an example result. **Guards against:** the agent declares the task done without a result, or polishes forever.
**May skip:** the result is trivial and obvious from Problem; the result is the act itself ("run the deploy"); it fully duplicates Stop conditions.

### Known facts
**Contains:** decisions already made and data the agent must not reopen (architecture, what was tried and why it failed, agreements, business rules, terminology). A decision taken in the interview is written **with the alternative it was chosen over and the reason**: "<decision>, chosen over <alternative> because <reason>". A bare decision invites the executor, or a reviewer, to reopen it with the very alternative that was already rejected. **Guards against:** the agent redesigns what's already decided and spends iterations on a known answer.
**May skip:** the task is isolated, with no dependency on past decisions; Problem covers all the context; the agent is a "pure executor" with no choices to make.

### Hypotheses
**Contains:** assumptions being tested (the cause of a bug, the expected effect of a fix, how to check, alternatives). **Guards against:** the agent fixes the symptom rather than the cause, and the bug comes back.
**May skip:** there's no uncertainty (the cause is obvious); a pure feature with no diagnosis; we're still exploring and have no hypotheses yet.

### Constraints
**Contains:** prohibitions and boundaries: technologies, modules, versions, style, security, performance that must not be violated. **Guards against:** the agent breaks a neighbouring module or the architecture "because it's more correct that way".
**May skip:** greenfield with no boundaries; an isolated single-file change; everything is already covered by Non-goals.

### Non-goals
**Contains:** what's explicitly out of scope: "don't refactor the neighbours", tempting improvements, ownership boundaries. **Guards against:** the "while I'm at it" scenario where the agent inflates the scope.
**May skip:** the task is strictly bounded; standalone new functionality that touches no existing code; Problem is so precise the scope can't grow.

### Source of truth
**Contains:** where the right answers live: links to docs/ADRs, the path to reference code, the API spec, the DB schema, test data. **Guards against:** the agent invents facts (a non-existent API, the model's stale memory).
**May skip:** only the stdlib with a stable, well-known API is used; the codebase is small and fully visible in context; everything needed is already in Problem.

### Required checks
**Contains:** concrete checks before handing over: tests, linters, manual checks, metrics, review, memory-leak and security checks. **Guards against:** the agent hands over code that doesn't build, breaks other tests, or violates the style.
**May skip:** the task produces no code (analysis, research); the change is too simple to get wrong; checks are 100% automated in CI (but if the agent opens an MR, better to list them).

### Stop conditions
**Contains:** the concrete "done" criterion: a quality threshold, an iteration count, a completion signal, what to do with remaining nits. **Guards against:** endless polishing, perfectionism, wandering into edge cases.
**May skip:** the result is obvious and can't be over-polished (replacing a line in a config); it's fully duplicated by Expected outcome (rare).

## General quality criteria

- The task is translated into specifics, without the "human" noise of the source.
- All 9 template fields are present in the file.
- Every filled field closes a concrete failure scenario (not filled "for the box").
- Fields that don't apply are empty (heading present, no content), with no placeholders like "—" or "TBD"; no field is skipped silently (empty is a conscious decision).
- `Problem` and `Stop conditions` are rarely skipped (they anchor "what we're doing" and "when it's enough"); apply their skip rules deliberately.
- The file can be handed to an agent: without reading the source, it understands what to do, within which boundaries, how to verify, and when to stop.
