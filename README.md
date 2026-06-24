# Insurance Company Tycoon

An original browser-based insurance company management simulation. You run a small insurance studio, hire and train staff, design products, manage claims and solvency, renovate the office, earn awards, and compete in the CEO Insurance Knowledge Championship.

The project is static HTML, CSS and JavaScript. It is runnable from `index.html`, uses `localStorage`, and is designed for GitHub Pages.

The animated office uses a local Phaser 3 renderer. Dense menus, tabs, product controls and save/load UI remain HTML so the game stays easy to maintain.

The Office screen uses compact visual item cards and a shared item detail panel for equipment, furniture effects, assigned staff and buy actions.

Published URL: https://colinjinhuizhang-design.github.io/insurance-company-tycoon/

## Run Locally

Option 1:

Open `index.html` directly in a modern browser.

Option 2:

Run a local static server from this folder:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## How To Play

1. Start in Studio and review the recommended next action.
2. Hire staff in Staff.
3. Open Lab and choose a preset if you want a safer product design.
4. Check the launch readiness meter before starting development.
5. Start an insurance product in Lab.
6. Buy equipment or renovate in Office when capacity is tight; click an item card or office object to inspect its effects.
7. Advance months from the global control bar.
8. Watch cash, claims, reputation, risk and solvency.
9. Train staff, enter the Championship, and collect awards.

## Project Structure

```text
index.html              Main static page
style.css               Main UI, layout, office, avatar and animation styles
src/main.js             Core game state, simulation, rendering and event wiring
src/data/               Office, furniture and staff visual data
src/systems/            Office layout, animation, avatar, furniture and responsiveness helpers
src/systems/PhaserOfficeEngine.js
                        Phaser canvas adapter for the animated Studio office
vendor/phaser.min.js    Local MIT-licensed Phaser 3 browser engine
assets/ASSET_CREDITS.md Asset and legal notes
outputs/release-smoke.mjs Local release smoke test utility
```

## Save Data

The game saves to browser `localStorage` under `insuranceKaihatsuSave`.

Current save format:

```js
saveVersion: 1
```

The save normalizer fills missing fields for older saves, restores obsolete tabs to Studio, and preserves progress where possible.

## Legal Asset Note

This project does not use copied commercial game assets, ripped sprites, music, maps, source code, formulas, characters, or UI layouts. Current visuals are original placeholder assets created with HTML, CSS, JavaScript and Phaser Graphics for this project. Phaser 3.90.0 is included locally under the MIT License. See `assets/ASSET_CREDITS.md`.

## GitHub Pages Deployment

1. Push the project to GitHub.
2. Open repository Settings.
3. Open Pages.
4. Choose Deploy from branch.
5. Select the publishing branch.
6. Select `/root` because `index.html` is at the root.
7. Save.
8. Open and verify the published URL.
9. Add the verified published URL to this README.

## Update Workflow

Use `UPDATE_GUIDE.md` before adding new staff, equipment, quiz questions, product types, achievements or save fields. Update `CHANGELOG.md` for every release and add save migration defaults to `normalizeState` when the save shape changes.

## Known Limitations

- The art is original CSS placeholder art, not a commissioned sprite set.
- Browser smoke tests cover core flows, but long-run balance still benefits from extended manual playtesting.
- GitHub Pages publishing requires a configured remote repository and authentication.
