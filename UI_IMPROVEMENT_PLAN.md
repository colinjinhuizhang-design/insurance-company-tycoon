# UI Improvement Plan

## 1. Final target layout

- Use a compact game shell with a brand header, universal action bar, tab navigation and tab content.
- Make Studio the home screen and main headquarters view.
- Keep the animated office central on Studio, with a right-side detail/status column on desktop.
- Use clear department tabs: Studio, Staff, Product Lab, Office, Finance, Events, CEO Championship, Awards, Leaderboard, Settings.

## 2. New tab structure

- Studio: animated office, company summary, team status, quick actions, alerts and newspaper.
- Staff: hiring, team roster, training academy and staff details.
- Product Lab: product design sliders, advanced actuarial settings, forecast and pipeline.
- Office: equipment shop, renovation, office capacity and furniture preview.
- Finance: cash flow, policies, claims and risk summary.
- Events: monthly newspaper, recent office events, monthly summaries and alerts.
- CEO Championship: yearly quiz, progress, rewards and streaks.
- Awards: trophies, achievements and milestones.
- Leaderboard: local saved runs.
- Settings: save, load, reset, sound, animations and mobile preferences.

## 3. Universal advance button design

- Add a sticky `.game-control-bar` below the title/setup area.
- Include date, cash, reputation, alert count, Advance 1 Month, Auto 12 Months, Consulting Contract, Save, Load and Settings.
- Remove the duplicate Advance, Auto and Contract row from inside the office card.
- On mobile, keep Advance and Auto visible while secondary actions wrap or move lower in the bar.
- Add keyboard shortcuts: Space or Enter advances, Shift+A auto-advances, S saves when not typing.

## 4. Studio screen redesign

- Replace plain Studio dashboard text with compact stat cards.
- Show cash, month/year, reputation, fans/customers, staff, office level, active product, mood and stamina.
- Keep technical actuarial controls out of Studio.
- Keep the office first, with detail and news panels beside it on desktop and stacked on mobile.

## 5. Equipment/shop redesign

- Add category filter buttons.
- Render compact cards with icon, name, cost, space, office level, effect chips and action state.
- Move long item explanation behind a `details` element.
- Show Installed, Locked or Buy states clearly.

## 6. Web layout redesign

- Use sticky universal controls.
- Use card grids for status-heavy surfaces.
- Reduce repeated form-like text on Studio.
- Keep the office viewport central and avoid burying it under action buttons.

## 7. Mobile layout redesign

- Use a sticky action bar with large tap targets.
- Keep tabs compact and short.
- Ensure equipment cards become single column.
- Treat selected office detail as a bottom sheet on small screens.
- Avoid horizontal page overflow while preserving office pan/zoom.

## 8. Animation improvement plan

- Keep requestAnimationFrame-driven office movement.
- Continue using original CSS avatars and furniture.
- Add or preserve floating feedback for work progress, claims, money, launch and achievement events.
- Respect the user's animation toggle by reducing decorative animation when disabled.

## 9. Testing checklist

- Open `index.html` directly from the browser.
- Confirm Studio is the first active tab.
- Confirm universal action bar controls work and are not duplicated in the office card.
- Confirm Staff, Office, Events, Awards and Settings tabs open.
- Confirm equipment filters change visible cards.
- Confirm renovation comparison renders correctly.
- Confirm Product Lab sliders still update forecast.
- Confirm training quiz still works.
- Confirm save/load preserves current tab and UI settings.
- Confirm no broken imports or syntax errors.
- Capture desktop and mobile screenshots.
