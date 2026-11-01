# Durable ticket

The tracker-facing format produced by `to-tickets`. A ticket may wait for months and move outside this checkout. It describes what should change and how to accept it, not the current implementation. `get-task` later translates one ticket into the separate local specification in `ai-ready-task.md`, against the code as it is then.

## What belongs here

- Domain components, user-visible behavior, public endpoints/events/configuration keys, constraints and independently verifiable acceptance criteria.
- Each ticket is one independently deliverable or investigable outcome. A small change needs one ticket, not an artificial decomposition.
- For a confirmed bug, retain the observed symptom, trigger and expected behavior. A suspected cause stays a hypothesis. Without enough evidence to call it a bug, ask for verification or propose an explicitly labeled investigation ticket; never present a suspicion as a confirmed defect.
- Important decisions and non-goals must survive outside the conversation. State them briefly in Nuances, including a rejected alternative and reason when that matters.

## What stays out

- No source file paths, line numbers, private functions, implementation snippets, current call graphs or step-by-step code edits. Public API paths such as `POST /orders` are contracts, not source file paths, and are allowed.
- No required local task-file link, chat history or unpublished `.agent-docs/` link. If supporting analysis exists at a shareable URL, link it, but keep the problem, actions and acceptance criteria understandable without the chat. If there is no shareable URL, preserve the essential decisions in the ticket rather than inventing a link.
- No credentials, personal data or raw traces containing secrets. Quote only sanitized signal, not a whole stack trace carrying source locations.
- No local execution state (`ready`, `claimed`, `done`) or assignment to an agent session. The external tracker owns execution status after publication. Saving a draft is not starting implementation.

## Template

Problem, Actions and Definition of done are required. The title is the tracker's Summary; the body is its Description. Keep it short (roughly 20 lines is a useful target, not a limit that justifies dropping requirements). Write contents in the user's language; headings stay English.

<durable-ticket-template>

# <Short summary of the outcome>

**Problem**

<Current behavior or need, its impact and affected domain components.>

**Actions**

- <A change at the behavioral or public-contract level, not a source edit.>

**Definition of done**

- <An independently verifiable result.>

</durable-ticket-template>

Optional blocks, only when the source gives them real substance:

- **Nuances**: constraints, non-goals and load-bearing trade-offs that are easy to miss.
- **Evidence**: sanitized observations or behavioral reproduction steps for a confirmed problem; separate observation from inference.
- **Hypotheses**: explicitly unverified explanations, at component level, and how to test them.
- **Details:** a shareable supporting URL, if one exists.
- **Depends on:** existing tracker keys, or the exact summary titles of tickets in this draft set. Do not use sibling file paths as dependencies. Verify references and an acyclic dependency graph before handover.

For a set, prefix summaries with a domain component when it helps distinguish them. Local file numbering is draft organization only: the ticket must remain understandable when pasted into a tracker without that filename.

## Handover, not publication

`to-tickets` saves one draft per file under `work/<id>/issues/` as `workspace.md` defines it, then prints the tracker-ready text. It does not create or update remote issues. Publication is a separate explicit user request with the destination and content confirmed; do not infer approval to post from approval of a decomposition.
