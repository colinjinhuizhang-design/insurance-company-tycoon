# Review Cycle 1

Review date: 2026-06-08

## Scope reviewed

- First screen and Studio/home flow
- Main navigation and tab count
- Global action bar
- Studio summary, quick actions and next-step clarity
- Staff, Lab, Office, Finance, Events, Championship, Awards and Settings placement
- Desktop and mobile layout
- Save/load/reset and keyboard shortcuts

## Problems found

- The older navigation still exposed too many tabs, including a separate leaderboard tab that did not need top-level space.
- The global status bar did not show enough release-critical information such as solvency, risk and save state.
- The Studio screen needed clearer first-time guidance and a current recommended action.
- Product edit changes were not reflected in visible save status.
- Obsolete saved tabs such as `board` needed safe normalization.

## Changes implemented

- Kept Studio as the first active screen.
- Shortened tabs to Studio, Staff, Lab, Office, Finance, Events, Championship, Awards and Settings.
- Moved the local leaderboard into Awards.
- Added global Solvency, Risk and Save status values.
- Added a first-goals Studio panel.
- Added a Recommended next action panel.
- Added save dirty state for product, player and company edits.
- Normalized obsolete `board` saves back to Studio.

## Tests run

- `node --check src/main.js`
- `node outputs/release-smoke.mjs`
- Desktop browser smoke test from `index.html`
- Mobile browser smoke test at 390 x 844
- Tab switching across all current tabs
- Save, load, reset and keyboard save

## Issues fixed after testing

- Replaced stale `globalAlerts` rendering with solvency/risk/save rendering.
- Removed stale `board` tab support from current-tab normalization.
- Updated one initial ticker label from Product Lab to Lab.

## Remaining limitations

- Studio still uses CSS placeholder art rather than a bespoke commissioned sprite set.
- The first-time guidance is intentionally compact and does not yet include a multi-step tutorial overlay.

## Next recommended improvements

- Add a richer guided first-run checklist.
- Add more state-specific recommended actions after longer playtesting.
