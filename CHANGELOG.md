# Changelog

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
