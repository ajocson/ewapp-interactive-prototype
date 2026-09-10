# EWApp Prototype Updates

## 2026-09-10

- Fixed floating LCAM scenario links on GitHub Pages by routing them through Angular `routerLink`, preserving the repository base path.
- Updated the side-navigation test coverage to verify generated route URLs.

### Affected files

- `src/app/components/lam-components.module.ts`
- `src/app/components/side-navigation/side-navigation.component.html`
- `src/app/components/side-navigation/side-navigation.component.spec.ts`

### API and compatibility decisions

- No API or backend changes; scenario navigation remains a local front-end walkthrough and now works with both localhost and the GitHub Pages base href.

### Validation

- Unit tests: **155/155 passing** across 22 test files.
- Production build passes; existing bundle and component-style budget warnings remain.
- `git diff --check` passes.

### Deferred

- GitHub Pages deployment must complete before the corrected links appear on the live preview.
