# AGENTS.md

Persistent context for Codex and other coding agents working in this repository. Treat the checked-out code as the source of truth. Reinspect affected files before making changes because this is an actively evolving prototype.

## Project Overview

- **Name:** EWApp Interactive Prototype
- **Purpose:** A living Angular prototype used by the UI/UX team to validate EWApp designs, interactions, responsive behavior, and enhancements before development handoff.
- **Primary implemented journey:** LCAM lead board → lead activity drawer → Draft Sales Illustration (SI) → proposal / Client Suitability Assessment (CSA).
- This is a front-end prototype. Lead, customer, product, and form data are currently local sample data; there is no backend integration or persistent storage.

## Tech Stack and Tooling

- Angular `21.2` using a traditional `NgModule` architecture (`AppModule`); components are not standalone.
- TypeScript `5.9`, strict compiler and strict Angular template settings enabled.
- RxJS `7.8`; Angular signals are used for shared navigation state.
- Template-driven Angular forms through `FormsModule` / `ngModel`.
- SCSS with a global CSS custom-property token system.
- Vitest `4` through Angular's `@angular/build:unit-test` builder and JSDOM.
- Local web fonts: Lato (body), Montserrat Bold (headings), and Material Symbols Rounded.
- GitHub Actions deploys `main` to GitHub Pages using Node 22 and the base href `/ewapp-interactive-prototype/`.

Useful commands:

```bash
npm ci                 # clean dependency install (preferred in CI)
npm install            # local dependency install
npm start              # Angular dev server; defaults to http://localhost:4200/
npm start -- --port 4300
npm test               # one-shot unit test run
npm run build          # production build into dist/ewapp-interactive-prototype/browser
```

There is currently no lint script and no end-to-end test suite in `package.json`.

## Project Structure

```text
src/
  app/
    app.component.ts              Root orchestration of board, drawer, Draft SI, and proposal overlays
    app.module.ts                 Root NgModule and shared-module imports
    dashboard/                    LCAM page composition, sample data, page filters, responsive sidebar
    components/                   App-shell and LCAM feature components
      global-header/
      side-navigation/
      icon-button/
      lead-board/
      lead-card/
      lead-activity-drawer/
      status-tag/                 Older/simple status presentation component
      lam-components.module.ts
    shared/
      components/                 Reusable TDX-style Angular components and their modules
        action-card/
        button/
        field-control/
        search-field/
        section-message/
        stepper/
        tab-group/
        tag/
      services/
        app-navigation-state.service.ts
    draft-si-flow/                Product selection, SI forms, results, and proposal entry
    proposal-flow/                Individual information and CSA/proposal prototype stages
    lead-detail/                  Separate lead-detail view; currently not wired into AppComponent
    lead-board.model.ts           Shared board/card/tag interfaces
  assets/                         Logos, UI assets, local fonts, and SI preview images
  styles.scss                     Global fonts, design tokens, theming, overlays, and drawer chrome
.github/workflows/deploy.yml       GitHub Pages deployment
angular.json                      Angular builders, assets, and bundle/style budgets
```

Each reusable component normally has a component class, HTML template, SCSS file, unit spec, and a small NgModule. Feature components follow the same split, except `AppComponent` uses an inline template.

## Architecture and State Flow

- `AppComponent` is the top-level coordinator. It always renders `DashboardComponent`, then conditionally overlays `LeadActivityDrawerComponent` or `DraftSiFlowComponent` based on local state.
- `AppNavigationStateService` is a root-provided service. It uses Angular signals for sidebar visibility and active destination, plus an RxJS `Subject` to request a return to the LCAM board.
- `DashboardComponent` owns the in-memory board data and page filter state. It emits selected leads to `AppComponent`.
- Marking a new lead as contacted mutates the in-memory board arrays: the lead is removed from `Lead`, inserted into `Contacted`, tagged `Contacted`, and changed to `Active`. This state is lost on reload.
- `DraftSiFlowComponent` is a local finite-state flow (`1 | 2 | 3 | 4 | 'results'`). It nests `ProposalFlowComponent` after “Convert to Proposal.”
- `ProposalFlowComponent` uses a string-union stage model for individual information, CSA sections, assessment, and risk profile. Confirmation dialogs and its record-activity drawer are local booleans/state.
- There is no Angular Router. Navigation is conditional rendering and component/service state.
- Most components use `ChangeDetectionStrategy.OnPush`. Preserve immutable input updates or call `markForCheck()` after imperative state changes where required.
- Data contracts use TypeScript interfaces and union/enum models rather than untyped objects.

## Development Standards

- Keep TypeScript and Angular templates compatible with the existing strict configuration.
- Use constructor or `inject()` dependency injection consistently with the surrounding file.
- Use typed `@Input()` / `@Output()` contracts and semantic models. Required inputs use `@Input({ required: true })` where appropriate.
- Keep feature orchestration in feature/root components and generic styling/behavior in reusable shared components.
- Prefer `trackBy` functions for repeated board/card data.
- Preserve `OnPush` change detection.
- Use semantic HTML first: buttons for actions, `nav`, headings, `fieldset`/`legend`, `dl`, and dialog roles as already established.
- All icon-only buttons need an accessible label. Decorative icons and images use `aria-hidden="true"` or empty alt text.
- Dialogs/drawers should expose `role="dialog"`, `aria-modal`, and an accessible title. Existing overlays close by overlay click and/or Escape where implemented.
- Keyboard focus must remain visible through tokenized focus rings. Preserve disabled, hover, pressed, loading, and focus states on reusable controls.
- Respect `prefers-reduced-motion` for added animation.
- Add or update a colocated `*.spec.ts` for behavioral changes. Prefer observable behavior/state assertions over implementation details.
- Do not introduce routing, a state library, API services, or new dependencies without an explicit requirement; the current architecture is intentionally lightweight.

## Design System Rules

The code identifies its UI foundation as **TDX Design System V2**. For LCAM board, application-shell, side-drawer, and reusable-control work, use the existing shared components and token conventions instead of creating parallel one-off controls.

### Tokens and styling

- `src/styles.scss` is the canonical token layer.
- Tokens are grouped as primitives (color, spacing, radius, typography, shadows, motion), semantic tokens (surface, text, icon, border, focus, disabled), and component tokens.
- Component SCSS should consume CSS variables. Avoid adding raw colors or repeated magic dimensions when an appropriate token exists; add a named token in the correct layer if needed.
- Body text uses Lato; heading typography uses Montserrat Bold. Material icons use the bundled Material Symbols Rounded font.
- Existing spacing follows the `--space-*` scale; radii use `--radius-*`; layer ordering uses `--layer-*`.
- A partial dark-theme semantic override exists under `[data-theme='dark']`. New reusable components should use semantic tokens so they remain theme-ready.
- Global overlay/drawer chrome is intentionally in `src/styles.scss` because it is shared across application layers.

### Reusable components

- Prefer `app-button` / `tdx-button` for TDX buttons.
- Prefer `app-search-field` / `tdx-search-field` for page search.
- Prefer `app-field-control` / `tdx-field-control` for compact actions and dropdown-like fields.
- Prefer `app-tab-group`, `app-stepper`, `app-tag`, and `app-section-message` for their respective patterns.
- Use `lam-action-card` for drawer action rows and `lam-icon-button` for tooltip/icon actions.
- Many shared components intentionally expose both `tdx-*` and `app-*` selectors. Do not create a third selector or duplicate implementation without a verified need.
- Inner Draft SI and proposal pages currently contain some bespoke controls/layouts; preserve exact source design behavior when changing them, but reuse existing shared components where the current design explicitly maps to one.

### Responsive and accessibility behavior

- The global sidebar is open by default at `min-width: 1024px`; below that it becomes an overlay controlled from the shared header.
- LCAM boards flex between tokenized minimum and maximum widths (`227px`–`454px`). When all columns do not fit, the board viewport scrolls horizontally; do not collapse the pipeline into an unrelated layout.
- Draft SI has a mobile layout below `760px`; proposal/lead-detail layouts adapt at `900px` and/or `720px`.
- Maintain horizontal/vertical scroll containment, visible focus states, screen-reader labels, and reduced-motion behavior.

The repository does not currently store direct Figma URLs. If a task requires pixel parity, obtain the relevant node from the user/task context and compare it with the existing token/component implementation before editing.

## Implemented Components and Features

### LCAM board

- Shared global header and responsive side navigation.
- Five in-memory pipeline boards: Lead, Contacted, Appointments, Meetings, and Follow-Up.
- Responsive fixed-minimum-width columns with independent vertical scrolling and horizontal board scrolling.
- Lead cards with name, formatted creation timestamp, semantic tags, active/inactive state, and aging.
- Page search, source dropdown, lead status/state filters, and sorting.
- Per-board search and per-board status/type/sort menu; no-result searches intentionally leave the board blank.
- Card selection opens the lead activity drawer.
- New-lead drawer includes overview/timeline tabs, lead information, Draft SI entry, stepper, notes, Mark as Contacted, Park Lead, and Drop Lead controls.
- Mark as Contacted moves the lead to Contacted in memory, advances the drawer to appointment actions, and shows a success message.

### Draft Sales Illustration

- Product category tabs and product selection; only Dream Builder is enabled/selectable.
- Prefilled insured information and coverage forms.
- Read-only lead review step.
- Generated results view using a static SI page image.
- Start-over, download-page-image, and Convert to Proposal actions.

### Proposal / CSA

- Shared EWApp header/sidebar and lead record header.
- Prefilled individual-information edit and summary states.
- Add Profile and Save CSA confirmation dialogs.
- CSA stages for information, needs ranking display, calculation fields, assessment, and risk-profile result.
- Record Activity side drawer with shared TDX tab, tag, button, stepper, section-message, and action-card components.
- Responsive layouts for narrower viewports.

### Reusable component library

- Buttons with typed variant/emphasis/size contracts and disabled/loading behavior.
- Search field, field/dropdown control, icon button, tags, tab group, stepper, section message, and action card.
- Unit coverage exists for the shared components and major feature flows.

## Important Decisions to Preserve

- The codebase itself, not screenshots or old conversation history, is the baseline. Reconcile new Figma requirements against current behavior before replacing anything.
- LCAM/app-shell/drawer UI should remain built from the TDX-style shared components and global tokens.
- Board width must not change when board search opens; the board retains its responsive width contract.
- Empty search results remain visually blank; do not reintroduce a “No matches were found” state unless explicitly requested.
- LCAM Board navigation returns to the board from inner flows and is only active when `activeDestination` is `lcam-board`.
- Sidebar visibility is shared across the board and proposal flow.
- Drawer entrance uses right-to-left motion; the overlay uses the shared 50% black modal token. Reduced-motion users get no drawer animation.
- Draft SI sample values are intentionally prefilled for prototype walkthroughs.
- The prototype currently uses local assets rather than remote runtime dependencies.

## Current Project State

Verified on **2026-08-19**:

- Branch: `main`.
- Latest checked-in commit at inspection time: `e72b35e` (`fix: restore responsive LCAM board sizing`).
- Unit tests: **17 files, 46 tests passing** via `npm test`.
- Production build: succeeds via `npm run build`.
- Current initial production bundle reported by Angular: approximately 397 kB raw / 85 kB estimated transfer.
- The worktree already contains substantial **uncommitted user changes**, including the lead activity drawer, field control, updated LCAM filtering/data, and contacted-state flow. Preserve and inspect these changes before editing. Do not reset, discard, or overwrite them.
- `AGENTS.md` is documentation only; its creation should not imply that the existing uncommitted application work is ready to commit.

## Known Issues and Limitations

- Production build emits component-style budget warnings:
  - `draft-si-flow.component.scss`: about 12.61 kB vs. 8 kB warning budget.
  - `proposal-flow.component.scss`: about 14.38 kB vs. 8 kB warning budget.
- No backend, authentication, API calls, persistence, or real customer data. Reloading resets all state.
- No Angular Router; browser history/deep links are not implemented.
- `LeadDetailComponent` exists and is tested but is not reachable from the root application flow.
- Several visible controls are prototype-only/no-op, including most navigation destinations, New Lead, sidebar Draft SI, Edit Lead Information, Park/Drop Lead, some proposal actions, Create Proposal, and portions of activity/action flows.
- In the contacted LCAM drawer, “Generate Full Proposal” currently has no emitted action; only the new-lead “Generate Draft SI” branch is wired.
- Activity Timeline in the LCAM drawer is an empty state.
- The LCAM drawer header currently renders `Active` text regardless of the source lead's existing `leadType`.
- Board and form data are hard-coded in component classes/templates. Some proposal and SI summary values are also fixed rather than derived from the selected lead/form state.
- Draft SI results display and download only `si-page-1.png`; `si-page-2.png` exists but is unused.
- Only Dream Builder is actionable in product selection; other products are deliberately disabled.
- Shared-component adoption is incomplete in bespoke Draft SI/proposal forms and some board-specific filter controls.
- No lint command, automated accessibility audit, visual regression suite, or browser E2E suite is configured.
- Dark-theme tokens are partial and no UI theme switch is implemented.

## Pending Work / Identifiable TODOs

There are no explicit `TODO`/`FIXME` markers in the inspected source. The following gaps are inferred directly from unhandled controls and current implementation:

- Wire contacted-drawer “Generate Full Proposal” if the intended destination is confirmed.
- Implement schedule/unable-to-schedule actions and resulting board/drawer transitions.
- Implement or intentionally remove remaining no-op actions.
- Decide whether `LeadDetailComponent` should be connected or retired.
- Derive sample summaries from current lead/form state where prototype fidelity requires it.
- Support remaining SI pages/products if the intended flow includes them.
- Reduce or formally adjust the two SCSS style-budget warnings.
- Add E2E/visual/accessibility coverage for critical interactive flows.

These are not confirmed product requirements; verify against the current Figma nodes or an explicit user request before implementing.

## Recommended Next Steps

1. Review the current uncommitted diff before any new implementation; do not assume `HEAD` represents the visible prototype.
2. Validate new requests against the specific Figma frame/component state and the existing TDX token/component layer.
3. Complete one user flow at a time and test both state transitions and responsive presentation.
4. Prefer extending shared TDX components over introducing page-local replicas.
5. Run `npm test`, `npm run build`, and a focused browser walkthrough before handoff.
6. Report the existing style-budget warnings separately from functional failures.

## Agent Safety and Handoff Notes

- Do not commit or push unless the user explicitly asks.
- Never discard unrelated changes in this dirty worktree.
- Use `rg` / `rg --files` for repository searches and `apply_patch` for manual edits.
- Keep changes scoped; do not refactor working prototype areas as collateral work.
- When handing off, state exactly which flows were changed, which commands passed, and any remaining Figma/design mismatches or unverified assumptions.
