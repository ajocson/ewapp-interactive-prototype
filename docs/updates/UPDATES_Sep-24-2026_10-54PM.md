# EWApp Prototype Updates

## 2026-09-24

- Added a staggered proposal-detail reveal animation, honoring `prefers-reduced-motion` and using proposal-scoped timing variables.
- Fixed GitHub Pages deep links across the main site and `/proposal-revamp/` preview. The custom 404 stores the requested SPA path, selects the matching deployment base, and the generated app index restores the path before Angular starts.
- Updated the durable Pages routing note in `AGENTS.md`. No API, dependency, or LCAM behavior changes.

### Affected files

- `.github/workflows/deploy.yml`, `.github/pages-404.html`, `.github/pages-route-restore.js` — deploy-time fallback and route restoration for both site bases.
- `src/app/proposal-generator/proposal-recommendation-detail.component.scss` — staggered, reduced-motion-aware reveal.
- `AGENTS.md` — Pages routing convention for future maintenance.

### Validation

- `npm run build`: passed; existing bundle/style budget warnings remain, including the proposal stylesheet warning.
- `npm test`: passed, 23 files and 187 tests. JSDOM emitted non-fatal canvas `getContext()` notices.
- `node --check .github/pages-route-restore.js`, workflow YAML parse, and `git diff --check`: passed.
- Storybook build: not applicable; no Storybook script/configuration is present.

### Remaining

- The production Pages deployment and live direct-link behavior still need verification after this branch is pushed and the workflow completes.
