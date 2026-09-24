# EWApp Prototype Updates

## 2026-09-24

- Fixed the Pages assembly step to copy the fallback and route-restore files from `preview-source/.github/`, matching the workflow's checkout layout. The previous root-relative paths caused the deployment build to fail after both app builds succeeded.

### Affected files

- `.github/workflows/deploy.yml` — use the preview checkout as the source for the Pages fallback assets.

### Validation

- Confirmed both fallback files exist in the pushed preview branch checkout.
- Workflow YAML parse and `git diff --check` passed.
- The prior workflow run's error was isolated to the incorrect copy source; the app builds had succeeded.

### Remaining

- Confirm the GitHub Pages workflow succeeds and the direct proposal URL loads after this fix is pushed.
