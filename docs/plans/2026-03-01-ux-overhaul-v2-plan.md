# UX Overhaul v2 — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Elevate Warspy with unified panel architecture (fixing double-mount), skeleton loading states, active route highlighting, page transitions, SVG icon system, mobile THREATCON/status, mobile /strikes optimization, and animated marker chip.

**Architecture:** All changes are in the Next.js App Router frontend layer. No API or database changes. The panel refactor unifies two render trees into one, relying on PanelShell's existing `useIsMobile()` hook. New components are small, single-purpose, and slot into the existing inline-style + CSS variable system.

**Tech Stack:** Next.js 15 App Router, React 19, framer-motion, CSS custom properties, inline styles

---

### Task 1: Create SVG Icon Components

**Files:**
- Create: `src/components/icons/index.tsx`

**Step 1: Create the icon components file**

Create `src/components/icons/index.tsx` with 6 monoline SVG icon components. All icons use `currentColor` for stroke, accept `size` prop (default 14), and render as inline SVG. No `"use client"` needed — these are pure render functions.

```tsx
interface IconProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function IconRadar({ size = 14, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 12l4.5-4.5" />
      <path d="M12 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
      <path d="M16.24 7.76a6 6 0 0 1 0 8.49" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}

export function IconChat({ size = 14, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export function IconBrief({ size = 14, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

export function IconTrend({ size = 14, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

export function IconSearch({ size = 14, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function IconClose({ size = 14, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
```

**Step 2: Verify file compiles**

Run: `npx tsc --noEmit src/components/icons/index.tsx 2>&1 | head -20`
Expected: no errors (or only unrelated pre-existing warnings)

**Step 3: Commit**

```bash
git add src/components/icons/index.tsx
git commit -m "feat: add SVG icon components (radar, chat, brief, trend, search, close)"
```

---

### Task 2: Create PanelSkeleton Component

**Files:**
- Create: `src/components/panels/PanelSkeleton.tsx`

**Step 1: Create the skeleton component**

```tsx
"use client";

interface Props {
  rows?: number;
}

export function PanelSkeleton({ rows = 4 }: Props) {
  return (
    <div style={{ padding: "4px 0" }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            padding: "10px 14px",
            borderBottom: "1px solid rgba(30,42,56,0.4)",
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
        >
          {/* Severity bar placeholder */}
          <div
            className="skeleton-pulse"
            style={{
              width: "3px",
              height: "28px",
              borderRadius: "2px",
              background: "rgba(30,42,56,0.6)",
              flexShrink: 0,
            }}
          />
          {/* Content placeholders */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
            <div
              className="skeleton-pulse"
              style={{
                height: "8px",
                borderRadius: "2px",
                background: "rgba(30,42,56,0.5)",
                width: `${60 + (i % 3) * 12}%`,
              }}
            />
            <div
              className="skeleton-pulse"
              style={{
                height: "6px",
                borderRadius: "2px",
                background: "rgba(30,42,56,0.3)",
                width: `${35 + (i % 2) * 15}%`,
              }}
            />
          </div>
          {/* Tag placeholder */}
          <div
            className="skeleton-pulse"
            style={{
              width: "30px",
              height: "8px",
              borderRadius: "2px",
              background: "rgba(30,42,56,0.4)",
              flexShrink: 0,
            }}
          />
        </div>
      ))}
    </div>
  );
}
```

**Step 2: Add skeleton-pulse keyframe to globals.css**

Add at the end of `src/app/globals.css` (before the tooltip section):

```css
/* ─── Skeleton Loading ────────────────────────────────────────────────────── */
@keyframes skeleton-pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

.skeleton-pulse {
  animation: skeleton-pulse 1.2s ease-in-out infinite;
}
```

**Step 3: Commit**

```bash
git add src/components/panels/PanelSkeleton.tsx src/app/globals.css
git commit -m "feat: add PanelSkeleton component with pulse animation"
```

---

### Task 3: Wire Skeleton Loading into All Panels

**Files:**
- Modify: `src/components/panels/LiveFeedPanel.tsx:146-158` (replace LOADING... div)
- Modify: `src/components/panels/SocialFeedPanel.tsx:58-70` (replace LOADING... div)
- Modify: `src/components/panels/BriefPanel.tsx:68-80` (replace LOADING... div)
- Modify: `src/components/panels/EscalationPanel.tsx:61-73` (replace LOADING... div)

**Step 1: Replace loading states in all 4 panels**

In each panel, replace the `loading ? (` branch's `<div>LOADING...</div>` with:

```tsx
import { PanelSkeleton } from "./PanelSkeleton";
```

Then replace the loading div with `<PanelSkeleton />` (or `<PanelSkeleton rows={3} />` for EscalationPanel since it's a different layout).

For **LiveFeedPanel.tsx**, replace lines 146-158:
```tsx
{loading ? (
  <PanelSkeleton />
) : error ? (
```

For **SocialFeedPanel.tsx**, replace lines 58-70:
```tsx
{loading ? (
  <PanelSkeleton />
) : error ? (
```

For **BriefPanel.tsx**, replace lines 68-80:
```tsx
{loading ? (
  <PanelSkeleton />
) : error ? (
```

For **EscalationPanel.tsx**, replace lines 61-73:
```tsx
{loading ? (
  <PanelSkeleton rows={3} />
) : (
```

**Step 2: Verify the app builds**

Run: `npx next build 2>&1 | tail -20`
Expected: build succeeds

**Step 3: Commit**

```bash
git add src/components/panels/LiveFeedPanel.tsx src/components/panels/SocialFeedPanel.tsx src/components/panels/BriefPanel.tsx src/components/panels/EscalationPanel.tsx
git commit -m "feat: replace LOADING text with skeleton placeholders in all panels"
```

---

### Task 4: Wire SVG Icons into OverlayNav and PanelShell

**Files:**
- Modify: `src/components/nav/OverlayNav.tsx:1-10` (add import)
- Modify: `src/components/nav/OverlayNav.tsx:144-149` (replace emoji in PANEL_TOGGLES)
- Modify: `src/components/nav/OverlayNav.tsx:368` (replace `<span>{pt.icon}</span>` with icon component)
- Modify: `src/components/nav/OverlayNav.tsx:413` (replace 🔍 in search pill)
- Modify: `src/components/nav/OverlayNav.tsx:550` (replace 🔍 in mobile search)
- Modify: `src/components/nav/OverlayNav.tsx:642` (replace emoji in mobile drawer panel toggles)
- Modify: `src/components/panels/PanelShell.tsx:109-111` (replace emoji icon rendering)
- Modify: `src/components/panels/PanelShell.tsx:126-152` (replace × close button with IconClose)

**Step 1: Update PANEL_TOGGLES to use React components**

In `OverlayNav.tsx`, change the `PanelToggle` interface and `PANEL_TOGGLES` array:

```tsx
import { IconRadar, IconChat, IconBrief, IconTrend, IconSearch, IconClose } from "@/components/icons";

// Change interface
interface PanelToggle {
  id: PanelId;
  IconComponent: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  label: string;
  subtitle: string;
}

const PANEL_TOGGLES: PanelToggle[] = [
  { id: "live", IconComponent: IconRadar, label: "Live Events", subtitle: "Real-time conflict updates" },
  { id: "social", IconComponent: IconChat, label: "Social Feed", subtitle: "News, Reddit, Telegram" },
  { id: "brief", IconComponent: IconBrief, label: "Daily Brief", subtitle: "Top events last 12 hours" },
  { id: "escalation", IconComponent: IconTrend, label: "Threat Index", subtitle: "30-day escalation trend" },
];
```

Then update all usages of `pt.icon` to `<pt.IconComponent size={14} style={{ opacity: 0.8 }} />`.

Replace the search pill emoji `🔍` with `<IconSearch size={12} style={{ color: "#3d4f63" }} />`.

Replace the mobile search button emoji `🔍` with `<IconSearch size={12} />`.

**Step 2: Update PanelShell to use IconClose**

In `PanelShell.tsx`, import `IconClose`:

```tsx
import { IconClose } from "@/components/icons";
```

Replace the icon emoji rendering (line ~109-111) — since panels now pass an `IconComponent` instead of string `icon`, change the `icon` prop type to `ReactNode` and render directly. Actually, simpler: just keep `icon` as a ReactNode (it already accepts ReactNode since it's just rendered in a span). The PanelShell callers already pass the emoji as `icon="📡"`. Change the panel components to pass the SVG:

In LiveFeedPanel: `icon={<IconRadar size={13} />}`
In SocialFeedPanel: `icon={<IconChat size={13} />}`
In BriefPanel: `icon={<IconBrief size={13} />}`
In EscalationPanel: `icon={<IconTrend size={13} />}`

Replace the `×` close button content with `<IconClose size={14} />`.

**Step 3: Verify the app builds**

Run: `npx next build 2>&1 | tail -20`
Expected: build succeeds

**Step 4: Commit**

```bash
git add src/components/nav/OverlayNav.tsx src/components/panels/PanelShell.tsx src/components/panels/LiveFeedPanel.tsx src/components/panels/SocialFeedPanel.tsx src/components/panels/BriefPanel.tsx src/components/panels/EscalationPanel.tsx
git commit -m "feat: replace emoji icons with SVG icon components across nav and panels"
```

---

### Task 5: Add Active Route Highlighting

**Files:**
- Modify: `src/components/nav/OverlayNav.tsx:1-5` (add `usePathname` import)
- Modify: `src/components/nav/OverlayNav.tsx:164-175` (add `pathname` state)
- Modify: `src/components/nav/OverlayNav.tsx:305-328` (update desktop nav link rendering)
- Modify: `src/components/nav/OverlayNav.tsx:680-700` (update mobile drawer link rendering)

**Step 1: Import usePathname and use it**

At the top of `OverlayNav.tsx`, add:

```tsx
import { usePathname } from "next/navigation";
```

Inside the `OverlayNav` component function body, add:

```tsx
const pathname = usePathname();
```

**Step 2: Update desktop nav link styles**

In the desktop nav `NAV_LINKS.map()`, update the `<Link>` style to check `pathname === link.href`:

```tsx
const isActive = pathname === link.href;
```

Update the style object:
- If `isActive && !link.accent`: `color: "#e2e8f0"`, `borderBottom: "2px solid var(--accent-blue)"`, `paddingBottom: "2px"`
- If `isActive && link.accent`: keep `color: "var(--accent-red)"`, add `borderBottom: "2px solid var(--accent-red)"`, `paddingBottom: "2px"`
- Remove the `onMouseEnter`/`onMouseLeave` handlers for active links (no hover needed when active)

**Step 3: Update mobile drawer link styles**

In the mobile drawer `NAV_LINKS` rendering, add active state:

```tsx
const isActive = pathname === link.href;
```

Add to the mobile link style:
```tsx
borderLeft: isActive ? "3px solid var(--accent-blue)" : "3px solid transparent",
background: isActive ? "rgba(96,165,250,0.06)" : "transparent",
color: isActive && !link.accent ? "var(--text-primary)" : (link.accent ? "var(--accent-red)" : "var(--text-secondary)"),
```

**Step 4: Verify the app builds**

Run: `npx next build 2>&1 | tail -20`

**Step 5: Commit**

```bash
git add src/components/nav/OverlayNav.tsx
git commit -m "feat: add active route highlighting in desktop and mobile nav"
```

---

### Task 6: Add Page Transition Wrapper

**Files:**
- Create: `src/components/PageTransition.tsx`
- Modify: `src/app/layout.tsx:53-72` (wrap children with PageTransition)

**Step 1: Create PageTransition component**

```tsx
"use client";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Globe page has its own full-screen composition — skip transition
  if (pathname === "/") return <>{children}</>;

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
```

**Step 2: Wrap children in layout.tsx**

In `src/app/layout.tsx`, import `PageTransition`:

```tsx
import { PageTransition } from "@/components/PageTransition";
```

Wrap `{children}` with `<PageTransition>`:

```tsx
<PanelProvider>
  <OverlayNav />
  <CommandPalette />
  <PageTransition>{children}</PageTransition>
</PanelProvider>
```

**Step 3: Verify the app builds**

Run: `npx next build 2>&1 | tail -20`

**Step 4: Commit**

```bash
git add src/components/PageTransition.tsx src/app/layout.tsx
git commit -m "feat: add subtle page transition fade on route navigation"
```

---

### Task 7: Unify Panel Architecture (Remove Double-Mount)

**Files:**
- Modify: `src/app/page.tsx:86-220` (replace dual panel containers with single render)
- Modify: `src/components/panels/PanelShell.tsx:41-92` (add self-positioning for desktop)

**Step 1: Update PanelShell to self-position on desktop**

Currently PanelShell gets its desktop positioning from a parent `<div>` with `position: fixed; right: 1.5rem`. We need PanelShell to position itself. Add an optional `desktopPosition` prop:

```tsx
interface Props {
  id: PanelId;
  title: ReactNode;
  icon?: ReactNode;
  width?: number;
  maxHeight?: string;
  children: ReactNode;
  style?: React.CSSProperties;
  /** Desktop side: "right" (default), "left", or "none" (for non-globe pages) */
  side?: "right" | "left" | "none";
}
```

Update the desktop branch of the style to apply `position: fixed` when not "none":

```tsx
: side !== "none"
  ? {
      position: "fixed" as const,
      [side === "left" ? "left" : "right"]: "1.5rem",
      top: "64px",
      width,
      maxHeight,
      display: "flex",
      flexDirection: "column" as const,
      overflow: "hidden",
      zIndex: 100,
      ...style,
    }
  : {
      width,
      maxHeight,
      display: "flex",
      flexDirection: "column" as const,
      overflow: "hidden",
      ...style,
    }
```

**Step 2: Update globe page to mount panels once**

In `src/app/page.tsx`, remove the two `desktop-only` / `mobile-only` containers. Replace with a single container:

```tsx
{/* ── Panels (rendered once, self-positioning via PanelShell) ── */}
<LiveFeedPanel />
<SocialFeedPanel />
<BriefPanel />
<EscalationPanel />
<ContextPanel />
```

Update `ContextPanel` usage to pass `side="left"` and all right-side panels keep default `side="right"`.

The panels themselves need the `side` prop passed through. Update each panel component's PanelShell call:
- `LiveFeedPanel`: `<PanelShell id="live" ... side="right">`
- `SocialFeedPanel`: `<PanelShell id="social" ... side="right">`
- `BriefPanel`: `<PanelShell id="brief" ... side="right">`
- `EscalationPanel`: `<PanelShell id="escalation" ... side="right">`
- `ContextPanel`: `<PanelShell id="context" ... side="left">`

Actually, simpler approach: the `side` can be derived from the panel `id` inside PanelShell directly, avoiding prop drilling. Add a constant map:

```tsx
const PANEL_SIDE: Record<PanelId, "right" | "left"> = {
  live: "right",
  social: "right",
  brief: "right",
  escalation: "right",
  context: "left",
};
```

Use `PANEL_SIDE[id]` in PanelShell's desktop style calculation when the panel is rendered from the globe page. But we need to distinguish globe page usage from non-globe page usage.

Simplest approach: keep the `side` prop but default to `"right"`, and only ContextPanel passes `side="left"`. This way only ContextPanel needs updating.

Wait — actually the real issue is that the right-side panels need vertical stacking. Currently they stack because they're in a flex-column parent. Without a parent, each panel would be `position: fixed` at the same `top: 64px; right: 1.5rem` and overlap.

Better approach: keep a single container div (not desktop-only/mobile-only), and let PanelShell handle mobile vs desktop styling as it already does:

```tsx
{/* ── Right side panels ── */}
<div
  style={{
    position: "fixed",
    right: "1.5rem",
    top: "64px",
    zIndex: 100,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    maxHeight: "calc(100vh - 140px)",
    pointerEvents: "none",
  }}
>
  <LiveFeedPanel />
  <SocialFeedPanel />
  <BriefPanel />
  <EscalationPanel />
</div>

{/* ── Left panel ── */}
<div
  style={{
    position: "fixed",
    left: "1.5rem",
    top: "64px",
    zIndex: 100,
    pointerEvents: "none",
  }}
>
  <ContextPanel />
</div>
```

Then remove the `desktop-only` and `mobile-only` classes from these containers. The containers just position — PanelShell handles the actual show/hide and mobile bottom-sheet logic. On mobile, PanelShell renders with `position: fixed; bottom: 0; left: 0; right: 0` which overrides the parent's fixed positioning.

Actually, PanelShell's mobile variant already sets `position: fixed` with `bottom: 0; left: 0; right: 0`, so the parent container's positioning is irrelevant on mobile. The parent container just needs `pointerEvents: "none"` so it doesn't block clicks, and PanelShell's `motion.div` needs `pointerEvents: "auto"`.

Add `pointerEvents: "auto"` to the `motion.div` in PanelShell (both mobile and desktop branches).

Remove the `mobile-only` container entirely and remove the `desktop-only` class from the positioning containers (replace with `className` removal).

**Step 3: Verify the app builds and dev runs**

Run: `npx next build 2>&1 | tail -20`

**Step 4: Commit**

```bash
git add src/app/page.tsx src/components/panels/PanelShell.tsx
git commit -m "refactor: unify panel rendering — remove double-mount pattern"
```

---

### Task 8: Add Animated Marker Chip

**Files:**
- Modify: `src/app/page.tsx:151-217` (wrap marker chip in AnimatePresence + motion.div)

**Step 1: Add AnimatePresence import and wrap marker chip**

The globe page already imports from framer-motion indirectly (via panels). Add the import:

```tsx
import { AnimatePresence, motion } from "framer-motion";
```

Wrap the marker chip conditional:

```tsx
<AnimatePresence>
  {selectedMarker && (
    <motion.div
      key="marker-chip"
      initial={{ opacity: 0, y: -8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.95 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      style={{
        position: "fixed",
        top: "64px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 150,
        // ... rest of existing styles
      }}
    >
      {/* ... existing chip content (move from the old div) ... */}
    </motion.div>
  )}
</AnimatePresence>
```

Note: since `motion.div` controls the `transform` property for animation, and we also need `translateX(-50%)` for centering, we need to separate the centering. Use a wrapper approach:

```tsx
<AnimatePresence>
  {selectedMarker && (
    <div
      key="marker-chip-wrap"
      style={{
        position: "fixed",
        top: "64px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 150,
        maxWidth: "calc(100vw - 2rem)",
        width: "max-content",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -8, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.95 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        style={{
          background: "rgba(10,14,20,0.92)",
          border: `1px solid ${selectedMarker.color}44`,
          borderLeft: `3px solid ${selectedMarker.color}`,
          borderRadius: "4px",
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      >
        {/* chip content unchanged */}
      </motion.div>
    </div>
  )}
</AnimatePresence>
```

Also replace the `×` close button with `<IconClose size={16} />`.

**Step 2: Verify the app builds**

Run: `npx next build 2>&1 | tail -20`

**Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: add entrance/exit animation to globe marker chip"
```

---

### Task 9: Mobile THREATCON + Status in Nav Drawer

**Files:**
- Modify: `src/components/nav/OverlayNav.tsx:525-552` (add ThreatconMeter to mobile drawer)
- Modify: `src/components/nav/OverlayNav.tsx:19-89` (remove `desktop-only` from ThreatconMeter, make it accept a `compact` prop)

**Step 1: Make ThreatconMeter work without desktop-only**

Remove the `className="desktop-only"` from the ThreatconMeter's root div. Instead, the parent in the header bar already has `{!isCompactDesktop && <ThreatconMeter />}` which controls desktop visibility. For mobile, add it to the drawer.

Actually, the `desktop-only` class is on ThreatconMeter's own root div (line 49). The component renders itself but is hidden by CSS on mobile. Instead of removing the class (which would show it in the header on mobile, which we don't want), we should render a second instance in the drawer.

But wait — the whole point is to avoid double-mounting. Since ThreatconMeter only fetches once on mount and is lightweight, rendering two instances is acceptable. The alternative is to lift the state up, which is overkill for a single fetch.

Add ThreatconMeter to the mobile drawer, between search and panels:

```tsx
{/* THREATCON in drawer */}
<div style={{
  padding: "8px 20px",
  borderBottom: "1px solid rgba(30,42,56,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}}>
  <ThreatconMeter />
</div>
```

But ThreatconMeter has `className="desktop-only"` on its root div, so it would be hidden in the mobile drawer too. Fix: remove the `className="desktop-only"` from ThreatconMeter and instead add it at the call site in the header:

In the header section where ThreatconMeter is called (`{!isCompactDesktop && <ThreatconMeter />}`), wrap it:

```tsx
{!isCompactDesktop && (
  <div className="desktop-only">
    <ThreatconMeter />
  </div>
)}
```

Remove the `className="desktop-only"` and `data-tour="step-threatcon"` from ThreatconMeter's root div, and move `data-tour` to the wrapper too.

Then render ThreatconMeter in the mobile drawer without the desktop-only wrapper.

**Step 2: Add compact status to mobile drawer footer**

Add a status indicator at the bottom of the mobile drawer. Create a simple inline `MobileStatusIndicator`:

```tsx
function MobileStatusIndicator() {
  const [status, setStatus] = useState<{ ok: boolean; totalClusters: number } | null>(null);

  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => {});
  }, []);

  if (!status) return null;

  return (
    <div style={{
      padding: "10px 20px",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontFamily: "var(--font-mono)",
      fontSize: "9px",
      color: "#3d4f63",
      letterSpacing: "0.08em",
    }}>
      <span style={{
        width: "5px",
        height: "5px",
        borderRadius: "50%",
        background: status.ok ? "#22c55e" : "#e03e3e",
        flexShrink: 0,
      }} />
      <span>{status.totalClusters} events tracked</span>
    </div>
  );
}
```

Add at the bottom of the mobile drawer, after the nav links:

```tsx
<MobileStatusIndicator />
```

**Step 3: Verify the app builds**

Run: `npx next build 2>&1 | tail -20`

**Step 4: Commit**

```bash
git add src/components/nav/OverlayNav.tsx
git commit -m "feat: surface THREATCON meter and status indicator in mobile nav drawer"
```

---

### Task 10: Mobile /strikes Compact Control Bar

**Files:**
- Modify: `src/app/strikes/page.tsx:265-377` (add mobile collapse/expand to bottom control bar)

**Step 1: Add mobile state and responsive control bar**

Add `useIsMobile` and `expanded` state:

```tsx
const [isMobile, setIsMobile] = useState(false);
const [controlExpanded, setControlExpanded] = useState(false);

useEffect(() => {
  const check = () => setIsMobile(window.innerWidth < 769);
  check();
  window.addEventListener("resize", check, { passive: true });
  return () => window.removeEventListener("resize", check);
}, []);
```

Wrap the bottom control bar content. When `isMobile && !controlExpanded`, show only:

```tsx
{/* Compact mobile strip */}
<div
  onClick={() => setControlExpanded(true)}
  style={{
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
  }}
>
  <div style={{ flex: 1 }}>
    <div style={{
      fontFamily: "var(--font-mono)",
      fontSize: "11px",
      fontWeight: 700,
      color: "#e2e8f0",
      letterSpacing: "0.04em",
    }}>
      {strike.name}
    </div>
    <div style={{
      fontFamily: "var(--font-mono)",
      fontSize: "9px",
      color: typeColor[wave.type],
      letterSpacing: "0.06em",
    }}>
      Wave {waveIdx + 1}/{strike.waves.length} · {typeLabel[wave.type]}
    </div>
  </div>
  {/* Playback controls */}
  <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
    <button onClick={(e) => { e.stopPropagation(); setWaveIdx(Math.max(0, waveIdx - 1)); }} disabled={waveIdx === 0} style={{ ... mini button styles ... }}>‹</button>
    <button onClick={(e) => { e.stopPropagation(); setPlaying(v => !v); }} style={{ ... }}>
      {playing ? "⏸" : "▶"}
    </button>
    <button onClick={(e) => { e.stopPropagation(); setWaveIdx(Math.min(strike.waves.length - 1, waveIdx + 1)); }} disabled={waveIdx === strike.waves.length - 1} style={{ ... }}>›</button>
  </div>
  <span style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: "#3d4f63" }}>▲ TAP</span>
</div>
```

When `isMobile && controlExpanded`, show all existing content plus a collapse button. Add framer-motion `AnimatePresence` for the expanded section:

```tsx
import { AnimatePresence, motion } from "framer-motion";
```

Wrap the expanded detail content in:
```tsx
<AnimatePresence>
  {controlExpanded && (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{ overflow: "hidden" }}
    >
      {/* Strike header, wave timeline, current wave detail — existing code */}
    </motion.div>
  )}
</AnimatePresence>
```

When `!isMobile`, render the full existing control bar unchanged.

Reduce the padding on mobile: `padding: isMobile ? "10px 16px 14px" : "16px 20px 20px"`.

Add a collapse button when expanded on mobile:

```tsx
<button
  onClick={() => setControlExpanded(false)}
  style={{
    position: "absolute",
    top: "8px",
    right: "12px",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#3d4f63",
    fontFamily: "var(--font-mono)",
    fontSize: "9px",
  }}
>
  ▼ COLLAPSE
</button>
```

**Step 2: Verify the app builds**

Run: `npx next build 2>&1 | tail -20`

**Step 3: Commit**

```bash
git add src/app/strikes/page.tsx
git commit -m "feat: add collapsible control bar for mobile /strikes page"
```

---

### Task 11: Deduplicate timeAgo Utility

**Files:**
- Create: `src/lib/utils/timeAgo.ts`
- Modify: `src/components/panels/LiveFeedPanel.tsx:26-32` (remove local timeAgo, import shared)
- Modify: `src/components/panels/SocialFeedPanel.tsx:15-21` (remove local timeAgo, import shared)

**Step 1: Create shared utility**

```ts
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return `${Math.floor(diff / 60000)}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
```

**Step 2: Update both panels to import from shared utility**

In both `LiveFeedPanel.tsx` and `SocialFeedPanel.tsx`:

```tsx
import { timeAgo } from "@/lib/utils/timeAgo";
```

Remove the local `function timeAgo(...)` from each file.

**Step 3: Verify the app builds**

Run: `npx next build 2>&1 | tail -20`

**Step 4: Commit**

```bash
git add src/lib/utils/timeAgo.ts src/components/panels/LiveFeedPanel.tsx src/components/panels/SocialFeedPanel.tsx
git commit -m "refactor: deduplicate timeAgo utility into shared module"
```

---

### Task 12: Final Build Verification and Visual QA

**Step 1: Run full build**

Run: `npx next build 2>&1 | tail -30`
Expected: build succeeds with no errors

**Step 2: Run dev server and verify visually**

Run: `npx next dev`

Check:
- Globe page: panels render once (check Network tab — each panel API should fire once, not twice)
- Panels show skeleton loading on first load
- SVG icons appear in nav panel toggles, panel headers, and close buttons
- Current route is highlighted in nav (blue underline on desktop, blue left border on mobile)
- Navigating between pages shows a subtle fade transition
- Marker chip animates in/out on globe marker click
- Mobile: THREATCON meter appears in nav drawer
- Mobile: status indicator appears at bottom of nav drawer
- Mobile /strikes: bottom bar is compact, tap to expand

**Step 3: Commit any fixes needed**

If any fixes are needed from visual QA, commit them individually.

**Step 4: Final commit message**

```bash
git log --oneline -12
```

Verify all commits are in place.
