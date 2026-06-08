# Review Cycle 3

Review date: 2026-06-08

## Scope reviewed

- Save/load compatibility
- Old-save normalization
- Game balance touchpoints
- Code organization and maintainability
- Documentation readiness
- GitHub Pages compatibility
- Asset/legal readiness

## Problems found

- The save format needed an explicit version field.
- Future update instructions were missing.
- Release checklist and changelog files were missing.
- Generated browser-test artifacts needed to be ignored before committing.

## Changes implemented

- Added `SAVE_VERSION` and `saveVersion: 1`.
- Added `saveDirty` and `lastSavedAt`.
- Added old-save normalization for obsolete current tabs.
- Added `.gitignore` for browser profiles, caches and screenshots while keeping the release smoke test utility.
- Updated README, CHANGELOG, UPDATE_GUIDE, GITHUB_PUBLISH_CHECKLIST and ASSET_CREDITS.
- Added the three review-cycle files and final release review.

## Tests run

- `node --check src/main.js`
- `node outputs/release-smoke.mjs`
- Old-save normalization test with a minimal legacy save containing `currentTab: "board"`
- Core-flow browser test covering hiring, capacity block, training, renovation, equipment, product launch, achievements and Championship

## Issues fixed after testing

- Documented the in-app browser connector failure and headless Edge fallback.
- Confirmed mobile viewport has no unexpected horizontal overflow.

## Remaining limitations

- Balance is verified through smoke tests and short flow tests, not a full 30-year playthrough.
- GitHub publishing depends on repository remote/authentication availability.

## Next recommended improvements

- Add repeatable multi-year balance simulation tests.
- Split more constants from `src/main.js` into data modules over time, preserving save compatibility.
