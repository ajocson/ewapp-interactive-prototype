# EWApp Prototype Updates

## 2026-09-10

- Refined LCAM API-error walkthrough loading behavior: board-loading and page-search scenarios show board skeletons before their error states.
- Kept `Try Again` within the board-loading failure scenario, replaying its skeleton and error state instead of restoring lead data.
- Preserved API-error routes on browser refresh and cleared the page-search query when navigating to another LCAM route.
- Kept the page-search query and failed scenario route during `Try Again`, replaying loading before showing the search error again.

### Affected files

- `src/app/app.component.ts`
- `src/app/dashboard/dashboard.component.{html,ts}`

### API and compatibility decisions

- These remain deterministic local mock scenarios with no backend API changes; normal LCAM navigation and search behavior remain unchanged.

### Validation

- Unit tests: **155/155 passing** across 22 test files.
- Production build passes with existing bundle and component-style budget warnings.
- `git diff --check` passes.

### Deferred

- Changes are prepared locally and still require commit/push before appearing on GitHub Pages.
