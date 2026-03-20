# Anniversary I — Trials of the Lost Player

A personalized multi-gate puzzle-adventure website where the player — called **"Tarnished"** — must solve increasingly complex trials crafted by a character named **YAIR**. Each gate tests different skills: source code inspection, luck, quick math, and logical deduction. Built as a dark, mysterious, game-like experience inspired by Elden Ring / Dark Souls lore.
---

## The Journey

### Gate 0 — The First Trial (`/`)

The landing page sets an ominous tone with lore text and a cryptic puzzle. The word **"N0W"** contains a zero instead of the letter O — the player must use browser **DevTools (Inspect Element)** to fix it, then click to proceed. A bookshelf modal opens with hidden clues (including a DEATH NOTE reference). Hints are scattered everywhere: ROT13-encoded URLs in CSS comments, styled console messages referencing Caesar cipher, falling Matrix-style numbers, and nearly-invisible text whispering *"Only the desperate inspect the darkness."*

### Gate 2 — The Hive (`/gate-2-hive`)

A gacha bee-collection battle game inspired by Bee Swarm Simulator. The player drags **10 Royal Jellies** onto **5 hive slots**, randomly spawning bees from a pool of 20 pop-culture-named characters (Gojo, Killua, Zoro, Jon Snow, Hakari, etc.) with rarities from Common to Mythic. After filling the hive, a **"BET ON"** battle begins — only **Hakari** (Mythic) can win. Following the battle, a **Meteor Shower** phase rains 14 meteors spelling **"TheLastHarvest"**. Each meteor triggers a **3-second timed math quiz**. All 14 letters must be revealed and typed as the code to advance.

### Gate 3 — The Last Harvest (`/gate-3-the-last-harvest`)

A two-phase Catan-inspired challenge:

1. **Resource Harvesting** — Click 13 fields to randomly harvest resources (Wheat, Ore, Wood, Sheep, Clay), then arrange them back in the original generated order. Wrong order triggers a falling sheep animation and resets.
2. **Catan Board Reconstruction** — The hardest puzzle. A full 19-hex Catan board is randomly generated with proper resource distribution and number tokens. Settlements are placed following Catan's distance rule. A 14-turn game log shows dice rolls, resource production, and robber movements. The player must **deduce** which resources and numbers belong on each hex, then **drag-and-drop** tiles into place. Only **100% accuracy** is accepted.

### Gates 1 & 4 — Coming Soon

Placeholder gates accessible from the dev navigation sidebar.

---

## Features

- **DevTools Puzzle** — Requires inspecting and editing the DOM to progress
- **ROT13 / Cipher Hints** — Encoded clues hidden in CSS comments and source code
- **Console Clues** — Styled `console.log` messages serve as hints throughout
- **Drag-and-Drop** — Egg-to-hive placement and resource-to-hex tile placement
- **Timed Math Challenges** — 3-second multiplication quizzes during the meteor phase
- **Glitch Text Effects** — Cyberpunk-style `::before`/`::after` glitch title animations
- **Animated Starfield** — SVG-based twinkling star patterns across pages
- **Falling Elements** — Matrix-style numbers, falling meteors, and tumbling sheep
- **Music Player** — Persistent floating player with play/pause, skip, volume, and progress bar
- **Nebula Backgrounds** — Radial gradients with animated fog layers
- **Custom Cursor** — Themed pointer cursor across all pages

---

## Tech Stack

| Technology | Version |
| ---------- | ------- |
| React | 19.2 |
| React Router DOM | 7.13 |
| Vite | 7.3 |
| Plain CSS | Per-page stylesheets |
| ESLint | 9.39 |

No external UI libraries, CSS frameworks, or state management — pure React with vanilla CSS.

---

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Project Structure

```
src/
├── App.jsx                  # Router & layout
├── main.jsx                 # Entry point
├── pages/
│   ├── LandingPage.jsx      # Gate 0 — The First Trial
│   ├── BeeHiveGate.jsx      # Gate 2 — The Hive
│   ├── LastHarvestGate.jsx   # Gate 3 — Resource Harvesting
│   └── LastHarvestPuzzle.jsx # Gate 3 — Catan Board Reconstruction
├── components/
│   └── MusicPlayer.jsx      # Persistent music player
└── assets/
    ├── audio/               # Background music tracks
    ├── bee-audio/           # Bee-related sound effects
    ├── images/              # UI images & backgrounds
    ├── battle-arena/        # Battle assets
    ├── bees-3d/             # 3D bee models (reserved)
    └── hive-3d/             # 3D hive models (reserved)
public/
└── assets/
    ├── bees-png/            # Bee sprite images
    ├── catan/               # Catan tile assets
    └── eggs-items/          # Royal Jelly egg images
```
