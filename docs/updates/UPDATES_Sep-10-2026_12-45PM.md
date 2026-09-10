# EWApp Prototype Updates

## 2026-09-10

- Blocked inactive leads from continuing from Info to Add Profile (CSA); the existing contact-required event reopens the lead drawer with `Mark as Contacted`.
- Preserved Info save behavior and existing active/contacted lead CSA flows.

### Affected files

- `src/app/proposal-flow/proposal-flow.component.ts`
- `src/app/proposal-flow/proposal-flow.component.spec.ts`
- `AGENTS.md`

### Validation

- Full unit suite: **148/148 passing**.
- Production build completed successfully.
- `git diff --check` passes.

### Deferred

- No lifecycle, API, routing, persistence, or other flow changes were introduced.
