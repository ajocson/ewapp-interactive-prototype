# EWApp Prototype Update

**Date:** August 29, 2026, 11:25 PM

## Applications and Proposal Navigation

- Connected application drawer actions to the Applications and Proposal record routes.
- Applications leads opened from the Applications board retain their selected application context when switching record tabs.
- Applications record details open directly in the `For Upload` state and no longer expose `Submit to Underwriting` or `Record Activity`.
- Existing application proposals hide `Generate Sales Illustration` and `Convert to Application` because the application is already converted.

## Proposal and Follow-up Rules

- Leads with `SI Generated` or `Proposal Created` activities route directly to the Proposal page from Meetings and Follow-up.
- `Convert to Application` remains clickable when conversion is blocked so it can reopen the Follow-up drawer.
- An active Follow-up appointment requires a newer `Presentation Completed` activity before conversion is allowed.
- Without an active appointment, a lead with an existing proposal can convert normally.
- Moving a Meeting lead to Follow-up clears its active appointment and previous meeting presentation state; scheduling is a separate Follow-up action.

## Validation

- Dashboard and proposal-flow unit tests: 42 passing.
- Proposal-flow unit tests: 21 passing after the latest conversion-rule update.
- `git diff --check` passed.

## Files Updated

- `src/app/app.component.ts`
- `src/app/dashboard/dashboard.component.ts`
- `src/app/proposal-flow/proposal-flow.component.{ts,html}`
- `src/app/proposal-flow/proposal-flow.component.spec.ts`
- `src/app/components/lead-activity-drawer/lead-activity-drawer.component.{ts,html}`
- `UPDATES_Aug-29-2026_11-25PM.md`
- `AGENTS.md`
