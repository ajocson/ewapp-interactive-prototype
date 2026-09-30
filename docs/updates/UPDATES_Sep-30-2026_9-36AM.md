# EWApp Prototype Updates

## 2026-09-30

- Sales Activities and System Transactions now display newest first within their separate groups, sorted by recorded `occurredAtTimestamp` rather than scheduled appointment date.
- Opening Activity Timeline resets its scroll to the top; the Overview opening position and existing tab state resets remain unchanged.
- Completed Grace Kelly's final Policy Released sample timestamp so the latest system transaction sorts correctly. Updated drawer tests and the durable ordering guidance in `AGENTS.md`.

### Affected files

- `src/app/components/lead-activity-drawer/lead-activity-drawer.component.ts`, `.html`, and `.spec.ts`
- `AGENTS.md`

### API and compatibility decisions

- Display ordering and one sample timestamp only. Activity storage order, lead and application flows, routes, APIs, models, and dependencies are unchanged.

### Validation

- `npm test`: 171 tests passed across 22 files.
- `npm run build`: passed with existing bundle and component SCSS size-budget warnings.
- `git diff --check`: passed. No Storybook script or configuration exists.

### Deferred

- Existing size-budget warnings remain. Commit and push await approval.
