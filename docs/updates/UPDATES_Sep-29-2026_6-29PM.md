# EWApp Prototype Updates

## 2026-09-29

- Removed Unit Name from Agency New Lead Step 2. Both Agency and Banca now display Store/Branch Name and Store/Branch ID; Banca's self-generated and referral source paths retain their existing fields and values.
- Renamed the shared Applications status `Unapproved` to `Declined` in sample cards, page and board filters, drawer status handling, and generated system activities. Declined keeps the existing danger tone and restricted drawer actions.
- Updated `AGENTS.md` to keep the role-specific New Lead and Declined status guidance current.

### Affected files

- `src/app/app.component.ts` and `src/app/app.component.spec.ts`
- `src/app/applications/applications.component.ts` and `src/app/applications/applications.component.spec.ts`
- `src/app/components/lead-activity-drawer/lead-activity-drawer.component.ts` and its spec
- `AGENTS.md`

### API and compatibility decisions

- Presentation and local status strings only; no backend API, route, dependency, or data-model changes. Existing lead creation and application action behavior are preserved.

### Validation

- `npm test`: 171 tests passed across 22 files.
- `npm run build`: passed with existing bundle and component SCSS budget warnings.
- `git diff --check`: passed. No Storybook script or configuration exists, so a Storybook build is not applicable.

### Deferred

- Existing size-budget warnings remain. Commit and push await approval.
