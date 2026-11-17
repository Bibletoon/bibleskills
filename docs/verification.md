# Verification before "done"

What counts as evidence that work is finished. `implement` points here instead of restating it; the local specification defines the required checks and scope. The rule in one line: **no completion claim without fresh evidence you ran yourself and read**.

## What counts as evidence

A command run after the last edit, its output and exit code read, proving the criterion as written. Skipped tests, a warning that hides a failure or zero tests executed are not a pass. Where no command can prove a criterion, say so and describe the manual check.

| Claim | Requires | Not sufficient |
|---|---|---|
| The bug is fixed | the original reproduction no longer reproduces; the regression test went red before the fix and green after | the regression test green on its own |
| The behaviour matches the Expected outcome | the output, response or file, observed | reading the code and concluding it would produce it |
| A Required check holds | that check run as written in the task | a neighbouring check that happens to pass |

## The report

End the work in chat with this block, filled from the runs above. Save a report file only when the user explicitly requests it. Write it in the user's language; keep the headings.

Summarize final-state checks, not an activity log. Include the earlier failing regression check when relevant; omit exploratory commands and repeated runs. Keep failures and unverified criteria explicit, with enough command/result detail to check each completion claim.

<verification-report-template>

## Verification

- **Checked:** <each criterion of the task that was claimed, one line each: Expected outcome, every Required check, every Stop condition>
- **Commands:** <final verification commands, with their result lines; include the earlier failing regression check when relevant>
- **Passed:** <what the evidence shows holds>
- **Failed or not verified:** <what did not pass, or could not be checked, and why; "nothing" is a valid answer, an empty line is not>

</verification-report-template>
