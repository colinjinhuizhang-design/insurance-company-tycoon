# Changelog

## 2.0.0 - V2 Portfolio Farm

### Added

- V2 Orchard identity in the header.
- Farm tab with original CSS-only product plots.
- Portfolio farm stages: seed, sprout, bloom, harvest and storm.
- Farm dashboard with season, team soil, active policies and projected monthly premium crop.
- Farm weather panel for solvency, risk and mortality-shock pressure.
- Plan Safe Product action that prepares a beginner-friendly Family Protection product in Lab.
- Studio farm preview card.

### Improved

- Launched policies now generate recurring monthly premium income, reducing the unfair feeling that products only create future expenses.
- Smoke test now verifies the Farm tab, Farm scene and Plan Safe Product flow.

### Legal note

- Farming-game repositories were used only for high-level gameplay inspiration.
- No external code, sprites, layouts, formulas, audio or assets were copied.

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
