# Update Guide

## Project Structure

- `index.html`: static page, tab panels and modal containers.
- `style.css`: global layout, responsive UI, office tiles, staff avatars, animation effects and mobile rules.
- `src/main.js`: game state, balance constants, simulation, rendering, save/load and event handlers.
- `src/data/`: furniture, office layout and staff visual data.
- `src/systems/`: modular helpers for office layout, pathfinding, avatar rendering, mood, furniture and responsive office behavior.
- `src/systems/PhaserOfficeEngine.js`: Phaser canvas renderer for the animated Studio office. It should read simulation state and emit clicks back to `src/main.js`; keep gameplay rules outside the Phaser scene.
- `vendor/phaser.min.js`: local Phaser 3.90.0 engine file used by `index.html`.
- `assets/ASSET_CREDITS.md`: legal asset record.

## Save Version

Current save version:

```js
saveVersion: 1
```

When save data changes:

1. Increment `SAVE_VERSION`.
2. Add defaults in `freshState` and `freshStateSkeleton`.
3. Normalize missing or obsolete fields in `normalizeState`.
4. Preserve old player progress where possible.
5. Document the change in `CHANGELOG.md`.

## Add Staff Candidates Or Roles

Most role balance lives in `ROLE_DEFS` in `src/main.js`. Candidate rounds are generated from those definitions.

Example candidate or role shape:

```js
{
  name: "Maya Chen",
  role: "Pricing Analyst",
  salary: 3200,
  hiringCost: 6000,
  skills: {
    pricing: 60,
    risk: 35,
    marketing: 20,
    service: 25,
    speed: 45,
    creativity: 40,
    compliance: 25,
    analytics: 35
  },
  moodTrait: "Careful",
  staminaTrait: "Average"
}
```

If adding a new role, also update role visuals in `src/data/roleVisuals.js` and any role-specific office behavior that depends on role names.

## Add Equipment

Equipment is defined in `EQUIPMENT` in `src/main.js` and visual placement support lives in `src/data/furniture.js` and `src/data/officeLayouts.js`.

Example:

```js
{
  id: "risk_terminal",
  name: "Risk Terminal",
  category: "Work Equipment",
  cost: 28000,
  space: 1,
  minLevel: 2,
  effect: "Improves risk review speed.",
  effects: {
    workSpeed: 0.04,
    claimShock: 0.06
  }
}
```

Add matching furniture data if it should appear in the office map.

## Add Office Levels

Office levels live in `OFFICE_LEVELS` in `src/main.js`. Visual layout support lives in `src/data/officeLayouts.js`.

Keep upgrade costs high enough that renovation feels rewarding but not mandatory every few clicks.

## Add Quiz Questions

Training questions live in `TRAINING_QUESTIONS`. CEO Championship questions live in `CEO_QUESTIONS`.

Example:

```js
{
  course: "pricing",
  q: "What does a higher profit loading usually do?",
  opts: ["Raises price", "Deletes claims", "Adds staff", "Removes regulation"],
  a: 0,
  e: "Profit loading adds margin above expected costs, usually increasing the customer price."
}
```

Keep explanations short and plain.

## Add Product Types

Product names live in `PRODUCT_NAMES`, with pricing and demand support in `PRODUCT_SPECS`, `CHANNEL_FIT` and `SEGMENT_FIT`.

Example:

```js
{
  id: "family_shield",
  name: "Family Shield Cover",
  baseAppeal: 8,
  baseRisk: 5,
  designDifficulty: 4,
  claimVolatility: 6
}
```

When adding a product, update all product lookup tables so forecasts, launch reports and demand calculations stay defined.

## Add Achievements Or Events

Achievements live in `ACHIEVEMENTS`. Monthly event logic lives in `monthlyRandomEvent`.

Keep event text original and avoid references to commercial games or copied mechanics.

## Testing Before Publishing

Run:

```bash
node --check src/main.js
node outputs/release-smoke.mjs
```

The smoke test opens local headless Edge, checks desktop and mobile layout, core interactions, save/load/reset, old-save normalization, product start and launch, training, equipment, renovation, Championship and console errors.

The smoke test also checks that Phaser loads and that the Studio office canvas mounts. If that check fails, the DOM office remains a fallback, but the engine-backed office should be fixed before publishing a Phaser update.

## Avoid Breaking Saves

- Never rename saved fields without migration logic.
- Add default values in `normalizeState`.
- Convert obsolete tabs or IDs to valid current values.
- Reject clearly corrupted data with a user-facing message rather than crashing.
