# Warspy UX Overhaul — "Guided Intelligence"

## Goal
Make Warspy universally accessible (crypto users, general public, OSINT enthusiasts) while keeping the dark intel-dashboard aesthetic softened slightly for approachability.

## Target Audience
All backgrounds — no crypto, military, or geopolitics knowledge assumed.

## Core Principle
Keep the full feature set intact. Layer in discoverability through onboarding, tooltips, and clearer labeling. No features hidden or removed (except CA).

---

## Section 1: Remove CA + Clean Up Header

### Changes
- Remove CA copy button from desktop header and mobile drawer
- Remove `WARSPY_CA` export from `src/config.ts`
- Remove `copyContractAddress` function and `copied` state from OverlayNav
- Remove the "Copied" toast AnimatePresence block
- Keep: `$WARSPY` in logo area as brand, `Join X Community` link, `@ashxmeta` Dev X link

### Files
- `src/config.ts` — remove `WARSPY_CA` export
- `src/components/nav/OverlayNav.tsx` — remove CA button (desktop + mobile), copied toast, copy function

---

## Section 2: Interactive Welcome Tour

### Behavior
- 4-step spotlight tour on first visit only
- `localStorage` flag `warspy:toured` — once dismissed, never shows again
- Skippable at any step via "Skip" button
- Dimmed backdrop with spotlight cutout around target element

### Steps
1. **Welcome to Warspy** — Spotlight: globe area. "Real-time conflict intelligence. Explore the globe to see active hotspots."
2. **Your Intel Panels** — Spotlight: panel toggle buttons (right side of header). "Toggle Live Events, Social Feed, Briefings, and Escalation data."
3. **Quick Navigation** — Spotlight: search/Cmd+K area. "Press Cmd+K anytime to search locations, panels, and intelligence."
4. **Threat Level** — Spotlight: THREATCON meter. "Current threat assessment based on event frequency and severity."

### Implementation
- New component: `src/components/WelcomeTour.tsx`
- Renders as a fixed overlay (z-index above everything)
- Each step stores target element ref via `data-tour="step-N"` attributes on existing elements
- Uses `getBoundingClientRect()` to position spotlight + tooltip
- CSS-only animations (fade, spotlight mask via `clip-path` or box-shadow inset)
- "Next" and "Skip tour" buttons per step
- On complete/skip: `localStorage.setItem("warspy:toured", "1")`

### Files
- `src/components/WelcomeTour.tsx` — new component
- `src/app/page.tsx` — render `<WelcomeTour />` inside GlobePage
- `src/components/nav/OverlayNav.tsx` — add `data-tour` attributes to target elements

---

## Section 3: Jargon-Friendly Tooltips

### Tooltip Component
- New reusable `src/components/Tooltip.tsx`
- CSS-only (no library): wrapper `<span>` with `position: relative`, tooltip `<span>` appears on `:hover`
- Styled to match theme: dark bg, subtle border, small mono text
- Fade-in animation via CSS transition
- Arrow pointing to trigger element

### Terms to Annotate
| Term | Location | Tooltip Text |
|------|----------|-------------|
| THREATCON | OverlayNav meter | Threat Condition — composite score based on event count and severity over the last 7 days |
| Confidence | Event cards (feed, brief) | How reliable the intelligence is — based on source count and corroboration |
| Severity | Event cards (feed, brief) | Impact level of the event — from routine to critical |
| Breakout timeline | Nuclear page | Estimated time to produce enough weapons-grade uranium for a nuclear weapon |
| Classified | Context page | Hover to reveal — key intelligence facts |
| Enrichment | Nuclear page | Process of increasing uranium-235 concentration for reactor fuel or weapons |
| Proxy network | Context/Focus pages | Indirect warfare through allied militias and paramilitary groups |

### Files
- `src/components/Tooltip.tsx` — new component
- Various pages/components — wrap jargon terms with `<Tooltip>`

---

## Section 4: Friendlier Panel Labels

### Changes
Update `PANEL_TOGGLES` array in OverlayNav to include subtitles:

| Panel ID | Icon | Label | Subtitle |
|----------|------|-------|----------|
| live | earth | Live Events | Real-time conflict updates |
| social | speech | Social Feed | News, Reddit, Telegram |
| brief | clipboard | Daily Brief | Top events last 12 hours |
| escalation | chart | Threat Index | 30-day escalation trend |

### Desktop behavior
- Subtitle appears as native `title` tooltip on hover
- Button label text stays compact

### Mobile behavior
- Subtitle appears as secondary text under each panel link in the mobile drawer

### Files
- `src/components/nav/OverlayNav.tsx` — update PANEL_TOGGLES, add subtitle to title attr and mobile drawer

---

## Section 5: Prominent Search / Command Palette

### Changes
Replace the tiny `⌘K` button with a search-bar-styled pill button:
- Pill shape, ~200px wide on desktop
- Placeholder text: "Search intel, locations..."
- `⌘K` shortcut hint right-aligned inside the pill
- On click: dispatches the same KeyboardEvent to open CommandPalette
- Mobile: add a search button in the mobile drawer (opens command palette)

### Files
- `src/components/nav/OverlayNav.tsx` — replace ⌘K button with search pill, add mobile search entry

---

## Section 6: Navigation Grouping

### Changes
Group the 10 nav links with subtle visual separators (thin vertical dividers):

- **Primary**: Globe | Feed | Brief
- **Analysis**: Focus: Israel-Iran | Nuclear | Strike Replay | Actors
- **Reference**: Context | Heatmap | Methodology

### Implementation
- Add `group` property to `NAV_LINKS` array items
- Render a thin `|` divider between groups in the desktop nav
- Mobile drawer: add group headers ("PRIMARY", "ANALYSIS", "REFERENCE")

### Files
- `src/components/nav/OverlayNav.tsx` — add group separators

---

## Non-Goals
- No beginner/expert mode toggle (rejected in approach selection)
- No visual theme changes beyond softening labels
- No new pages or routes
- No changes to data pipeline or API
