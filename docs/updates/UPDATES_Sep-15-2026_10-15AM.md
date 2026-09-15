# EWApp Prototype Updates

## 2026-09-15

- Updated the LCAM lead activity drawer for Follow-up leads that have been converted to an application.
- These converted Follow-up leads now show `View Application` and `Generate/View Full Proposal`, while retaining `Park Lead` and `Drop Lead` under Lead Actions.
- Kept the behavior scoped to converted Meeting/Follow-up leads and preserved normal lead and application flows.

### Affected files

- `src/app/components/lead-activity-drawer/lead-activity-drawer.component.{html,spec.ts,ts}`

### API and compatibility decisions

- This remains local prototype state detection based on the existing `Converted to Application` activity; no backend API or dependency changes were introduced.
- Existing application-status drawer actions continue to use `View Applications`; only converted Meeting/Follow-up leads use the singular `View Application` label.

### Validation

- Unit tests: **170/170 passing** across 22 test files.
- Production build passes with existing bundle and component-style budget warnings.
- `git diff --check` passes.

### Deferred

- No `AGENTS.md` changes were needed.
- Commit and push are pending approval.
