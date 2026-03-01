# Warspy UX Overhaul v2 — Design Document

**Date:** 2026-03-01
**Scope:** Visual Polish & Micro-interactions + Mobile Experience Overhaul

---

## 1. Unified Panel Architecture

**Problem:** Globe page mounts all 5 panels twice (desktop-only + mobile-only containers), doubling data fetches.

**Solution:** Remove dual containers. Mount panels once. PanelShell already handles desktop vs mobile positioning via `useIsMobile()`. Each panel applies its own `position: fixed` styling based on viewport — no parent positioning wrapper needed.

**Changes:**
- `src/app/page.tsx` — replace two desktop-only/mobile-only divs with single panel container
- `PanelShell.tsx` — desktop panels get `position: fixed` with right-side offset (currently inherited from parent)
- Each right-side panel gets a CSS custom property `--panel-slot` (0-3) for vertical stacking

---

## 2. Skeleton Loading States

**Problem:** All panels show plain "LOADING..." text.

**Solution:** `PanelSkeleton` component — pulsing placeholder rows mimicking panel content shape.

- 4 rows default, each with: left color bar (8px), text block (60-80% width), right tag (30px)
- CSS `@keyframes skeleton-pulse` — opacity 0.3 → 0.6, 1.2s ease-in-out infinite
- Background: `rgba(30,42,56,0.4)`
- Used in LiveFeedPanel, SocialFeedPanel, BriefPanel, EscalationPanel

---

## 3. Active Route Highlighting

**Problem:** No visual indicator for current page in nav.

**Solution:** `usePathname()` in OverlayNav.

- **Desktop:** active link → `color: #e2e8f0` + 2px bottom border `var(--accent-blue)` + `paddingBottom: 2px`
- **Mobile drawer:** active link → left 3px border accent + `background: rgba(96,165,250,0.06)`
- FOCUS: Israel–Iran keeps red color, gets border indicator when active

---

## 4. Page Transitions

**Problem:** Hard cuts between pages.

**Solution:** `PageTransition` client component wrapping `{children}` in layout.tsx.

- `motion.div` with `key={pathname}`
- `initial={{ opacity: 0 }}` → `animate={{ opacity: 1 }}`, 150ms
- No exit animation (would require route-level AnimatePresence which conflicts with server components)
- Globe page excluded via conditional check on pathname `/`

---

## 5. SVG Icon System

**Problem:** Emoji icons render inconsistently across platforms.

**Solution:** `src/components/icons/` with monoline SVG components:

| Component | Replaces | Usage |
|-----------|----------|-------|
| `IconRadar` | 📡 | Live panel toggle, PanelShell header |
| `IconChat` | 💬 | Social panel toggle |
| `IconBrief` | 📋 | Brief panel toggle |
| `IconTrend` | 📈 | Escalation panel toggle |
| `IconSearch` | 🔍 | Search pill, command palette |
| `IconClose` | × | PanelShell close, marker chip dismiss |

Each: `currentColor` stroke, `size` prop (default 14), simple SVG paths, no external deps.

---

## 6. Mobile THREATCON + Status

**Problem:** Mobile users have no threat level or data health visibility.

**Solution:**
- Add `ThreatconMeter` to mobile nav drawer (between search and panels section)
- Add compact status indicator to drawer footer (dot + cluster count)
- Remove `desktop-only` class from ThreatconMeter, add it inline to drawer
- No new data fetches — reuse existing components

---

## 7. Mobile /strikes Optimization

**Problem:** Strike control bar consumes 60-70% of mobile screen height.

**Solution:** Collapsed/expanded toggle on mobile:
- **Collapsed (default):** single row — strike name, wave N/M, play/pause, prev/next arrows
- **Expanded (tap to expand):** full stats, wave tabs, description
- `AnimatePresence` + `motion.div` for expand/collapse, 200ms
- Desktop unchanged

---

## 8. Animated Marker Chip

**Problem:** Marker chip appears without animation.

**Solution:** Wrap in `AnimatePresence` + `motion.div`:
- Enter: `{ opacity: 0, y: -8, scale: 0.95 }` → `{ opacity: 1, y: 0, scale: 1 }`
- Exit: reverse
- Duration: 180ms, easeOut

---

## Out of Scope

- Accessibility overhaul (ARIA, focus management) — separate effort
- Performance optimizations beyond panel dedup (Suspense, streaming) — separate effort
- FilterBar custom dropdowns — separate effort
