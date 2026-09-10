# EWApp Prototype Updates

## 2026-09-10

- Added a scoped CSA contact requirement banner that appears only after an inactive lead clicks `Continue and Add Profile (CSA)`.
- Added a dedicated proposal-to-drawer event so other contact-required flows are unchanged.
- Lead activity drawers now open scrolled to the bottom so activity actions are immediately visible.

### Affected files

- `src/app/app.component.ts`
- `src/app/proposal-flow/proposal-flow.component.ts`, `.spec.ts`
- `src/app/components/lead-activity-drawer/lead-activity-drawer.component.ts`, `.html`, `.spec.ts`
- `AGENTS.md`

### Compatibility decisions

- No lifecycle, routing, API, persistence, or unrelated flow behavior was changed.
- Existing shared section-message styling and drawer actions are reused.

### Validation

- Full unit suite: **150/150 passing**.
- `git diff --check` passes.

### Deferred

- Storybook validation is not applicable; the repository has no Storybook setup or script.
