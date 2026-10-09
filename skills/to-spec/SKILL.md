---
name: to-spec
description: "Turn the current conversation into a spec (an AI-Ready task) and save it to `.agent-docs/work/<id>/spec.md`: no interview, just synthesis of what you've already discussed."
disable-model-invocation: true
---

This skill takes the current conversation context and codebase understanding and produces a spec. Do NOT interview the user; just synthesize what you already know.

The spec is an **AI-Ready task**: read `${CLAUDE_PLUGIN_ROOT}/docs/ai-ready-task.md` for the template, the per-field rules and the quality criteria. The spec is executed right after it is written, so be concrete: file paths, functions, endpoints, schema and type shapes all belong in it.

The spec is saved as a local file per `${CLAUDE_PLUGIN_ROOT}/docs/workspace.md`.

## Process

1. Explore the repo to understand the current state of the codebase, if you haven't already. Use the project's domain glossary vocabulary throughout the spec, and respect any ADRs in the area you're touching.

2. Sketch out the seams at which you're going to test the feature. Existing seams should be preferred to new ones. Use the highest seam possible. If new seams are needed, propose them at the highest point you can. The fewer seams across the codebase, the better - the ideal number is one. Check with the user that these seams match their expectations. **Done when:** the user has confirmed the seams.

3. Write the spec in the AI-Ready task template. Map what the conversation settled onto its fields:

   - **Problem** / **Expected outcome**: what is being built and how to tell it's done, as concrete artifacts (endpoint + response, new module, changed behaviour).
   - **Known facts**: the implementation decisions made: modules built or modified and their interfaces, architectural decisions, schema changes, API contracts, prototype verdicts. Each decision the conversation weighed carries the alternative it was chosen over and the reason, per the field rule in `${CLAUDE_PLUGIN_ROOT}/docs/ai-ready-task.md`. If a prototype produced a snippet that encodes a decision more precisely than prose (state machine, reducer, schema, type shape), inline its decision-rich part and note it came from a prototype.
   - **Required checks**: the agreed seams from step 2, what each test there verifies, and prior-art tests in the codebase to model them on.
   - **Non-goals**: what is out of scope.
   - The remaining fields per their rules in `${CLAUDE_PLUGIN_ROOT}/docs/ai-ready-task.md`: fill only what the conversation gave real substance to, leave the rest empty.

   **Done when:** every field is filled or consciously left empty per the rules, and the spec meets the general quality criteria in `${CLAUDE_PLUGIN_ROOT}/docs/ai-ready-task.md`.

4. Save it to `.agent-docs/work/<id>/spec.md`, where `<id>` is the work item's existing directory if the conversation started from one (e.g. a `task.md` or wayfinder `map.md`), otherwise a new kebab-case slug. Report the path. **Done when:** the file is saved and its path reported.

5. Get a fresh-eyes check: call the agent `bibleskills:task-critic` with only paths (the spec, `${CLAUDE_PLUGIN_ROOT}/docs/ai-ready-task.md`, the repository root, the domain docs if they exist) and the user's language; never pass the conversation. Show the user its verdict and findings; apply the rewrites they accept and ask about findings that need a decision. Re-run only if the user asks. **Done when:** every finding is applied or dismissed by the user, and the saved spec reflects it.
