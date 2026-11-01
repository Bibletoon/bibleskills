# Skill mechanics

The skill-specific branch of [`writing-for-agents`](SKILL.md): what changes when the document is a skill (frontmatter, the invocation choice, and router skills). Everything else about writing it is the universal reference in `SKILL.md`.

## Invocation

Two choices, trading the two loads:

- A **model-invoked** skill keeps a `description`, so the agent can fire it autonomously, and other skills can reach it. You can still type its name: model-invocation always _includes_ user reach; a description only ever adds agent discovery, never removes the human's. The description is the skill's top-level context pointer, forced to stay loaded at all times: permanent context load in exchange for discoverability. A model-invoked skill whose content is all reference is also one home for shared reference: another skill can invoke it, so reference needed by several skills lives in one place. Mechanics: omit `disable-model-invocation`, and write a model-facing description carrying the trigger branches (the pointer-writing rules in `SKILL.md` apply in full).
- A **user-invoked** skill is omitted from the model's automatic discovery list. It spends cognitive load: you are the index that must remember it exists. Mechanics: set `disable-model-invocation: true`; the `description` becomes human-facing: a one-line summary, trigger lists stripped. In OpenCode V2 the skill stays registered and can still be explicitly selected through `@<skill>` or loaded by its exact ID when explicitly requested; this flag is not an access restriction.

V2 also accepts `metadata: { opencode/autoinvoke: false }` for the same discovery behavior. If both fields are set, `metadata.opencode/autoinvoke` wins. Keep one visibility convention per skill to avoid contradictory settings; this bundle uses `disable-model-invocation`. Use `skill` permissions for `allow` / `ask` / `deny`, independently of visibility.

The directory determines the exact skill ID; frontmatter `name` is a display label, not a namespace. OpenCode advertises the ID, name and description before loading the body, so the description must state the result and selection boundary. Keep descriptions concise (roughly 250 characters is an editorial target, not a V2 limit). Write instructions in English and keep real user-language trigger examples when useful; outputs follow the user's language.

Pick model-invocation only when the agent must reach the skill on its own, or another skill must. If it only ever fires by hand, make it user-invoked and pay no context load.

Shared reference that two user-invoked skills both need should live in a plain file outside the skill system, with a pointer from each caller. This avoids relying on automatic discovery of a hidden skill.

## Splitting by invocation

The invocation cut of splitting (the sequence cut lives in `SKILL.md`): split off a model-invoked skill when you have a distinct leading word that should trigger it on its own (a trigger word you actually use in your prompts), or another skill must reach it. You pay context load for the new always-loaded description, so that independent reach has to be worth it.

## Router skills

When user-invoked skills multiply past what you can remember, that piled-up cognitive load is cured by a **router skill**: one user-invoked skill that names the others and when to reach for each, so the human has one skill to remember instead of many. This bundle's router recommends routes; the human chooses whether to start the next workflow. Use `skill` permissions, not visibility flags, when access must be restricted.
