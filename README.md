# EWApp Interactive Prototype

A living Angular prototype of EWApp used by the UI/UX Team to validate designs, interactions, and enhancements before development handoff.

## Structure

- `src/app/components/lead-board` — responsive pipeline column
- `src/app/components/lead-card` — accessible lead interaction with default, hover, pressed, and focus states
- `src/app/components/icon-button` — tooltip-enabled icon action
- `src/app/components/status-tag` — TDX semantic status treatment
- `src/app/dashboard` — page composition and sample filtering behavior
- `src/styles.scss` — primitive, semantic, and component token layers

## Run

From this folder:

```bash
npm install
npm start
```

The board columns flex between 227 px and 454 px. Below the width needed to display every column, the board viewport scrolls horizontally rather than collapsing the workflow into an unrelated layout.
