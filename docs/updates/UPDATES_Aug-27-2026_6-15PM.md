# Updates as of Aug 27, 2026, 6:15 PM

This handoff log consolidates the updates in `UPDATES_Aug-27-2026_4-08PM.md` and the work completed afterward. It describes the current local working tree only; these changes have not been committed by this document.

## Activity Timeline UI

- Updated the lead activity drawer timeline to distinguish an activity's scheduled date/time from the time it was recorded.
- Every Sales Activity and System Transaction persistently displays a muted `Recorded on <date> at <time>` line.
- Activities with a schedule display a separate caption/regular row above the recorded line, using Material Symbols `calendar_month` and `schedule` icons, a date/time divider, and neutral-primary text.
- Appointment scheduling and rescheduling retain both timestamp types in `LeadActivityRecord`: `recordedDateLabel` / `recordedTimeLabel` and optional `scheduledDateLabel` / `scheduledTimeLabel`.
- Timeline notes use subtle-surface and primary-text tokens. They truncate by default and expand or collapse when clicked.
- The timeline connector and completed marker follow the shared TDX stepper token contract.

## Appointment Card States

- `Appointment Rescheduled` uses the existing TDX `primary` tag variant (purple).
- `Appointment Canceled` uses the existing TDX `danger` tag variant (red).
- Added a Figma-matched Past Due appointment sample in the Appointments board. Its `Appointment Scheduled` tag remains success, while its date/time uses a TDX danger tag.
- Removed the `Upcoming` tag from scheduled activity cards across the drawer.

## Applications Page

- Added an Applications destination to the app shell and sidebar navigation.
- Implemented three reusable lead-board columns: In Progress, Action Required, and Completed.
- Added local sample cards for all supported application statuses, including repeated cards per status for search and filtering walkthroughs.
- Added page-level search by Lead ID or name, multi-select source filtering, filter state indication, referrer search/suggestions, status filtering, sorting, reset, and apply behavior.
- The page-level Lead Status filter contains every status present across all application boards.
- Board-level `Filter by Lead Status` options are scoped to the current board:
  - In Progress: Application Submitted and Underwriting Ongoing.
  - Action Required: Needs More Info and Conditionally Accepted.
  - Completed: Policy Released, Approved, Unapproved, Withdrawn, and Postponed.
- Referrer suggestion searches show `No results found` only inside the referrer suggestions popover when there are no matching referrers.
- Board searches and applied page filters leave boards visually blank when they have no matching cards; no board-level empty-state message is shown.
- Removed the temporary John Mark Doe application sample.

## Lead Cards and Filtering

- Lead cards now display Lead ID and aging information; non-Lead boards support overall aging and TAT aging while the Lead board keeps its single aging indicator.
- Lead-card sample states include rescheduled, canceled, and Past Due appointments using existing design-system tag variants.
- LCAM and Applications source pickers share the complete source option set.
- Content-fitting field-control menus now measure their widest option so long labels, including `Non-EWA Online Publications Posts`, do not wrap or clip.
- LCAM and Applications source controls opt into content-hugging menus. Application page and board status filters use the same shared field-control sizing behavior.

## Design-System Alignment

- Timeline scheduled date/time uses `--caption-text-size` and `--caption-line-height`; scheduled-row icons use `--icon-lg`.
- Added the semantic `--surface-subtle` token and dark-theme override for subdued timeline note surfaces.
- Status colors continue to use existing `app-tag` / TDX variants; no bespoke red or purple status colors were added.
- New application UI composes existing shared controls: `app-search-field`, `tdx-field-control`, `app-radio`, `app-button`, and `lam-lead-board`.

## Tests and Validation

- Extended dashboard, app integration, lead-board, field-control, and application-flow tests for timeline metadata, appointment tag variants, the Past Due sample, blank filtered boards, referrer empty results, and application filtering.
- Verified that a long LCAM source option no longer overflows its dropdown and that an empty Applications board remains blank.
- `npm test -- --watch=false`: 22 test files, 105 tests passing.
- `npm run build`: succeeds.

## Current Warnings

The production build continues to report SCSS component-budget warnings for:

- `src/app/draft-si-flow/draft-si-flow.component.scss`
- `src/app/proposal-flow/proposal-flow.component.scss`
- `src/app/components/lead-activity-drawer/lead-activity-drawer.component.scss`

These size-budget warnings do not prevent a successful build.

## Main Files Updated

- `src/app/app.component.ts`
- `src/app/app.component.spec.ts`
- `src/app/app.module.ts`
- `src/app/applications/`
- `src/app/components/lead-activity-drawer/lead-activity-drawer.component.{ts,html,scss,spec.ts}`
- `src/app/components/lead-board/lead-board.component.{ts,html,scss,spec.ts}`
- `src/app/components/side-navigation/side-navigation.component.ts`
- `src/app/dashboard/dashboard.component.{ts,html,spec.ts}`
- `src/app/lead-board.model.ts`
- `src/app/shared/components/field-control/field-control.component.ts`
- `src/app/shared/components/scheduled-activity-card/scheduled-activity-card.component.{ts,html,scss}`
- `src/app/shared/services/app-navigation-state.service.ts`
- `src/styles.scss`
