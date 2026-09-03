# EWApp Prototype Update

**Date:** August 31, 2026

## LCAM Sample Leads

- Added a Lead-board sample for a lead not contacted for 30 days. It is `Parked`, shows `30d` aging, and uses the 16px `person_cancel` icon with the error/subtle treatment.
- Added Meetings and Follow-Up samples for leads auto-dropped after 90 days without progress. They are `Dropped`, show `91d` TAT aging, and use the 16px `person_off` icon with the neutral/primary treatment.
- Added the requested drawer error messages using the shared section-message component and the `warning` icon.
- These changes add sample data and conditional presentation only; existing scheduling, parking, dropping, reactivation, conversion, and board movement flows were not changed.

## Appointment Cancellation Rules

- An Appointments-board lead with a canceled appointment cannot convert to an application until a new appointment is scheduled and marked `Presentation Completed`.
- A Follow-Up lead with a canceled follow-up appointment may convert again; only an active scheduled follow-up appointment requires a newer `Presentation Completed` activity.
- Rebooking a canceled Appointments-board appointment now updates the existing lead in the Appointments board instead of silently failing.
- The canceled Follow-Up appointment footer now keeps the regular `Cancel` button full-width within its flex area and the long confirmation button hug-content without overlap.

## Validation

- Focused dashboard, lead-card, and lead-activity-drawer tests: 40 passing.
- Proposal-flow tests: 23 passing; lead-activity-drawer tests: 7 passing.
- `git diff --check` passed.

## Files Updated

- `src/app/dashboard/dashboard.component.ts`
- `src/app/dashboard/dashboard.component.spec.ts`
- `src/app/lead-board.model.ts`
- `src/app/components/lead-card/lead-card.component.{html,scss,spec.ts}`
- `src/app/components/lead-activity-drawer/lead-activity-drawer.component.html`
- `src/app/shared/components/section-message/section-message.component.scss`
- `src/styles.scss`
- `src/app/proposal-flow/proposal-flow.component.ts`
- `src/app/proposal-flow/proposal-flow.component.spec.ts`
- `src/app/components/lead-activity-drawer/lead-activity-drawer.component.scss`
- `AGENTS.md`
- `agents.md`
