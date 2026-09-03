# EWApp Prototype Updates

## 2026-09-03

- Updated per-board LCAM search to match the displayed Lead ID (`lead.leadId`) as well as the lead name.
- Per-board search now applies only after pressing Enter; typing alone does not change the visible cards.
- Closing a per-board search still clears the pending input and applied search immediately.
- Follow-Up `Load More` is hidden while an applied board search is active, preventing the control from appearing when a searched lead is found in a later sample batch.
- Repositioned the auto-dropped John Mark Doe Follow-Up demo lead (Lead ID `50824`) into the first 10 sample leads, as the fourth sample entry, without changing lifecycle behavior.

### Verification

- Lead Board tests pass: **11 tests passing**.
- Dashboard tests pass: **25 tests passing**.
- `git diff --check` passes.

