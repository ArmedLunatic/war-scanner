# UX Overhaul — "Guided Intelligence" Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make Warspy universally accessible by removing the CA, adding an interactive welcome tour, jargon tooltips, friendlier panel labels, a prominent search bar, and nav grouping.

**Architecture:** All changes are client-side React components + CSS. No API or data pipeline changes. New components: `WelcomeTour.tsx`, `Tooltip.tsx`. Primary modifications to `OverlayNav.tsx` and `config.ts`. Tour uses `localStorage` for one-time display. Tooltips are CSS-only.

**Tech Stack:** React 18, Next.js App Router, Framer Motion (already installed), CSS variables, localStorage

---

### Task 1: Remove CA from config.ts

**Files:**
- Modify: `src/config.ts`

**Step 1: Remove WARSPY_CA export**

In `src/config.ts`, delete the CA line. Final file:

```typescript
export const WARSPY_TICKER = "$WARSPY";
export const WARSPY_X_COMMUNITY_URL =
  "https://x.com/i/communities/2027763203841921538";
export const WARSPY_DEV_X_HANDLE = "@ashxmeta";
export const WARSPY_DEV_X_URL = "https://x.com/ashxmeta";
```

**Step 2: Verify no other files import WARSPY_CA**

Run: `grep -r "WARSPY_CA" src/`
Expected: Only `OverlayNav.tsx` (which we fix in Task 2)

**Step 3: Commit**

```bash
git add src/config.ts
git commit -m "chore: remove WARSPY_CA from config"
```

---

### Task 2: Remove CA from OverlayNav (desktop + mobile)

**Files:**
- Modify: `src/components/nav/OverlayNav.tsx`

**Step 1: Remove CA-related imports and code**

Remove from imports:
- `WARSPY_CA` from the config import
- The `truncateMiddle` helper function (only used for CA)

Remove from component state/refs:
- `const [copied, setCopied] = useState(false)`
- `const copyTimerRef = useRef<number | null>(null)`
- `const desktopCaLabel = truncateMiddle(...)`
- The `copyContractAddress` async function
- The `useEffect` cleanup for `copyTimerRef`

Remove from desktop header (the `<button className="desktop-only" onClick={copyContractAddress}...>` block, lines ~261-304)

Remove from mobile drawer (the `<button onClick={copyContractAddress}...>` block, lines ~571-610)

Remove the "Copied" toast `<AnimatePresence>` block at the bottom (lines ~685-710)

**Step 2: Verify the app builds**

Run: `npm run build` (or `next build`)
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/nav/OverlayNav.tsx
git commit -m "feat: remove contract address from header and mobile nav"
```

---

### Task 3: Create Tooltip component

**Files:**
- Create: `src/components/Tooltip.tsx`

**Step 1: Create the Tooltip component**

```tsx
"use client";

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

export function Tooltip({ text, children }: TooltipProps) {
  return (
    <span
      style={{ position: "relative", display: "inline-flex", alignItems: "center" }}
      className="warspy-tooltip-wrap"
    >
      {children}
      <span
        className="warspy-tooltip"
        style={{
          position: "absolute",
          bottom: "calc(100% + 8px)",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(10,14,20,0.95)",
          border: "1px solid rgba(96,165,250,0.25)",
          borderRadius: "4px",
          padding: "6px 10px",
          fontFamily: "var(--font-sans)",
          fontSize: "11px",
          fontWeight: 400,
          lineHeight: 1.4,
          letterSpacing: "0.01em",
          color: "#94a3b8",
          whiteSpace: "nowrap",
          maxWidth: "280px",
          pointerEvents: "none",
          opacity: 0,
          transition: "opacity 0.15s ease",
          zIndex: 300,
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
        }}
      >
        {/* Arrow */}
        <span
          style={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "5px solid transparent",
            borderRight: "5px solid transparent",
            borderTop: "5px solid rgba(96,165,250,0.25)",
          }}
        />
        {text}
      </span>
    </span>
  );
}
```

**Step 2: Add tooltip CSS to globals.css**

Append to `src/app/globals.css`:

```css
/* ─── Tooltips ─────────────────────────────────────────────────────────────── */
.warspy-tooltip-wrap:hover .warspy-tooltip {
  opacity: 1 !important;
}
```

**Step 3: Verify it renders**

Import and wrap any text element to test (e.g., THREATCON label). Verify tooltip appears on hover.

**Step 4: Commit**

```bash
git add src/components/Tooltip.tsx src/app/globals.css
git commit -m "feat: add reusable Tooltip component"
```

---

### Task 4: Add tooltips to jargon terms

**Files:**
- Modify: `src/components/nav/OverlayNav.tsx` — wrap THREATCON label
- Modify: `src/components/panels/LiveFeedPanel.tsx` — wrap confidence/severity badges
- Modify: `src/app/nuclear/page.tsx` — wrap "breakout timeline" and "enrichment" terms
- Modify: `src/app/context/page.tsx` — wrap "classified" section header

**Step 1: Wrap THREATCON in OverlayNav**

In `ThreatconMeter`, wrap the "THREATCON" label div with `<Tooltip text="Threat Condition — composite score based on event frequency and severity over 7 days">`. Import `Tooltip` from `@/components/Tooltip`.

**Step 2: Wrap confidence/severity in LiveFeedPanel**

Find where confidence badges (HIGH/MED/LOW) and severity scores are rendered. Wrap the labels:
- Severity number/badge: `<Tooltip text="Impact level — from routine (1) to critical (5)">`
- Confidence badge: `<Tooltip text="Source reliability — based on corroboration across multiple feeds">`

**Step 3: Wrap nuclear page terms**

In `src/app/nuclear/page.tsx`, wrap:
- "Breakout timeline" heading: `<Tooltip text="Estimated time to produce enough weapons-grade uranium for one nuclear weapon">`
- "Enrichment" label: `<Tooltip text="Process of increasing uranium-235 concentration — 3.67% reactor grade, 90%+ weapons grade">`

**Step 4: Commit**

```bash
git add src/components/nav/OverlayNav.tsx src/components/panels/LiveFeedPanel.tsx src/app/nuclear/page.tsx
git commit -m "feat: add jargon tooltips to THREATCON, severity, confidence, nuclear terms"
```

---

### Task 5: Update panel labels with subtitles

**Files:**
- Modify: `src/components/nav/OverlayNav.tsx`

**Step 1: Update PANEL_TOGGLES with subtitle field**

```typescript
interface PanelToggle {
  id: PanelId;
  icon: string;
  label: string;
  subtitle: string;
}

const PANEL_TOGGLES: PanelToggle[] = [
  { id: "live", icon: "📡", label: "Live Events", subtitle: "Real-time conflict updates" },
  { id: "social", icon: "💬", label: "Social Feed", subtitle: "News, Reddit, Telegram" },
  { id: "brief", icon: "📋", label: "Daily Brief", subtitle: "Top events last 12 hours" },
  { id: "escalation", icon: "📈", label: "Threat Index", subtitle: "30-day escalation trend" },
];
```

**Step 2: Update desktop panel toggle buttons**

Change the `title` attribute on each toggle button from `pt.label` to `${pt.label} — ${pt.subtitle}`.

**Step 3: Add subtitles in mobile drawer**

In the mobile nav drawer, after the nav links section, add a "Panels" group with each panel as a button showing both label and subtitle text.

**Step 4: Commit**

```bash
git add src/components/nav/OverlayNav.tsx
git commit -m "feat: add descriptive subtitles to panel toggle buttons"
```

---

### Task 6: Replace ⌘K button with prominent search pill

**Files:**
- Modify: `src/components/nav/OverlayNav.tsx`

**Step 1: Replace the tiny ⌘K button in the desktop header**

Remove the existing `⌘K` button. Replace with a wider search-bar-styled pill:

```tsx
<button
  onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }))}
  title="Search (Ctrl+K)"
  style={{
    background: "rgba(10,14,20,0.6)",
    border: "1px solid rgba(45,63,84,0.7)",
    borderRadius: "999px",
    cursor: "pointer",
    padding: "0 12px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    height: "32px",
    minWidth: isCompactDesktop ? "140px" : "200px",
    transition: "border-color 0.15s",
  }}
  onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(96,165,250,0.4)")}
  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(45,63,84,0.7)")}
>
  <span style={{ fontSize: "12px", color: "#3d4f63" }}>🔍</span>
  <span style={{
    fontFamily: "var(--font-mono)",
    fontSize: "10px",
    color: "#3d4f63",
    letterSpacing: "0.04em",
    flex: 1,
  }}>
    Search intel, locations...
  </span>
  <span style={{
    fontFamily: "var(--font-mono)",
    fontSize: "9px",
    color: "#2d3f54",
    background: "rgba(30,42,56,0.4)",
    borderRadius: "3px",
    padding: "2px 5px",
    letterSpacing: "0.06em",
  }}>
    ⌘K
  </span>
</button>
```

**Step 2: Add search button in mobile drawer**

Add a "Search" button at the top of the mobile drawer that opens the command palette:

```tsx
<button
  onClick={() => {
    setMenuOpen(false);
    setTimeout(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }));
    }, 200);
  }}
  style={{
    height: "44px",
    borderRadius: "999px",
    border: "1px solid rgba(96,165,250,0.2)",
    background: "rgba(96,165,250,0.06)",
    color: "#94a3b8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    letterSpacing: "0.08em",
    width: "100%",
  }}
>
  🔍 Search intel, locations...
</button>
```

**Step 3: Commit**

```bash
git add src/components/nav/OverlayNav.tsx
git commit -m "feat: replace tiny ⌘K button with prominent search pill"
```

---

### Task 7: Add nav grouping with visual separators

**Files:**
- Modify: `src/components/nav/OverlayNav.tsx`

**Step 1: Add group property to NAV_LINKS**

```typescript
const NAV_LINKS = [
  { href: "/", label: "Globe", group: "primary" },
  { href: "/feed", label: "Feed", group: "primary" },
  { href: "/brief", label: "Brief", group: "primary" },
  { href: "/focus", label: "FOCUS: Israel–Iran", accent: true, group: "analysis" },
  { href: "/nuclear", label: "Nuclear", group: "analysis" },
  { href: "/strikes", label: "Strike Replay", group: "analysis" },
  { href: "/actors", label: "Actors", group: "analysis" },
  { href: "/context", label: "Context", group: "reference" },
  { href: "/heatmap", label: "Heatmap", group: "reference" },
  { href: "/methodology", label: "Methodology", group: "reference" },
];
```

**Step 2: Render separators in desktop nav**

In the desktop `<nav>`, instead of flat-mapping all links, render with thin vertical dividers between groups:

```tsx
{NAV_LINKS.map((link, i) => {
  const prevGroup = i > 0 ? NAV_LINKS[i - 1].group : link.group;
  const showDivider = i > 0 && link.group !== prevGroup;
  return (
    <React.Fragment key={link.href}>
      {showDivider && (
        <span style={{
          width: "1px",
          height: "14px",
          background: "rgba(45,63,84,0.5)",
          flexShrink: 0,
        }} />
      )}
      <Link href={link.href} style={...}>
        {link.label}
      </Link>
    </React.Fragment>
  );
})}
```

**Step 3: Add group headers in mobile drawer**

In the mobile nav drawer, render group labels ("PRIMARY", "ANALYSIS", "REFERENCE") as small uppercase headers above each group of links.

**Step 4: Commit**

```bash
git add src/components/nav/OverlayNav.tsx
git commit -m "feat: group nav links with visual separators"
```

---

### Task 8: Create WelcomeTour component

**Files:**
- Create: `src/components/WelcomeTour.tsx`

**Step 1: Create the tour component**

The component:
- Checks `localStorage.getItem("warspy:toured")` — if `"1"`, renders nothing
- Renders a fixed overlay (z-index 9000, above everything including scanlines)
- 4 steps, each targeting an element with `data-tour="step-N"` attribute
- Uses `getBoundingClientRect()` to position spotlight + tooltip
- Dimmed backdrop with a "cutout" around the target (using `box-shadow: 0 0 0 9999px rgba(0,0,0,0.7)`)
- Tooltip positioned relative to target element
- "Next" (blue accent) and "Skip tour" (muted text) buttons
- On final step, "Next" becomes "Get Started"
- On complete/skip: `localStorage.setItem("warspy:toured", "1")`

Tour steps data:

```typescript
const TOUR_STEPS = [
  {
    target: "step-globe",
    title: "Welcome to Warspy",
    description: "Real-time conflict intelligence. Explore the globe to see active hotspots around the world.",
    position: "center" as const,
  },
  {
    target: "step-panels",
    title: "Your Intel Panels",
    description: "Toggle Live Events, Social Feed, Briefings, and Escalation data from these buttons.",
    position: "below" as const,
  },
  {
    target: "step-search",
    title: "Quick Navigation",
    description: "Search locations, panels, and intelligence — or press Cmd+K anytime.",
    position: "below" as const,
  },
  {
    target: "step-threatcon",
    title: "Threat Level",
    description: "Current threat assessment based on event frequency and severity over the past week.",
    position: "below" as const,
  },
];
```

**Step 2: Style the tour**

- Backdrop: fixed, inset 0, `background: rgba(0,0,0,0.7)`, z-index 9000
- Spotlight: positioned div with `border-radius: 8px`, `box-shadow: 0 0 0 9999px rgba(0,0,0,0.75)`, pointer-events none
- Tooltip card: dark bg (`rgba(10,14,20,0.98)`), blue border, 280px max-width
- Step counter: "1 of 4" in muted text
- Animate with framer motion `AnimatePresence` for step transitions

**Step 3: Commit**

```bash
git add src/components/WelcomeTour.tsx
git commit -m "feat: create interactive welcome tour component"
```

---

### Task 9: Wire up tour with data-tour attributes

**Files:**
- Modify: `src/components/nav/OverlayNav.tsx` — add `data-tour` attributes
- Modify: `src/app/page.tsx` — render `<WelcomeTour />`

**Step 1: Add data-tour attributes to OverlayNav**

- On the panel toggles container div: `data-tour="step-panels"`
- On the search pill button: `data-tour="step-search"`
- On the THREATCON meter wrapper div: `data-tour="step-threatcon"`

**Step 2: Add data-tour to globe**

In `src/app/page.tsx`, on the globe wrapper div: `data-tour="step-globe"`

**Step 3: Render WelcomeTour in GlobePage**

```tsx
import { WelcomeTour } from "@/components/WelcomeTour";

// Inside GlobePage return, after all existing JSX:
<WelcomeTour />
```

**Step 4: Test the full tour flow**

1. Clear localStorage: `localStorage.removeItem("warspy:toured")`
2. Reload the page
3. Tour should appear with step 1 highlighting the globe
4. Click "Next" through all 4 steps
5. Click "Get Started" — tour dismisses
6. Reload — tour should NOT appear again

**Step 5: Commit**

```bash
git add src/components/nav/OverlayNav.tsx src/app/page.tsx
git commit -m "feat: wire welcome tour to globe page with data-tour targets"
```

---

### Task 10: Final verification and cleanup

**Files:**
- All modified files

**Step 1: Full build check**

Run: `npm run build`
Expected: No errors, no warnings

**Step 2: Visual review checklist**

- [ ] CA button gone from desktop header
- [ ] CA button gone from mobile drawer
- [ ] "Copied" toast code removed
- [ ] Search pill visible in desktop header
- [ ] Search button in mobile drawer
- [ ] Nav links grouped with dividers (desktop) and headers (mobile)
- [ ] Panel toggle titles show subtitles on hover
- [ ] THREATCON tooltip appears on hover
- [ ] Tour plays on first visit, doesn't replay after dismissal
- [ ] All 4 tour steps highlight correct elements

**Step 3: Final commit**

```bash
git add -A
git commit -m "chore: UX overhaul cleanup and verification"
```
