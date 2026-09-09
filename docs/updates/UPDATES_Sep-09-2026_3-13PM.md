# EWApp Prototype Updates

## 2026-09-09

- Added `Submitted Date` and `Updated Date` sorting to the Applications page filter and each Applications board filter, in the requested order before name sorting. Existing LCAM board sorting is unchanged.
- Added a parked-lead-only `Lead Action` section with a full-width `Drop Lead` button that reuses the existing Drop Lead confirmation flow; Park and Reactivate behavior remain unchanged.
- Added the AFYP Declaration information icon and hover guidance, with wrapped black tooltip styling and a normal pointer cursor.
- Hid the Dashboard sidebar item and changed the browser title to `EWApp Interactive Prototype`.

### Affected files

- `src/app/applications/applications.component.ts`, `.html`, `.spec.ts`
- `src/app/components/lead-board/lead-board.component.ts`, `lead-board-filter.model.ts`
- `src/app/components/lead-activity-drawer/lead-activity-drawer.component.ts`, `.html`, `.scss`
- `src/app/components/side-navigation/side-navigation.component.ts`, `.spec.ts`
- `src/index.html`

### Validation

- Applications and Lead Board tests: **16/16 passing**.
- Lead Activity Drawer tests: **9/9 passing**.
- Side Navigation tests: **3/3 passing**.
- `git diff --check` passes.
- Storybook validation is not applicable; no Storybook setup or script exists in `package.json`.

### Deferred

- Date sorting uses the existing application timestamps (`createdAtTimestamp` for submitted date and `lastActivityTimestamp` with creation fallback for updated date); no backend or persistence was introduced.

