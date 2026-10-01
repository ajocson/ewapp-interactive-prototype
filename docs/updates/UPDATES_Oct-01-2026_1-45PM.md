# EWApp Prototype Updates

## 2026-10-01 — Proposal Revamp checkpoint

- Expanded the proposal-generator landing and product-selection paths while keeping the recommended-proposal entry distinct. Proposal entry from the sidebar preserves the sidebar for the landing page and closes it when the user proceeds into the proposal steps.
- Added per-product Benefits, Riders, and Funds configuration for selected products, a comparison/review step with per-product removal, and a separate multi-product completion branch through the existing Info, CSA, and Proposal Information screens. Saving creates list entries only for products remaining in the review and shows the existing success toast.
- Refined product-info summaries and proposal page layout, including responsive spacing, sticky desktop summary behavior, 16px product labels, and the requested eyebrow alignment. Updated responsive landing headline behavior and proposal copy.
- Updated recommendation details with a sales-illustration viewer and a local application preview component for the multi-product completion walkthrough. Preview data remains in-memory and the application preview is presentation-only.
- Durable architecture boundary recorded in `AGENTS.md`: preserve the separate multi-product branch and keep the application preview distinct from persistent application/backend behavior.

### Affected files

- `src/app/app.component.ts`, `src/app/app.component.spec.ts`
- `src/app/shared/services/app-navigation-state.service.ts`
- `src/app/proposal-generator/_proposal-generator.styles.scss`
- `src/app/proposal-generator/proposal-generator.component.html`, `.ts`, `.spec.ts`
- `src/app/proposal-generator/proposal-recommendation-detail.component.html`, `.scss`, `.ts`, and `.module.ts`
- `src/app/proposal-generator/proposal-application-preview.component.html`, `.scss`, `.ts`
- `src/assets/sales-illustration/page-01.jpg` and `page-02.png` through `page-10.png`
- `src/styles.scss`
- `AGENTS.md`

### Validation

- `git diff --check`: passed.
- Full Angular/Vitest suite: **23 test files, 213 tests passed**. JSDOM printed non-fatal canvas `getContext()` notices.
- `ng build --verbose`: attempted twice, including sequentially; each process aborted with exit code 134 before producing a diagnostic or build result.
- No lint or end-to-end test script is defined in `package.json`.

### Remaining considerations

- The application preview is a local visual prototype; it does not create or persist an application record.
- A browser walkthrough has not been run as part of this checkpoint.
- Investigate the production-build process abort before relying on a build artifact or deployment.
