# LCAM Journey Update

**Date:** August 29, 2026

## Delivered

- Added routed LCAM records: Board, Info, Profile, Proposals, and Applications.
- Added in-session lead progress: Info → Profile/CSA → Proposals → Applications. It resets on full reload.
- New contacted leads begin at editable Info; started leads resume their highest unlocked step.
- Replaced the stale proposal-local drawer with the shared LCAM drawer.
- Added `Presentation Completed` as the conversion gate. Appointment completion moves to Meetings; follow-up presentation completion stays on Follow-up.
- After presentation completion, Proposals shows Convert to Application instead of Generate Sales Illustration.
- Underwriting submission adds the client to Applications → In Progress with `Application Submitted`; the CTA is **Go to Applications Page**.

## Validation

- Proposal Flow: 15 tests passing
- App Component: 13 tests passing
- Dashboard: 21 tests passing
- Lead Activity Drawer: 7 tests passing
- Applications: 3 tests passing
- Side Navigation: 3 tests passing

## Detailed Commit Message

```text
feat(lcam): complete routed lead journey and underwriting handoff

Add routed LCAM lead records and retain each lead's in-session journey
progress across tab changes, history navigation, and direct local URLs.
Enforce the Info → Profile/CSA → Proposals → Applications sequence while
keeping unreached tabs disabled.

Unify proposal and board activity behavior through the shared LCAM drawer.
Record Presentation Completed as the conversion gate, then transfer submitted
underwriting leads to Applications → In Progress with Application Submitted.
```
