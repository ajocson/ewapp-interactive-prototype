# EWApp Prototype Update

**Date:** August 31, 2026

## New Lead

- Step 1 Continue is disabled until both First Name and Last Name contain text.
- Step 2 Source of Lead defaults to `Self-Generated Lead`.
- Self-Generated Lead shows static Product Interested and Manual Source values with chevrons but no menus.
- Other sources show Product Interested (`Dream Builder`), Referral Date (today), Referrer ID (`54321`), Referrer Name (`Juan Dela Cruz`), Store Name (`198 G. ARANETA AVENUE`), and Store ID (`384768653`).
- Product Interested is static; Store Name uses the existing TDX dropdown. Referrer Name and Store ID use the shared disabled-field appearance.
- Existing confirmation, duplicate-lead, and board-add flows are unchanged.
- Successful lead creation now shows the toast `Lead successfully created` for four seconds using the existing toast component.

## Validation

- Focused app-component test run: **1 file, 17 tests passing**.
- `git diff --check` passes.

## Files Updated

- `src/app/app.component.ts`
- `src/styles.scss`
