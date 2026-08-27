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
        radio/
        scheduled-activity-card/
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
  assets/                         Logos, local fonts, SI preview images, and lead-state icons
  styles.scss                     Global fonts, design tokens, theming, overlays, and drawer chrome
.github/workflows/deploy.yml       GitHub Pages deployment
angular.json                      Angular builders, assets, and bundle/style budgets
```

Each reusable component normally has a component class, HTML template, SCSS file, unit spec, and a small NgModule. Feature components follow the same split, except `AppComponent` uses an inline template.

## Architecture and State Flow

- `AppComponent` is the top-level coordinator. It always renders `DashboardComponent`, then conditionally overlays `LeadActivityDrawerComponent` or `DraftSiFlowComponent` based on local state.
- `AppNavigationStateService` is a root-provided service. It uses Angular signals for sidebar visibility and active destination, plus an RxJS `Subject` to request a return to the LCAM board.
- `DashboardComponent` owns the in-memory board data, page filter state, activity records, appointment data, and all LCAM board mutations. It emits selected leads to `AppComponent`.
- `AppComponent` translates typed drawer events into dashboard mutations. Successful activities keep the drawer open, return the active destination to LCAM Board, and show a centered top success message after an 800 ms delay; the message dismisses after four seconds. The updated lead ID is held until the user closes the drawer, at which point the card is highlighted in its destination/current board.
- The implemented pipeline transitions are `Lead` → `Contacted` → `Appointments` → `Meetings` → `Follow-Up`. Rescheduling and cancellation update a lead within `Appointments`; parking and dropping keep the lead in its current board while changing its `leadType`. Parked leads can be reactivated in place; dropped leads are reference-only and do not expose reactivation.
- `LeadCardData` carries source/referrer/product metadata, gender, creation and last-activity timestamps, optional appointment details, and typed sales/system activity records. Each record carries an `occurredAtTimestamp`, a display date/time, and optional notes. Display titles are derived with `leadDisplayName()` (`Mr.` for male sample data and `Ms.` for female sample data).
- `DashboardComponent` appends activity records as lifecycle mutations occur. `LeadActivityDrawerComponent` groups them by category and displays each group in chronological order (earliest to latest) using `occurredAtTimestamp`; appointment activities use the scheduled start–end range in their display time.
- Page filters and board-level filters use separate pending/draft and applied state. Page filtering combines name, source, lead status, lead state, referrer, and sort; board filtering combines local search, lead state, and sort.
- `DraftSiFlowComponent` is a local finite-state flow (`1 | 2 | 3 | 4 | 'results'`). It nests `ProposalFlowComponent` after “Convert to Proposal.”
- `ProposalFlowComponent` uses a string-union stage model for individual information, CSA sections, assessment, and risk profile. Its local state also drives the product-picker overlay, proposal draft, sales-illustration state, proposal-save confirmation/toast, and generated-proposal view. Parent record tabs derive their active state from this view state so Profile and Proposals cannot both appear active.
- There is no Angular Router. Navigation is conditional rendering and component/service state.
- Most components use `ChangeDetectionStrategy.OnPush`. Preserve immutable input updates or call `markForCheck()` after imperative state changes where required.
- Data contracts use TypeScript interfaces and union/enum models rather than untyped objects.

## Development Standards

- Keep TypeScript and Angular templates compatible with the existing strict configuration.
- Use constructor or `inject()` dependency injection consistently with the surrounding file.
- Use typed `@Input()` / `@Output()` contracts and semantic models. Required inputs use `@Input({ required: true })` where appropriate.
- Keep feature orchestration in feature/root components and generic styling/behavior in reusable shared components.
- For in-memory lifecycle changes, replace/update lead objects immutably, append a typed `LeadActivityRecord`, update `lastActivityTimestamp`, and place the affected lead first in its destination/current board.
- When adding a dropdown-like control, use `FieldControlComponent` rather than local menu state. It owns open-state coordination: opening one field control closes the others, and outside clicks or Escape close the active menu.
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
- Global overlay/drawer chrome is intentionally in `src/styles.scss` because it is shared across application layers. The namespaced product-picker and generated-proposal presentation styles also live there to share that layer and stay within the enforced component-style budget; keep those rules token-based.

### Reusable components

- Prefer `app-button` / `tdx-button` for TDX buttons.
- Prefer `app-search-field` / `tdx-search-field` for page search.
- Prefer `app-field-control` / `tdx-field-control` for compact actions and dropdown-like fields.
- `FieldControlComponent` supports single selection and checkbox-based multi-selection; use its `multiple`, `selectedValues`, and `selectedValuesChange` contract instead of building another checkbox menu. Its non-fluid controls fit their configured menu/control width, while `fluid` fills the available container.
- Prefer `app-radio`, `app-tab-group`, `app-stepper`, `app-tag`, and `app-section-message` for their respective patterns.
- Use `app-scheduled-activity-card` / `tdx-scheduled-activity-card` for the appointment summary with reschedule and cancellation actions.
- Use `lam-action-card` for drawer action rows and `lam-icon-button` for tooltip/icon actions.
- TDX tags are static status indicators in this prototype; they intentionally have no hover or pressed visual state.
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

- Shared global header with a TDX-style Search control and responsive side navigation.
- Five in-memory pipeline boards: Lead, Contacted, Appointments, Meetings, and Follow-Up.
- Responsive fixed-minimum-width columns with independent vertical scrolling and horizontal board scrolling.
- Lead cards with gender-derived title, formatted creation timestamp, stage tag, optional schedule tag, semantic lead state, aging, and post-activity highlight. Schedule tags are hidden while a lead is parked or dropped.
- Page search, source dropdown, checkbox-based lead status/state filters, referrer filter, sorting, and an active-filter indicator.
- Per-board search plus lead-state checkbox and sort controls. Recently Created (using last activity when present) is the default, board width stays stable while searching, and no-result searches intentionally leave the board blank.
- Card selection opens the lead activity drawer.
- The drawer includes TDX overview/timeline tabs, lead metadata, stage-aware Draft SI/full-proposal labeling, stage actions, and Sales Activities/System Transactions. The progress indicator has three steps outside Follow-Up and adds a fourth Follow-up step only for leads in the Follow-Up board.
- Mark as Contacted moves a lead to Contacted. Scheduling moves it to Appointments; reschedule/cancel update it there; Appointment Completed moves it to Meetings; For Follow-up moves it to Follow-Up.
- The appointment scheduler defaults to today, exposes half-hour time choices, and excludes elapsed times when today is selected. Scheduled appointments use the shared scheduled-activity card and support reschedule, cancellation, notes, and completion.
- Follow-Up leads can proceed to application, schedule a follow-up appointment, or record updates. A scheduled follow-up presents an information banner, a follow-up appointment card, notes, and a Presentation Completed action. Completing that presentation restores the three follow-up actions, allowing repeated follow-up scheduling and update recording.
- Park and Drop are available across boards, use local state-specific SVG assets, require confirmation, append activities, and preserve the lead's board stage. Drop uses a fixed list of supported reasons. Parked leads can be reactivated across boards and use the `Reactivated` state; dropped leads do not expose reactivation.
- Successful lifecycle actions keep the drawer open and show a responsive-width success message. Closing the drawer then highlights the affected card at the top of its board.
- The timeline uses chronological Sales Activities and System Transactions. Initial sample histories reflect the required journey for their board/state, including the lead creation, contact, appointment/meeting/follow-up, park/drop/reactivate, and SI/CSA/proposal system records that apply to that lead.

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
- Risk Profile can open a product-picker overlay. A selected product opens a local proposal draft with Info and Benefits tabs; the user can mark a sales illustration generated, save through confirmation, receive a success toast, and view a generated-proposal summary with a medium Convert to Application button.
- The product picker presents seven local sample products, permits exactly one selection, and uses the secondary/magenta selection treatment. Its category tabs currently change only the active visual state; they do not filter the product grid.
- Record Activity side drawer with shared TDX tab, tag, button, stepper, section-message, and action-card components.
- Responsive layouts for narrower viewports.

### Reusable component library

- Buttons with typed variant/emphasis/size contracts and disabled/loading behavior.
- Search field, single/multi-select field control, radio, icon button, tags, tab group, stepper, section message, action card, and scheduled-activity card.
- Unit coverage exists for the shared components and major feature flows.

## Important Decisions to Preserve

- The codebase itself, not screenshots or old conversation history, is the baseline. Reconcile new Figma requirements against current behavior before replacing anything.
- LCAM/app-shell/drawer UI should remain built from the TDX-style shared components and global tokens.
- Board width must not change when board search opens; the board retains its responsive width contract.
- Empty search results remain visually blank; do not reintroduce a “No matches were found” state unless explicitly requested.
- Recent board ordering is activity-based: a lead changed or moved by an activity belongs first in its board, and page/board “Recently Created” sorting uses `lastActivityTimestamp` when present.
- Lead activity timelines are grouped by Sales Activities/System Transactions and rendered chronologically within each group by `occurredAtTimestamp`. Keep timestamps, displayed date/time ranges, optional notes, and the lead's current board/state mutually consistent when adding sample data or mutations.
- Parked/dropped/reactivated state is independent of pipeline stage. Park/drop/reactivate must not move a lead to a different board; paused leads keep their stage tag and hide appointment schedule tags. Only parked leads can be reactivated, which sets their state to `Reactivated`; dropped leads remain reference-only.
- Lifecycle completion actions keep the drawer open while the delayed top toast appears. Defer the card highlight until the drawer is explicitly closed so users can review the updated activity before locating the changed card.
- LCAM Board navigation returns to the board from inner flows and is only active when `activeDestination` is `lcam-board`.
- Sidebar visibility is shared across the board and proposal flow.
- Drawer entrance uses right-to-left motion; the overlay uses the shared 50% black modal token. Reduced-motion users get no drawer animation.
- Draft SI sample values are intentionally prefilled for prototype walkthroughs.
- The prototype currently uses local assets rather than remote runtime dependencies.

## Current Project State

Verified on **2026-08-27**:

- Branch: `main`.
- Latest checked-in commit at inspection time: `b13b369` (`feat: expand LCAM lead lifecycle and update project context`).
- Unit tests: **21 files, 100 tests passing** via `npm test -- --watch=false`.
- Production build: succeeds via `npm run build`.
- Current initial production bundle reported by Angular: approximately 496.93 kB raw / 98.82 kB estimated transfer (`main` 456.59 kB plus global styles 40.34 kB).
- The worktree contains uncommitted changes focused on lead-card metadata and aging indicators, content-fitting field-control menus, referrer-filter empty state, and their related tests. Preserve and inspect the worktree before editing. Do not reset, discard, or overwrite unrelated changes.
- The validated state includes the uncommitted working tree, not only `HEAD`; do not infer that these application changes are committed or ready to push.

## Known Issues and Limitations

- Production build emits component-style budget warnings:
  - `draft-si-flow.component.scss`: about 12.61 kB vs. 8 kB warning budget.
  - `proposal-flow.component.scss`: about 14.38 kB vs. 8 kB warning budget.
  - `lead-activity-drawer.component.scss`: about 8.22 kB vs. 8 kB warning budget.
- No backend, authentication, API calls, persistence, or real customer data. Reloading resets all state.
- No Angular Router; browser history/deep links are not implemented.
- `LeadDetailComponent` exists and is tested but is not reachable from the root application flow.
- Several visible controls remain prototype-only/no-op, including most navigation destinations, New Lead, sidebar Draft SI, global Search, Edit Lead Information, Unable to Set Appointment, Proceed to Application, Convert to Application, and some proposal actions.
- In the contacted LCAM drawer, “Generate Full Proposal” currently has no emitted action; only the new-lead “Generate Draft SI” branch is wired.
- Activity records and appointment/lead mutations are entirely in memory and reset on reload. Initial timelines are synthesized from sample stage/state data rather than loaded from a durable event source.
- The filter UI offers `Re-endorsed`, but `LeadState` and the sample data do not currently represent that state, so the option cannot match a lead.
- Board and form data are hard-coded in component classes/templates. Some proposal and SI summary values are also fixed rather than derived from the selected lead/form state.
- Draft SI results display and download only `si-page-1.png`; `si-page-2.png` exists but is unused.
- Draft SI product selection still enables only Dream Builder. The proposal product picker is separate and permits selection of all seven hard-coded products, but its category tabs do not yet filter that list.
- Proposal-draft and generated-proposal content is local and partial: Benefits/Riders and Convert to Application do not yet implement a complete downstream proposal/application workflow.
- Shared-component adoption is incomplete in bespoke Draft SI/proposal forms; the per-board sort list still uses native radio inputs rather than the shared radio component.
- No lint command, automated accessibility audit, visual regression suite, or browser E2E suite is configured.
- Dark-theme tokens are partial and no UI theme switch is implemented.

## Pending Work / Identifiable TODOs

There are no explicit `TODO`/`FIXME` markers in the inspected source. The following gaps are inferred directly from unhandled controls and current implementation:

- Wire contacted-drawer “Generate Full Proposal” if the intended destination is confirmed.
- Implement the Unable to Set Appointment path and determine its board/timeline effect.
- Wire or intentionally remove global Search, Edit Lead Information, Proceed to Application, Convert to Application, New Lead, sidebar Draft SI, and other remaining presentation-only controls.
- Complete the product-picker category filtering and the intended proposal Info/Benefits/Riders interactions if those are required beyond the current local walkthrough.
- Reconcile the `Re-endorsed` filter option with the `LeadState` model or remove it if that state is not required.
- Decide whether `LeadDetailComponent` should be connected or retired.
- Derive sample summaries from current lead/form state where prototype fidelity requires it.
- Support remaining SI pages/products if the intended flow includes them.
- Reduce or formally adjust the three SCSS style-budget warnings.
- Add E2E/visual/accessibility coverage for critical interactive flows.

These are not confirmed product requirements; verify against the current Figma nodes or an explicit user request before implementing.

## Recommended Next Steps

1. Review the current uncommitted diff before any new implementation; do not assume `HEAD` represents the visible prototype.
2. Validate new requests against the specific Figma frame/component state and the existing TDX token/component layer.
3. Complete one user flow at a time and test board movement, chronological timeline rendering, toast/highlight timing, repeated follow-up actions, and responsive presentation together.
4. Prefer extending shared TDX components over introducing page-local replicas.
5. Run `npm test`, `npm run build`, and a focused browser walkthrough before handoff.
6. Report the existing style-budget warnings separately from functional failures.

## Agent Safety and Handoff Notes

- Do not commit or push unless the user explicitly asks.
- Never discard unrelated changes in this dirty worktree.
- Use `rg` / `rg --files` for repository searches and `apply_patch` for manual edits.
- Keep changes scoped; do not refactor working prototype areas as collateral work.
- When handing off, state exactly which flows were changed, which commands passed, and any remaining Figma/design mismatches or unverified assumptions.
