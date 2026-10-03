---
name: create-task
description: "Build an agent task (задача для агента) by interviewing the user: gather the core, verify the described behaviour locally, grill until settled, save .agent-docs/work/<id>/task.md. Use when there is no Jira key and the user describes the task in their own words (\"создай задачу для агента\", \"оформи задачу: …\")."
---

The entry point of the agent-task flow **from interviewing the user**. This skill covers only the initial assembly; after it comes the shared flow in `${CLAUDE_PLUGIN_ROOT}/docs/task-flow.md` (reproduction → grilling → finalization). Read it before you start: its context-economy rules apply to this step too.

## When to use

**The only selection signal: the user has NO Jira issue key matching `[A-Z]+-\d+`, and describes the task in their own words.** The agent task is built from scratch through an interview.

Typical phrasings (no key):
- «Создай задачу для агента»
- «Оформи задачу: <краткое описание>»
- «Построй минималистичную задачу по моему описанию»
- The user has described in words what needs doing and expects you to ask about it in a structured way

**Not here:** if the request contains a Jira key like `MYCOMM-818`/`PROJ-123` (even alongside a description), that's the `get-task` skill, which builds the task from the Jira ticket.

## Process

### 1. Structured interview

The goal is to gather the task's **core** (field rules in `${CLAUDE_PLUGIN_ROOT}/docs/ai-ready-task.md`): enough to understand the essence and decide about reproduction. **Don't ask mechanically about all 9 fields in a row**: it's tiring and leads to box-ticking.

**The core (almost always required; when a field may stay empty, per the skip rules in `${CLAUDE_PLUGIN_ROOT}/docs/ai-ready-task.md`):**
- **Problem**: what needs doing: the concrete action/artifact, the starting state.
- **Expected outcome**: how to verify it's done: the artifact/format, the verification criterion.

Plus the minimum reproduction needs: is there a **verifiable circumstance**, and if so, how the project runs (if it doesn't come up, find it in the repository with a subagent). Don't ask about the other 7 fields before grilling; if facts come up in the answers on their own, record them in the draft.

**Phrase every interview question with ready answer options**, per the "Question format" section of the `grilling` skill (`${CLAUDE_PLUGIN_ROOT}/skills/grilling/SKILL.md`): marker, options, recommendation ➡️, **strictly one at a time**, via the `AskUserQuestion` tool, one question per call. The grilling interview itself comes later, in the shared flow; here, only the core. Options carry concrete candidates (artifacts, endpoints, functions, files, numbers), not "human" generalities ("improve orders" → "add a `status` field to GET /orders"). If the user is vague, translate it into specifics and ask them to confirm.

**Done when:** Problem and Expected outcome are agreed in concrete terms, and you know whether there is a verifiable circumstance (and, if so, how the project runs).

### 2. Identifier and draft

The task identifier is **derived from the task's meaning**: a short, readable kebab-case slug that captures the essence (from the interview's core).

- Latin letters, lowercase, words joined by `-`;
- short (2–5 words), based on the task's core;
- starts with a verb/action where it fits.

Examples: `add-status-to-orders`, `fix-outbox-duplicate`, `cart-checkout-cleanup`, `order-cancel-stock-release`.

Propose the identifier as plain text and wait for confirmation or an edit before saving the file.

Save the draft per the template in `${CLAUDE_PLUGIN_ROOT}/docs/ai-ready-task.md` (all 9 headings) as `.agent-docs/work/<id>/task.md`, with only the fields gathered in the interview filled in.

**Done when:** the user has confirmed the identifier and the draft is saved.

### 3. Shared flow

Hand the flow the task file and a summary of the interview (essence, verifiable circumstance, run method); grilling's input is the interview answers. Continue from step A in `${CLAUDE_PLUGIN_ROOT}/docs/task-flow.md`.

**Done when:** every step of the shared flow is done and its quality criteria hold.

## Quality criteria

- The task identifier is derived from the meaning, agreed with the user, and is readable kebab-case.
- The draft was saved to `.agent-docs/work/<id>/task.md` before reproduction and grilling.
