---
name: to-jira
description: "Turn the current conversation into a durable Jira ticket to paste by hand and pick up much later: behaviour and component names, no file paths or lines."
disable-model-invocation: true
---

This skill takes the problem the user already understands, as discussed in the conversation, and writes it up as a **durable ticket**: one the user pastes into Jira themselves and someone picks up days or months later. Do NOT interview the user; just synthesize what you already know.

The ticket is the durable counterpart of an AI-Ready task (`${CLAUDE_PLUGIN_ROOT}/docs/ai-ready-task.md`): its sections reuse the AI-Ready field names, so when it is picked up, `/get-task <KEY>` maps it straight onto the task and makes it concrete against the code as it is then. Write it in the language of the conversation.

## Durability over precision

The codebase will change before anyone works on this. Write it so it stays true when files are renamed, moved or refactored.

- **Name what lasts:** components and modules by their domain names (use `.agent-docs/GLOSSARY.md` vocabulary if the project has one), public contracts (endpoints, events, config keys, user-visible behaviour), types and interfaces at the component's surface.
- **Leave out what goes stale:** file paths, line numbers, private functions, the current internal structure, step-by-step implementation.
- **Behavioural, not procedural:** describe what the system should do, not how to change the code. "Cancelling an order releases its reserved stock" — not "add a call to `releaseStock()` in `cancel()`".

## Process

1. **Gather.** Work from the conversation. If the user passed a reference (a file, a `.agent-docs/work/<id>`), read it. Explore the codebase only as far as you need to name the affected components correctly. **Done when:** you can name every affected component by its domain name.

2. **Check the gaps.** The ticket needs a problem, an expected outcome and acceptance criteria you can state without guessing. If any is missing, list what's missing and suggest `/grill-with-docs` before writing; don't invent it. **Done when:** all three can be stated without guessing, or you've stopped and told the user what's missing.

3. **Write the ticket** using the template below. Fill a section only when the conversation gave it real substance and omit it otherwise; **Problem**, **Expected outcome** and **Acceptance criteria** are always present. **Done when:** the ticket names no file path, line number or private function, and every acceptance criterion is independently verifiable.

4. **Save and hand over.** Save to `.agent-docs/work/<slug>/jira.md` (`<slug>` a short kebab-case slug of the problem; layout in `${CLAUDE_PLUGIN_ROOT}/docs/workspace.md`). Report the path and print the ticket in your reply, ready to copy: the `#` heading goes into Jira's Summary field, everything below it into Description. **Done when:** the file is saved and the ticket is printed in the reply.

<jira-template>

# <Summary: one line, what needs to happen>

## Problem

What happens now and why it's a problem, from the user's or system's perspective. The affected components by name.

## Expected outcome

What should happen once this is done, including the edge cases and error conditions that matter.

## Known facts

Decisions already made and constraints the implementer must not reopen: agreed approach, what was tried and why it didn't work, business rules, boundaries not to cross.

## Hypotheses

For a bug: suspected causes at component level, and how each could be confirmed.

## Acceptance criteria

- [ ] Each criterion behavioural and independently verifiable
- [ ] ...

## Non-goals

What is deliberately out of scope: adjacent features, tempting refactors.

</jira-template>
