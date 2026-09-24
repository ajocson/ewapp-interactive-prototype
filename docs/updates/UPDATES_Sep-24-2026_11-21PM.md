# EWApp Prototype Updates

## 2026-09-24

- Proposal detail navigation now resets the proposal content scroller to the top in both directions: recommendations → detail via **View Proposal**, and detail → recommendations via **View Other Proposals**. Question 1's intentional scroll-to-details behavior remains unchanged.
- Raised the mobile detail-tab bar's stacking order while its overflow menu is open so the menu overlays the following panel content.
- No LCAM behavior/source changes.

### Affected files

- `src/app/proposal-generator/proposal-generator.component.html`, `.ts`, `.spec.ts` — scoped scroll reset and regression assertions.
- `src/app/proposal-generator/proposal-recommendation-detail.component.html`, `.scss` — mobile overflow menu stacking.

### Validation

- `npm run build`: passed with existing bundle and component-style budget warnings.
- `npm test`: passed, 23 test files and 187 tests; JSDOM emitted non-fatal canvas `getContext()` notices.
- `git diff --check`: passed.

### Remaining

- None for this change; GitHub Pages will reflect it after push and a successful deployment.
