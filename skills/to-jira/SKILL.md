---
name: to-jira
description: "Turn the current conversation into one or several short, durable Jira tickets to pick up much later: problem, actions, definition of done; no file paths or lines."
disable-model-invocation: true
---

This skill takes the problem the user already understands, as discussed in the conversation, and writes it up as a **durable ticket**, or a set of them when a spec or plan splits into several: short enough to read on the board, pasted into Jira by the user and picked up days or months later. Do NOT interview the user; just synthesize what you already know.

Whoever picks a ticket up studies the code first, by hand or through `/get-task <KEY>`, which turns the ticket into an AI-Ready task (`${CLAUDE_PLUGIN_ROOT}/docs/ai-ready-task.md`) against the code as it is then. So the ticket carries only what they need to start and to know they're done. Write it in the language of the conversation.

## Durability over precision

The codebase will change before anyone works on this. Write it so it stays true when files are renamed, moved or refactored.

- **Name what lasts:** components and modules by their domain names (use `.agent-docs/GLOSSARY.md` vocabulary if the project has one), public contracts (endpoints, events, config keys, user-visible behaviour), types and interfaces at the component's surface.
- **Leave out what goes stale:** file paths, line numbers, private functions, the current internal structure, step-by-step implementation.
- **Actions at the surface, not in the code:** an action names a component and what changes at its contract. "Stop reading `oms_status_id` from the backlog services' endpoints" — not "remove the field from `UnitMapper.toDomain()`".
- **Point, don't restate.** If a tech analysis, spec or design page exists, link it and keep in the ticket only what the implementer needs to start and to know they're done: the problem, the actions, the definition of done, and any requirement nuance easy to get wrong. Everything else lives in the linked document. A ticket that retells it is a second source of truth that will drift from the first.
- **Short.** Nobody reads a long description on the board. A ticket that runs past ~20 lines is restating the linked document or what the implementer will find in the code within minutes; cut that.

## Process

1. **Gather.** Work from the conversation. If the user passed a reference (a file, a `.agent-docs/work/<id>`), read it. Explore the codebase only as far as you need to name the affected components correctly. When the source is a spec or plan covering several pieces of work, split it into one ticket per piece that can be delivered and verified on its own (usually one per component) and note which tickets depend on which. **Done when:** you can name every affected component by its domain name, and for a set you have the list of tickets and their order.

2. **Check the gaps.** Each ticket needs a problem, actions and a definition of done you can state without guessing. If any is missing, list what's missing and suggest `/grill-with-docs` before writing; don't invent it. **Done when:** all three can be stated without guessing for every ticket, or you've stopped and told the user what's missing.

3. **Write the ticket** using the template below. **Problem**, **Actions** and **Definition of done** are always present; add an optional block only when the conversation gave it real substance. **Done when:** the ticket names no file path, line number or private function, every definition-of-done item is independently verifiable, and nothing in it retells a document it links.

4. **Save and hand over.** Save to `.agent-docs/work/<id>/jira.md` (`<id>` the directory of the work item the tickets come from, or a short kebab-case slug of the problem; layout in `${CLAUDE_PLUGIN_ROOT}/docs/workspace.md`). A set goes into the same file in dependency order, tickets separated by `---`. Report the path and print the tickets in your reply, ready to copy: each `#` heading goes into Jira's Summary field, everything below it into Description. **Done when:** the file is saved and the tickets are printed in the reply.

<jira-template>

# <Summary: one line, what needs to happen>

**Problem**

What happens now and why it changes, in 1–3 sentences. The affected components by name.

**Actions**

- What to do, at the level of components, endpoints, contracts, events
- ...

**Definition of done**

- Each item behavioural and independently verifiable
- ...

</jira-template>

In a set whose tickets land in different components, prefix the Summary with the component, so the board shows where the work is: `# [posting] Stop reading oms_status_id`.

Optional blocks, in this order after **Definition of done**:

- `**Nuances**`: requirements that are not obvious from the code and easy to break ("in Sandbox the status is computed the way the storage used to compute it"), and decisions made in the conversation that are recorded nowhere else, each with the alternative it was chosen over and why. A scope boundary goes here too, as one sentence, when the ticket would clearly sprawl without it.
- `**Hypotheses**`: bugs only. Suspected causes at component level, and how each could be confirmed.
- `**Details:** <link>`: one line, when a tech analysis, spec or design page exists.
- `**Do after:** <ticket>`: one line, when the ticket depends on others: their Jira keys if they have them, otherwise their Summary lines from the same set.
