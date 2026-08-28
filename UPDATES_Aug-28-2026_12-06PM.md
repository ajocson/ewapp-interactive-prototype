# Updates as of Aug 28, 2026, 12:06 PM

This handoff log covers proposal-flow updates completed after `UPDATES_Aug-27-2026_6-15PM.md`. It describes the current local working tree; these changes have not been committed by this document.

## Proposal Draft UI

- Rebuilt the Dream Builder proposal draft Info tab to match the supplied Figma reference (`505:38592`): proposal dates, lead details, same-as-lead insured information, editable insured fields, and the bottom Save Proposal action.
- Rebuilt the Benefits tab to match its supplied Figma reference (`2915:91231`), including payment period/frequency, basic sum insured, calculated annual premium, discount state, and the specified field hierarchy.
- The proposal draft Save Proposal action is now enabled and opens the existing confirmation flow.

## Saving and Saved Proposal

- Proposal saving now transitions from the draft to a Figma-matched saved-proposal view (`505:39435`).
- The saved-proposal success toast automatically dismisses after four seconds. A new toast clears any earlier timer, and the component clears its timer when destroyed.
- The parent record tabs continue to derive their active visual state from proposal state, preventing Profile and Proposals from appearing active together.

## Generated Sales Illustration

- Added the generated sales-illustration viewer for the saved proposal’s Generate Sales Illustration action, based on Figma node `505:39510`.
- The action now opens a dedicated viewer with Back to Proposal, a download control, and the local Dream Builder sample illustration (`assets/si-page-1.png`) rendered at the Figma document width.
- Returning from the viewer restores the saved-proposal summary.

## Implementation Notes

- The proposal-draft, saved-proposal, and generated-sales-illustration panels use intentionally scoped bespoke styling for the referenced Figma frames. This is the approved exception to the normal reusable TDX component/token-first rule for these proposal-only panels.
- The generated viewer has an explicit accessible label while the normal proposal workspace retains its existing lead-title association.

## Tests and Validation

- Extended `ProposalFlowComponent` tests for the generated sales-illustration viewer open/return flow.
- Focused proposal-flow test run: **1 file, 9 tests passing**.
- `npm run build` succeeds.

## Current Warnings

The successful production build continues to report the existing SCSS component-budget warnings for:

- `src/app/proposal-flow/proposal-flow.component.scss`
- `src/app/draft-si-flow/draft-si-flow.component.scss`
- `src/app/components/lead-activity-drawer/lead-activity-drawer.component.scss`

## Main Files Updated

- `src/app/proposal-flow/proposal-flow.component.html`
- `src/app/proposal-flow/proposal-flow.component.ts`
- `src/app/proposal-flow/proposal-flow.component.scss`
- `src/app/proposal-flow/proposal-flow.component.spec.ts`
- `src/styles.scss`
