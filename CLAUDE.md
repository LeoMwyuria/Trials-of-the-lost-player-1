# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (Vite, hot reload)
npm run build      # Production build → dist/
npm run preview    # Serve the dist/ build locally
npm run lint       # ESLint check
```

No test framework is set up — there are no automated tests to run.

## Architecture

**Stack:** React 19 + Vite + React Router v7. No state management library. Deployed on Vercel (`vercel.json` rewrites all paths to `/` for SPA routing).

### App boot sequence (`App.jsx`)

Three sequential gates before the app renders:
1. **Auth** — checks `localStorage.creative_hub_auth`. Shows `<Login>` if missing. Credentials: `admin` / `admino`.
2. **Preloader** — bulk-preloads all images and audio via `Promise.all`. Result cached in `sessionStorage.assetsLoaded` so it only runs once per browser session.
3. **Router** — `BrowserRouter` with five routes (see below).

> All `useEffect` hooks must be declared before any conditional `return` in `App.jsx` — violating React's Rules of Hooks here previously caused login to not redirect.

### Routes

| Path | Component | Gate |
|------|-----------|------|
| `/` | `LandingPage` | Hub/menu |
| `/gate-1-library` | `LibraryGate` | Book puzzle |
| `/gate-2-hive` | `BeeHiveGate` | Bee game |
| `/gate-3-the-last-harvest` | `LastHarvestPuzzle` | Catan-style puzzle |
| `/gate-4-elden-ring` | `EldenRingGate` | Boss fight game |

### EldenRingGate — boss fight (`src/pages/EldenRingGate.jsx`)

The largest and most complex file (~4700+ lines). It runs two parallel `requestAnimationFrame` loops — one for game physics, one for canvas rendering — both managed inside a single `useEffect`.

**Phase system:**
- Boss HP: 1000 → 0, split into 4 phases at thresholds 750 / 500 / 250.
- Phase transitions only happen when boss HP crosses a threshold; during a knockdown the HP is **floored at the next threshold** so the player cannot skip phases.
- Phase 2 → 3 transition: when the drone dies, boss enters KNOCKED state. On recovery, HP is checked — if still above 500, drone respawns (stays Phase 2); if ≤ 500, rat spawns (Phase 3 begins).

**Boss state machine:** `BOSS_FLYING` → `BOSS_KNOCKED` (5s) → `BOSS_RECOVERING` (1s) → `BOSS_FLYING`. Phase 4 knockdown triggers the Ilarion Rage climbing minigame instead.

**Timeline system:** Each phase has a `PHASE_TIMELINES[n]` array of `{ time, action }` events (in seconds). The game loop checks elapsed time and fires each action once via a `Set` of executed action keys. Timelines loop when the max time + 2s elapses.

**Rendering order (important):** Platform → Boss/Clones → **Lasers** → Rockets/projectiles → Player → UI. Lasers must be drawn after the boss so they appear on top.

**Laser types:**
- `horizontal` / `vertical` — static, full-screen grid (from `laserGrid()`)
- `sweep` — moves from right to left at different heights (from `sweepLasers()`); requires player to jump. Has a 900ms telegraph phase showing a dashed line + `▶▶▶` arrows.

**Key refs pattern:** Game state that needs to be read inside the animation loop uses `useRef` (e.g. `bossHealthRef`, `knightPosRef`). React state (`useState`) is used only for values that drive UI re-renders (HP bars, game over screen, etc.).

### Shared audio component (`GateMusic.jsx`)

Used by all gates. Accepts `src`, `autoplay`, `initialVolume`, `startTime`, `onTrackChange` props. Renders a floating 🎵 button that expands into play/volume controls. Gate 4 dynamically changes `src` when phases change.

### Adding a new gate

1. Create `src/pages/MyGate.jsx` + `MyGate.css`
2. Add a route in `App.jsx`
3. Add critical assets to `ASSETS_TO_PRELOAD` in `Preloader.jsx`
4. Link from `LandingPage.jsx`
