# EWApp Prototype Update

**Date:** August 31, 2026, 10:15 AM

## Proposal Creation and Conversion Rules

- Contacted leads without an active appointment can no longer create a proposal from the Risk Profile flow; the activity drawer is reopened so an appointment can be scheduled first.
- This prerequisite is scoped to the Contacted-without-appointment scenario and does not change Meetings, Follow-up, or Applications behavior.
- Conversion checks the current active appointment rather than historical appointment activities.
- A Follow-up lead with a newly scheduled appointment must complete a newer `Presentation Completed` activity before conversion; the Convert button remains actionable so it can reopen the Follow-up drawer.
- Follow-up leads without an active appointment may convert when their existing proposal is otherwise eligible.

## Application Record Status

- Updated the application summary tag from `Application Start` to `In Progress`.

## Validation

- Proposal-flow unit tests: 21 passing.
- Dashboard unit tests: 21 passing.
- `git diff --check` passed.

## Files Updated

- `src/app/proposal-flow/proposal-flow.component.{ts,html}`
- `src/app/proposal-flow/proposal-flow.component.spec.ts`
- `src/app/dashboard/dashboard.component.ts`
- `src/app/dashboard/dashboard.component.spec.ts`
- `UPDATES_Aug-31-2026_10-15AM.md`
- `AGENTS.md`
