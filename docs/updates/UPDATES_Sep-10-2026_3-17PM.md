# EWApp Prototype Updates

## 2026-09-10

- Matched the Individual Information edit form to the provided Figma layout with a scoped card header, two-column fields, 16px field spacing, and responsive action buttons.
- Added Source of Lead metadata fields for branch, referrer, and EWB client financial segmentation using the existing sample data.
- Updated the sample name presentation to `John Mark` with an enabled No Middle Name checkbox and placeholder.
- Added empty enabled Source of Lead, Product Interested, and Manual Source controls with down-arrow affordances; Referral Date uses the matching `02/03/2026` sample and drawer-style calendar icon.

### Affected files

- `src/app/proposal-flow/proposal-flow.component.html`
- `src/app/proposal-flow/proposal-flow.component.scss`
- `src/app/proposal-flow/proposal-flow.component.ts`
- `src/app/proposal-flow/proposal-flow.component.spec.ts`

### Compatibility decisions

- Changes are scoped to the Individual Information edit form; existing save, navigation, and CSA/proposal flows are unchanged.
- New source controls are presentation-only placeholders; existing branch/referrer metadata remains read-only sample data.
- No API, routing, persistence, or dependency changes were introduced.

### Validation

- Proposal flow unit suite: **30/30 passing**.
- `git diff --check` passes.

### Deferred

- Storybook validation is not applicable; the repository has no Storybook setup or script.
