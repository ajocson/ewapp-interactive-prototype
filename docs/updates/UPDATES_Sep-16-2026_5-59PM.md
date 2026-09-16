# EWApp Prototype Updates

## 2026-09-16

- Updated the GitHub Pages workflow to publish the production `main` build at the site root and the `feature/proposal-revamp` build under `/proposal-revamp/`.
- Removed the uncommitted Vercel and separate-preview-repository setup.
- Added SPA fallback files for both paths so Angular deep links continue to load on GitHub Pages.

### Affected files

- `.github/workflows/deploy.yml`
- `AGENTS.md`

### API and compatibility decisions

- Both builds are assembled into one GitHub Pages artifact, so the production root remains available while the branch preview is served from its subpath.
- The preview uses `/ewapp-interactive-prototype/proposal-revamp/` as its Angular base href; the production build keeps `/ewapp-interactive-prototype/`.
- No backend, database, external deployment provider, or additional repository is required.

### Validation

- Workflow syntax reviewed locally.
- Production build with the preview base href passed; existing bundle/style budget warnings remain.
- Existing unit tests passed: 23 test files and 176 tests.
- `git diff --check` passed.

### Deferred

- The workflow must be committed and pushed before GitHub Actions can publish the preview.
- GitHub Pages will show the combined artifact after the next successful deployment.
- No commit or push was performed for this setup.
