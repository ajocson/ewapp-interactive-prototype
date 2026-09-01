# Updates

## 2026-09-01

- Standardized Sales Activities wording for unsuccessful appointments, follow-up scheduling, follow-up updates, follow-up completion, and follow-up cancellation.
- Kept Appointment-board presentation completion as `Presentation Completed`; Follow-Up completion is `Follow-up Presentation Completed`.
- Added `Leads Info Updated` when Lead Information is saved.
- Added automatic timeline records for 30-day auto-parking and 90-day auto-dropping, with automatic records shown at the end of the timeline.
- Moved `Application Start` into System Transactions and renamed `Application Created` to `Converted to Application`.
- Ordered System Transactions as Draft SI Generated, CSA Created, Proposal Created, then SI Generated.
- Fixed proposal creation navigation so product selection and Continue land on the Proposals tab.
- Fixed Unable to Set Appointment Save to locate the lead on its current board without changing board movement.
- Scoped Park Lead and Drop Lead actions to the Overview tab.
- Updated Drop Lead activity details to include the selected reason, descriptions, and optional notes. Expanded drop notes preserve the requested line breaks and remain collapsed by default.
- After a canceled Follow-Up receives a new update, its lead card and drawer tag return to `Follow-up`.
- Updated Grace Kelly's Applications Activity Timeline with realistic, varied dates and times while preserving the existing activity sequence and flows.
- For Grace Kelly, Appointment Canceled now uses the same scheduled appointment as Appointment Rescheduled because the canceled appointment is the one being rescheduled.
- Removed Grace Kelly's sample Dropped Lead and Application Start activities from the timeline.
- Kept Policy Released in System Transactions and placed it after Underwriting Ongoing as the final transaction.

## Verification

- Dashboard tests: 25/25 passing.
- App tests: 17/17 passing.
- Proposal flow tests: 27/27 passing.
- Lead card tests: 9/9 passing.
- Lead activity drawer tests: 7/7 passing.
- `git diff --check`: passing.
