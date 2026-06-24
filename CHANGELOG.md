# Changelog

## 1.2.2 - Flatter Command Board Layout

### Improved

- Replaced the nested scrolling side-panel feel with flatter Studio command-board cards.
- Combined current project, newspaper and CEO tip into one compact Live Brief card.
- Combined trophies and achievements into one compact Awards Board card.
- Compact game header, setup and global controls so tabs and Studio content appear sooner.
- Medium-width desktop status chips now stay in one row instead of wrapping into a bulky block.

### Fixed

- Removed the sticky inner-scroll treatment from Studio and Office panels.

## 1.2.1 - Compact Item UI Polish

### Added

- Shared item detail panel for equipment cards and clickable office furniture.
- Larger original CSS item preview in equipment and furniture detail cards.
- Phaser selection highlight for clicked office furniture and selected shop items.
- Smoke-test checks for item details, selected equipment cards, 390 px mobile layout and 430 px mobile layout.

### Improved

- Office tab now uses a compact control/shop/detail workbench instead of a long vertical shop page.
- Equipment cards now show clearer Ready, Locked and Installed states.
- Equipment capacity now uses compact stat chips instead of a plain text block.
- Studio layout stays compact on tablet-width desktop windows and collapses intentionally on phones.
- Mobile setup and status controls are more compact while keeping primary buttons at least 44 px tall.

### Fixed

- Decorative office objects clicked in the Studio now show their own item detail instead of falling back to a generic shop item.
- Office furniture selection is visible in both the Phaser canvas and fallback DOM office.

### Known limitations

- Item previews are still procedural placeholder art rather than a commissioned sprite pack.

## 1.2.0 - Phaser Office Engine Upgrade

### Added

- Local Phaser 3.90.0 browser engine file for the animated Studio office.
- `PhaserOfficeEngine` adapter that renders the office layout, furniture, staff avatars, mood/stamina bars, speech bubbles, floating feedback and confetti on canvas.
- Smoke-test checks for Phaser loading and engine canvas mounting.
- Procedural item silhouettes for equipment cards and Phaser office furniture.

### Improved

- The Studio office now uses a real 2D game rendering layer while keeping the management UI in HTML.
- Office click interactions still open the existing staff and furniture detail panels.
- Equipment cards now use small visual item icons instead of text abbreviations.
- Office furniture now draws recognizable desks, computers, coffee, kitchen, bathroom, bookshelf, server, plant and trophy objects instead of central letter glyphs.
- Asset credits now document the Phaser MIT-licensed engine dependency separately from original visual assets.

### Known limitations

- The Phaser office uses original procedural placeholder art rather than a commissioned sprite set.
- Gameplay rules still live in `src/main.js`; future updates should continue moving data and rules out gradually.

## 1.1.0 - Studio UI Polish

### Added

- Beginner starter-goal checklist on Studio.
- Product Lab preset buttons: Safe Starter, Growth Push and Premium Trust.
- Launch readiness meter with plain-language advice.
- Smoke-test coverage for product presets and launch readiness.

### Improved

- Reverted the V2 farm concept and returned to the previous insurance-studio version.
- Improved Product Lab hierarchy so players can see whether a product is launchable before starting development.
- Active policies now generate recurring monthly premium income, making product survival fairer after launch.
- Fixed the recommended-action label color token.

### Known limitations

- The game still uses original CSS placeholder art.
- Long-term balance still needs extended playtesting beyond smoke tests.

## 1.0.0 - Initial GitHub Pages Release Candidate

### Added

- Studio-first layout with headquarters summary and animated office.
- Compact tab structure: Studio, Staff, Lab, Office, Finance, Events, Championship, Awards and Settings.
- Global control bar with month, cash, reputation, solvency, risk and save status.
- Recommended next action panel that responds to current game state.
- Save version field with safer old-save normalization.
- Dismissible monthly summary card.
- Claim-spike floating warning feedback.
- Release smoke test utility at `outputs/release-smoke.mjs`.
- Release documentation, update guide, publish checklist and asset credits.

### Improved

- Shortened navigation labels and moved the local leaderboard into Awards.
- Clarified Studio as the home screen.
- Reduced animation cadence when animations are disabled.
- Improved mobile validation with a 390 x 844 browser viewport.
- Improved save/load/reset verification.

### Fixed

- Obsolete `board` tab saves now normalize safely back to Studio.
- Global status no longer references a removed alert counter.
- Product assumptions edits mark the visible save status as unsaved.

### Known limitations

- Visual assets are original placeholder CSS/HTML art.
- Full long-term economic balance needs additional multi-year playtesting.
- GitHub publishing still requires a configured remote and authentication.
