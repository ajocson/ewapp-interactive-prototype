# Updates

## 2026-09-02

- Corrected the Follow-Up status tag on both the lead card and activity drawer.
- A follow-up appointment scheduled after a cancellation now displays `Follow-up Mtg. Scheduled`, not `Follow-up Mtg. Rescheduled` or `Follow-up Mtg. Cancelled`.
- True rescheduling of an existing active appointment continues to display `Follow-up Mtg. Rescheduled`.
- No scheduling, cancellation, board movement, activity recording, or other user flow was changed.

## Verification

- Lead card and lead activity drawer tests: 16/16 passing.
- `git diff --check`: passing.
