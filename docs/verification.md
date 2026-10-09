# Verification before "done"

What it takes to claim that work is finished. `implement` and `implement-spec` point here instead of restating it. The rule in one line: **no completion claim without fresh evidence you ran yourself and read**.

## The gate

Before saying any form of "done", "passes", "works" or "fixed", walk these in order, for each criterion you are about to claim:

1. **Identify** the command that would prove it: a test invocation, a typecheck, a build, a curl, a script. If no such command exists, say so and describe the manual check you will do instead.
2. **Run** it, in full, now. Not earlier in the session, not from memory.
3. **Read** the output and the exit code. A passing run with a skipped test, a warning that hides a failure, or a suite that ran zero tests is not a pass.
4. **Compare** what you read with what the criterion says. Partial is not done.
5. **Claim**, quoting the evidence.

If any step fails, the claim is not made: say what failed and keep working, or stop with the reason.

## What counts as evidence

| Claim | Requires | Not sufficient |
|---|---|---|
| Tests pass | the full command and its final summary line, run after the last edit | "tests should pass", a run from before the last change, a single file when the task names the suite |
| The bug is fixed | the original reproduction no longer reproduces, and the regression test went red before the fix and green after | the regression test green on its own, the symptom "not seen" in a different scenario |
| The behaviour matches the Expected outcome | the output, response or file as the task describes it, observed | reading the code and concluding it would produce it |
| Typecheck / lint / build pass | the command's clean exit | the editor showing no squiggles |
| A subagent finished its task | its diff read, and its checks re-run or its output quoted | the subagent's own report of success |
| A Required check holds | that check run as written in the task | a neighbouring check that happens to pass |

Words that signal a claim without evidence: *should*, *probably*, *seems to*, *I believe*, *will work*. When one appears in your draft, go back to step 1.

A scope statement bounds the deliverable, not the verification: the task may touch one module, but the suite that proves nothing else broke is the whole suite.

## The report

End the work with this block, filled from the runs above. Write it in the user's language; keep the headings.

<verification-report-template>

## Verification

- **Checked:** <each criterion of the task that was claimed, one line each: Expected outcome, every Required check, every Stop condition>
- **Commands:** <each command run, with its final result line>
- **Passed:** <what the evidence shows holds>
- **Failed or not verified:** <what did not pass, or could not be checked, and why; "nothing" is a valid answer, an empty line is not>

</verification-report-template>
