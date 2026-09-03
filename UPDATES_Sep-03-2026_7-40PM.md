# EWApp Prototype Updates

## 2026-09-03

- Added the `/lcam/api` demo route for simulating an API loading failure.
- Added a two-second lead-board skeleton state before the API error state appears.
- Reused the LCAM Board search-empty page structure for the API error handling state, including the board viewport, empty-state container, light border, rounded corners, background, padding, and full available height.
- Preserved the board header minimum-width behavior while hiding horizontal overflow to match the search-empty presentation.
- Added the Figma-provided API error illustration and error copy.
- Made the LCAM page search field read-only on `/lcam/api` without applying disabled styling, so users cannot enter search text during the demo error state.
- Removed bold styling from the support email in the API error message.

### Verification

- Dashboard and shared search-field tests pass: **27 tests passing**.
- `git diff --check` passes.
