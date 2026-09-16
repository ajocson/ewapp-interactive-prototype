# EWApp Prototype Updates

## 2026-09-16

- Added the standalone `/proposals` proposal-generator page with the shared EWApp header and hidden-by-default sidebar behavior.
- Added the Generate Proposal sidebar action and app-navigation route/state wiring.
- Implemented the proposal landing page, product cards, hero CTA, Question 1 coverage/details form, native date picker, gender field control, and Question 2 multi-select goal cards.
- Matched the supplied proposal/design-system references for spacing, responsive card layout, 16px goal descriptions, 14px checkbox geometry, selected checkbox treatment, and content-hugging goal-card height.

### Affected files

- `src/app/proposal-generator/`
- `src/app/app.component.ts`
- `src/app/app.component.spec.ts`
- `src/app/app.module.ts`
- `src/app/app-routing.module.ts`
- `src/app/components/side-navigation/`
- `src/app/dashboard/`
- `src/app/shared/services/app-navigation-state.service.ts`
- `src/styles.scss`
- `src/assets/proposal-*.png`

### API and compatibility decisions

- This remains a local front-end prototype with in-memory questionnaire state; no backend, API, persistence, or new dependency was introduced.
- Existing shared header, sidebar, button, and field-control components remain in use. Proposal-specific questionnaire cards and checkbox visuals stay local to the proposal-generator feature because no shared standalone checkbox component exists.
- `AGENTS.md` required no update; the current work does not introduce a durable repository-wide convention beyond existing guidance.

### Validation

- Unit tests: **176/176 passing** across 23 test files.
- Production build: passed; Angular reports the existing bundle/component-style warning budgets.
- `git diff --check`: passes.

### Deferred

- Question 3–5 proposal questionnaire states and final proposal recommendation behavior remain outside this checkpoint.
- Storybook build was not run because the repository has no Storybook configuration or script.
- Commit and push are pending approval.
