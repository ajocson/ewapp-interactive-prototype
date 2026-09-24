# EWApp Prototype Updates

## 2026-09-24

- Completed the proposal-revamp recommendation experience: expanded questionnaire, recommendation/comparison views, proposal detail tabs, responsive layouts, and mesh-gradient presentation.
- Added proposal detail and mesh-gradient components, local design assets, recommendation routes, and supporting tests. Refined shared header and field-control behavior used by the flow.
- Tuned proposal-detail CTA button emphasis and spacing, and recommendation callout alignment/button style at narrow viewports.
- Moved the large proposal-generator stylesheet to a proposal-host-scoped global Sass module so the production component-style budget passes; no LCAM styles or behavior were changed.

### Affected files

- `src/app/proposal-generator/` — recommendation flow, detail view, mesh-gradient component/shader, and proposal-generator tests/styles.
- `src/app/proposal-generator/proposal-generator.global.scss`, `src/app/proposal-generator/_proposal-generator.styles.scss` — proposal-host-scoped stylesheet module.
- `src/app/app-routing.module.ts`, `src/app/app.module.ts`, `src/app/app.component.ts`, `src/app/app.component.spec.ts` — route/module integration and root behavior/tests.
- `src/app/components/global-header/` — responsive header and tests.
- `src/app/shared/components/field-control/field-control.component.ts` — field-control adjustment supporting the proposal flow.
- `src/styles.scss` — shared visual tokens/styles.
- `src/assets/` — proposal hero/family imagery, option illustrations, slider thumb, and wave/gradient assets.

### API and compatibility decisions

- No backend/API or dependency changes; recommendation content and proposal data remain local prototype data.
- Existing Angular routing, shared button contract, and responsive breakpoints are retained; no production/main deployment behavior was changed.
- Proposal styles are scoped beneath `lam-proposal-generator`; the shared style budget was not raised and LCAM files were left unchanged.

### Validation

- `npm test`: passed, 23 test files and 187 tests. JSDOM emitted non-fatal canvas `getContext()` notices.
- `git diff --check`: passed.
- Deployment-equivalent production build with `/ewapp-interactive-prototype/proposal-revamp/` base href: passed. Existing initial-bundle and other component-style budget warnings remain, but no component-style maximum error blocks deployment.
- Storybook build: not applicable; no Storybook script/configuration is present.

### Deferred

- Existing bundle and unrelated component-style warnings remain below their configured error limits.
- The fix is uncommitted and unpushed; GitHub Pages preview will update only after a follow-up push to `feature/proposal-revamp` and a successful Pages deployment.
