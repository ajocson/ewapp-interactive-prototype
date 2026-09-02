# Updates

## 2026-09-02

- Corrected the canceled appointment sample for lead `71207` (`Mr. John Mark Doe`).
- Removed the active `Appointment Scheduled` and calendar tags from the canceled lead card.
- The lead now displays `Appointment Canceled` and the Activity Timeline records `Appointment Canceled`.
- Existing scheduling, rescheduling, cancellation, and board flows were preserved.

## Verification

- Dashboard tests: 25/25 passing.
- `git diff --check`: passing.
