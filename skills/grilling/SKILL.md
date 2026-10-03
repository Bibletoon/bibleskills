---
name: grilling
description: Grill the user relentlessly about a plan, decision, or idea, one question at a time. Use when the user wants to stress-test their thinking, uses any 'grill' trigger phrases, or another skill needs an interview.
---

Interview the user relentlessly until you reach a shared understanding. Map this as a **design tree**: every decision branches into the decisions that hang off it.

Ask in the language the user writes in.

## One question at a time

Work the tree **strictly one question at a time**. The **frontier** is every decision whose prerequisites are already settled: the questions you can ask _now_ without guessing at answers you haven't heard yet. Pick **one** question from the frontier, ask it, and wait for the answer. Never ask several questions in one message or one tool call, even when the frontier is large: the user must be able to discuss each question with you before moving on.

Each answer reshapes the tree: settled decisions push the frontier outward and unblock the questions that depended on them. Recompute the frontier and ask the **next single** question. A question whose answer depends on another frontier question not yet asked waits until that one is resolved.

## Question format

**Phrase every question with ready answer options.** Each question ends with a numbered list of options; the user picks a number or writes their own answer, and the last option is always "your own answer". The options frame the question so it's easy to answer, and point to the recommended answer (➡️).

Format a question like this. `<question marker>` is a label you assign yourself; the letter and number are arbitrary (e.g. `Q1`, `В1`, `Question 1`), numbered continuously across the whole interview:

<question-template>

❓ **<question marker>** - **<question title>**: <question body, may run to several paragraphs>

Answer options:
1) <option A>
2) <option B>
3) Your own answer (write it in)

➡️ <your recommended answer>

</question-template>

### Via `AskUserQuestion`

**In Claude Code, ask every grilling-interview question through the `AskUserQuestion` tool. This is mandatory, not a "nice to have for clickability".** Never ask a grilling question as plain text when the tool is available: the text format above is the fallback only for environments without the tool (Codex, OpenCode). The requirement covers only the grilling interview's own questions; questions outside it (if the calling skill has any) follow that skill's instructions.

Map the question onto the tool like this:
- the question title and body go in `question`; **the question marker goes in `header`** (the tool keeps no running numbering of its own, so the label in `header` is the only way to refer back to questions); there's no need to spell out "your own answer": the tool always offers free-text input;
- the options go in `options`; the recommended answer (`➡️`) is the first option, marked "(Recommended)";
- the tool allows up to 4 questions per call: **use exactly one**, per the one-question-at-a-time rule.

## Facts and decisions

Finding _facts_ is your job, never the user's. When a frontier question needs a fact from the environment (the filesystem, tools, etc.), dispatch a subagent to find it; don't ask the user for anything you could look up yourself. Don't block on it: a running exploration is an unsettled prerequisite, so while the subagent works, ask the single frontier questions that don't depend on it. The _decisions_ are the user's: put each one to them and wait.

## Called from another skill

When another skill runs grilling, it sets the **subject of the tree** (e.g. a task's fields, or a chosen refactoring candidate). Everything that skill has already settled (a ticket, an interview, verification results, facts found) is an **input**: don't ask about it again; the frontier is only what's still unresolved.

## Done

The session is done when the frontier is empty: every branch of the design tree visited, nothing left silently assumed. Don't move on to the next steps until the user confirms you've reached a shared understanding.
