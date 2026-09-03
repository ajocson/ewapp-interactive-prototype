# Updates Since `AGENTS.md`

This document records the LCAM changes made after the latest `AGENTS.md` update. It reflects the current working tree and is intended as a review/handoff summary; none of the items below are committed by this document.

## Activity Timeline UI

- Updated the lead activity drawer timeline to distinguish an activity's scheduled date/time from the time it was recorded.
- Every Sales Activity and System Transaction now persistently displays a muted `Recorded on <date> at <time>` line.
- Activities that have a schedule display a separate caption/regular row above the recorded line, using the Material Symbols `calendar_month` and `schedule` icons, a date/time divider, and neutral-primary text.
- Appointment scheduling and rescheduling now retain both timestamps in `LeadActivityRecord`: `recordedDateLabel` / `recordedTimeLabel` and optional `scheduledDateLabel` / `scheduledTimeLabel`.
- Timeline notes use the subtle surface and primary text tokens. They are initially truncated and can be clicked to expand or collapse the complete note.
- The timeline connector and completed marker use the shared TDX stepper token contract, including the standard connector thickness and completed icon size.

## Appointment Card States

- `Appointment Rescheduled` now uses the existing TDX `primary` tag variant (purple).
- `Appointment Canceled` now uses the existing TDX `danger` tag variant (red).
- Added a Figma-matched Past Due appointment sample in the Appointments board:
  - `Appointment Scheduled` remains a success tag.
  - The appointment date/time is a TDX danger tag: `Feb 3, 2026 · 2:00-3:00 PM`.
  - The sample uses the current lead-card fields, including Lead ID, Active state, aging, and TAT aging.

## Design-System Alignment

- Timeline scheduled date/time uses the global `--caption-text-size` and `--caption-line-height` tokens.
- Scheduled-row icons use the global `--icon-lg` token.
- Added the semantic `--surface-subtle` token and its dark-theme override for reusable subdued note surfaces.
- No bespoke red or purple status colors were added; appointment cards use the existing `app-tag` / TDX variants.

## Tests and Validation

- Extended dashboard and app integration tests for the rescheduled primary tag, canceled danger tag, Past Due sample, scheduled metadata, and recorded metadata.
- Verified the LCAM board visually after the Past Due sample was added.
- `npm test -- --watch=false`: 21 test files, 101 tests passing.
- `npm run build`: succeeds.

## Current Warnings

The production build continues to report SCSS component-budget warnings for:

- `src/app/draft-si-flow/draft-si-flow.component.scss`
- `src/app/proposal-flow/proposal-flow.component.scss`
- `src/app/components/lead-activity-drawer/lead-activity-drawer.component.scss`

These are size-budget warnings only; they do not prevent a successful build.

## Main Files Updated

- `src/app/lead-board.model.ts`
- `src/app/dashboard/dashboard.component.ts`
- `src/app/dashboard/dashboard.component.spec.ts`
- `src/app/app.component.spec.ts`
- `src/app/components/lead-activity-drawer/lead-activity-drawer.component.{ts,html,scss,spec.ts}`
- `src/styles.scss`
