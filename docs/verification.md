# Verification before "done"

What counts as evidence that work is finished. `implement` and `implement-spec` point here instead of restating it; which checks to run, and over what scope, is theirs to say. The rule in one line: **no completion claim without fresh evidence you ran yourself and read**.

## What counts as evidence

A command run after the last edit, its output and exit code read, proving the criterion as written. Skipped tests, a warning that hides a failure or zero tests executed are not a pass. Where no command can prove a criterion, say so and describe the manual check.

| Claim | Requires | Not sufficient |
|---|---|---|
| The bug is fixed | the original reproduction no longer reproduces; the regression test went red before the fix and green after | the regression test green on its own |
| The behaviour matches the Expected outcome | the output, response or file, observed | reading the code and concluding it would produce it |
| A Required check holds | that check run as written in the task | a neighbouring check that happens to pass |

## The report

End the work with this block, filled from the runs above. Write it in the user's language; keep the headings.

<verification-report-template>

## Verification

- **Checked:** <each criterion of the task that was claimed, one line each: Expected outcome, every Required check, every Stop condition>
- **Commands:** <each command run, with its final result line>
- **Passed:** <what the evidence shows holds>
- **Failed or not verified:** <what did not pass, or could not be checked, and why; "nothing" is a valid answer, an empty line is not>

</verification-report-template>
