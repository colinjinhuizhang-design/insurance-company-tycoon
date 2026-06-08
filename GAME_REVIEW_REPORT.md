# Game Review Report

## 1. Current UI problems

- The game has a strong office scene, but the surrounding UI still feels like a prototype dashboard in places.
- Save, Load, Reset, Advance, Auto and Contract controls are split between the header and the Studio office card, so the main game verbs do not feel universal.
- Studio dashboard content is shown as plain preformatted text instead of compact game status cards.
- Equipment cards show long explanatory text on every card, making the shop hard to scan.
- Renovation is text-only and does not compare the current and next office clearly.
- Several panels use similar visual weight, so important next actions do not stand out.

## 2. Current layout problems

- Staff hiring, training, renovation and equipment are combined in one Staff & Office tab. This makes the tab too broad.
- Launch reports and awards share the Launches tab, but achievements and trophies are not separated into an Awards destination.
- Events are mostly embedded in Studio and cash flow; there is no dedicated place to review news and monthly happenings.
- Settings actions live in the main header, but there is no Settings tab for save/load/reset and display preferences.

## 3. Current mobile problems

- The mobile layout stacks correctly, but global actions are not optimized as a sticky mobile control surface.
- Many buttons become full width at tablet widths, which can make compact action rows bulky.
- The tab strip becomes a two-column grid but still includes longer tab names such as Staff & Office.
- Equipment and renovation screens can become long vertical pages.
- Office details are sticky on mobile, but there is not yet a dedicated bottom-sheet class shared by staff/furniture details.

## 4. Current game-flow problems

- The Studio is already first, but the player still has to look inside the office card for the Advance button.
- Quick actions on Studio point multiple actions to the same old Staff & Office tab, which weakens the feeling of organized departments.
- The Product Lab correctly owns advanced assumptions, but the global status and active alerts are not shown in the main game controls.
- The monthly summary exists mostly as text/toast feedback, not as a compact recurring game event panel.

## 5. Current animation problems

- Staff animation is much better than the original prototype, with full-body avatars, movement, talking and floating progress.
- The office still needs stronger global feedback for monthly summary, launch, claim and trophy events.
- Some work feedback can overlap in crowded office levels.
- Reduced-motion preferences are not explicitly handled for all decorative animations.

## 6. Current equipment/shop problems

- Equipment cards are too text-heavy and all categories are shown at once.
- There are no category filters.
- Effects are not represented as short chips, so the player has to read full sentences.
- Installed counts and locking reasons are not obvious on the card itself.

## 7. Current tab/navigation problems

- Current tabs: Studio, Product Lab, Staff & Office, Launches, Finance, Championship, Leaderboard.
- Missing requested tabs: Staff, Office, Events, Awards, Settings.
- Staff & Office overloads hiring, training, equipment and renovation.
- Championship should be renamed CEO Championship for clarity.

## 8. Suggested priority fixes

1. Move Advance, Auto, Contract, Save, Load and Settings into a sticky universal action bar.
2. Split Staff & Office into separate Staff and Office tabs.
3. Add Events, Awards and Settings tabs.
4. Replace plain Studio dashboard text with compact status cards and alert chips.
5. Redesign equipment cards with filters, icons and effect chips.
6. Redesign renovation as a current-vs-next comparison.
7. Add keyboard shortcuts for Advance, Auto and Save.
8. Persist current tab and UI settings in localStorage.

## 9. Files that need to be changed

- `index.html`
- `style.css`
- `src/main.js`
- `assets/ASSET_CREDITS.md` if new external assets are added
- `GAME_REVIEW_REPORT.md`
- `UI_IMPROVEMENT_PLAN.md`
- `POST_IMPROVEMENT_REVIEW.md`

## 10. Risk areas where changes might break existing systems

- Renaming or splitting tabs can break quick-action navigation if old `data-tab` names are not mapped carefully.
- Moving buttons can break event listeners if element IDs are removed or duplicated.
- Saving current tab and settings can break old saves if normalization does not provide defaults.
- Equipment filtering can hide buy buttons if the selected category is invalid after loading.
- Sticky bars and mobile CSS can create overflow if the office viewport width is not constrained.
