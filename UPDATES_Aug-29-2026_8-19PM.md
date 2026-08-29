# EWApp Prototype Update

**Date:** August 29, 2026, 8:19 PM

## Login and Session Flow

- Added the Figma-matched EWApp login screen with responsive layout, brand assets, background shapes, support contacts, and footer content.
- Login accepts the prototype credentials `Banca/Banca` and `Agency/Agency`.
- Added working show/hide password behavior.
- Login state persists across reloads in the current browser session. The selected user type also persists so the profile menu displays `Banca User` or `Agency User`.

## TDX Button Alignment

- Added the Figma TDX Secondary Large button contract to the shared Angular button component.
- Secondary Large uses the pink filled treatment, 52px height, 20px horizontal padding, 12px vertical padding, 18px Lato Bold text, and 24px icons.

## Lead Information

- Overview lead information now changes by user type.
- Agency shows Store/Branch Name, Store/Branch ID, and Unit Name (`PURPLE BLAZE_JDELACRUZ`); Agency source displays as `Self-Generated Lead`.
- Banca shows Referrer Name, Referrer ID, Referral Date, conditional Manual Source, and Store/Branch details.
- EWB Client Financial Segmentation is shown only for Banca.
- Lead information values use regular font weight.

## Validation

- App component tests: 17 passing.
- App and global-header tests: 19 passing.
- App and lead-activity-drawer tests: 24 passing.
- Button and app tests: 19 passing.

## Detailed Commit Message

```text
feat(ewapp): implement login session and agency-banca lead information

Implement the Figma-aligned EWApp login screen with editable prototype
credentials, password visibility control, session-persisted authentication,
and role-aware profile naming for Agency and Banca users.

Align the shared TDX secondary large button with the Figma design-system
component and update the lead activity overview to show the correct
Agency/Banca-specific fields, including the Agency unit name and source,
Banca referral metadata, and Banca-only EWB segmentation.
```
