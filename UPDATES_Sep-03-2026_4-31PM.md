# EWApp Prototype Updates

## 2026-09-03

- Added the Draft SI quick-quote and product-selection entry flow from the sidebar while preserving the existing lead-card flow.
- Continue from the product picker now opens the existing Insured Basic Information step with Dream Builder selected.
- Added the Figma-matched Update Individual Information modal after Convert to Proposal. Continue to Update opens the existing Info tab in edit mode.
- Info remains editable when entering proposal setup; Profile and Proposals stay locked until their respective journey milestones are completed.
- Sidebar Draft SI Step 4 uses a blank Search Existing Lead field with editable sample information in the remaining fields.
- Sidebar Draft SI Cancel closes the flow without reopening the lead activity drawer.
- Styled the sidebar Step 4 checkbox with the magenta accent color.
- Updated the Update Individual Information modal to a fixed 322px height.
- Added Figma-provided modal icon assets under `src/assets/icons/`.

### Verification

- Focused Draft SI and AppComponent tests pass: **23 tests passing**.
- Focused proposal-flow and AppComponent tests pass: **45 tests passing**.
- `git diff --check` passes.
