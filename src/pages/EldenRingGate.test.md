# EldenRingGate - 4 Phase Boss Fight Test Suite

## ✅ Phase System Tests

### Phase Transitions
- [ ] **Phase 1 (1000-750 HP)**: Rocket Shower mechanics active
- [ ] **Phase 2 (750-500 HP)**: Drone spawns, diagonal rain attacks
- [ ] **Phase 3 (500-250 HP)**: Dragon spawns, drone removed, flame attacks
- [ ] **Phase 4 (250-0 HP)**: Clones spawn, dragon removed, bullet hell mode

### Phase Detection
```javascript
getCurrentPhase(1000) === 1 // ✅
getCurrentPhase(750) === 2  // ✅
getCurrentPhase(500) === 3  // ✅
getCurrentPhase(250) === 4  // ✅
getCurrentPhase(0) === 4    // ✅
```

---

## 🎯 PHASE 1 - Rocket Shower Tests

### Timeline Execution (40s loop)
- [ ] **0s**: Tracking Burst fires
- [ ] **5s**: Tracking Burst fires
- [ ] **8s**: Rocket Rain fires
- [ ] **10s**: Tracking Burst fires
- [ ] **16s**: Rocket Rain fires
- [ ] **24s**: Rocket Rain fires
- [ ] **32s**: Rocket Rain fires
- [ ] **40s**: Rocket Rain fires + KNOCKDOWN triggers

### Attack Mechanics
- [ ] **Tracking Burst**: 3 rockets fire sequentially (300ms apart)
- [ ] **Rocket Rain**: 8 rockets with 180px gaps
- [ ] **Countdown**: Starts at 150px proximity, 2s timer
- [ ] **Explosion**: 120px radius, 15 damage
- [ ] **Knockdown**: After 5th rain attack, boss falls for 5 seconds

### Visual Elements
- [ ] Countdown number displays
- [ ] Pulsing red warning circle
- [ ] Shower rockets have orange glow
- [ ] Boss shows "[IMMUNE]" when flying

---

## ⚡ PHASE 2 - Aerial Pressure Tests

### Drone Mechanics
- [ ] **Spawn**: Drone appears at phase start
- [ ] **Movement**: Bounces off screen edges
- [ ] **Health**: 100 HP, displayed with green bar
- [ ] **Fire Rate**: Shoots bullets every 1 second
- [ ] **Bullets**: Slow yellow orbs, 3-second lifetime
- [ ] **Destruction**: Boss stunned for 4 seconds when HP reaches 0

### Timeline Execution (30s loop)
- [ ] **0s**: Homing Swarm
- [ ] **4s**: Homing Swarm
- [ ] **6s**: Diagonal Rain (left)
- [ ] **8s**: Homing Swarm
- [ ] **14s**: Diagonal Rain (right)
- [ ] **22s**: Diagonal Rain (left)
- [ ] **30s**: Diagonal Rain (right)

### Attack Mechanics
- [ ] **Homing Swarm**: 5 rockets with slight curve
- [ ] **Diagonal Rain**: Rockets fall at angle (vx = ±2)
- [ ] **Boss Movement**: Horizontal sine wave pattern (300px range)

### Visual Elements
- [ ] Drone rendered as gray rectangle with propellers
- [ ] Propeller animation (sine wave)
- [ ] Target indicator above drone
- [ ] Yellow bullets visible

---

## 🔥 PHASE 3 - Dragon Chaos Tests

### Dragon Mechanics
- [ ] **Spawn**: Dragon appears at phase start, drone removed
- [ ] **Size**: 900x600px purple creature
- [ ] **Movement**: Horizontal movement, bounces at edges
- [ ] **Weak Point**: Red pulsing circle (30-40px radius)
- [ ] **Weak Point HP**: 150 HP
- [ ] **Destruction**: Boss stunned for 5 seconds when HP reaches 0

### Timeline Execution (25s loop)
- [ ] **0s**: Flame Sweep
- [ ] **3s**: Rocket Rain
- [ ] **6s**: Flame Sweep
- [ ] **8s**: Rocket Rain
- [ ] **10s**: Dive Bomb
- [ ] **12s**: Flame Sweep
- [ ] **15s**: Rocket Rain
- [ ] **20s**: Dive Bomb

### Attack Mechanics
- [ ] **Flame Sweep**: Horizontal fire beam (60px height, 2s duration)
- [ ] **Rocket Rain**: Creates fire zones on impact (4s duration)
- [ ] **Dive Bomb**: 10 sequential explosions (500ms apart, 80px spacing)
- [ ] **Fire Zone Damage**: 5 HP per tick while standing in fire

### Visual Elements
- [ ] Dragon rendered with purple body
- [ ] Red weak point pulses
- [ ] Animated flames (sine wave movement)
- [ ] Fire zones show orange particles
- [ ] Weak point HP bar displayed

---

## 💀 PHASE 4 - Bullet Hell Tests

### Clone Mechanics
- [ ] **Spawn**: 3 boss positions (left, center, right)
- [ ] **Real Boss**: Randomly chosen, has yellow glow
- [ ] **Fake Clones**: 50% opacity, no glow
- [ ] **Clone Shift**: Repositions every 4-5 seconds
- [ ] **Identification**: Real boss glows yellow

### Timeline Execution (20s loop)
- [ ] **0s**: Clone Shift + Rocket Storm Start
- [ ] **2s**: Tracking Split
- [ ] **4s**: Clone Shift
- [ ] **6s**: Tracking Split + Laser Grid
- [ ] **8s**: Clone Shift
- [ ] **10s**: Tracking Split
- [ ] **12s**: Clone Shift + Laser Grid
- [ ] **14s**: Tracking Split
- [ ] **16s**: Clone Shift
- [ ] **18s**: Laser Grid + Tracking Split

### Attack Mechanics
- [ ] **Rocket Storm**: Continuous spawn every 0.5s
- [ ] **Zig-Zag Rockets**: Sine wave horizontal movement
- [ ] **Tracking Split**: Explodes into 4 mini-rockets (90° angles)
- [ ] **Laser Grid**: 2 horizontal + 3 vertical lasers
- [ ] **Telegraph**: 1s warning (dashed red lines)
- [ ] **Laser Damage**: 20 HP, 2s duration

### Visual Elements
- [ ] Real boss has yellow outline
- [ ] Fake clones semi-transparent
- [ ] Zig-zag rockets wave visually
- [ ] Lasers show telegraph phase
- [ ] Active lasers: red outer, yellow inner
- [ ] Mini-rockets spawn in cross pattern

---

## 🎮 Combat System Tests

### Player Attacks
- [ ] **Phase 1**: Can only damage boss when KNOCKED (50 HP per hit)
- [ ] **Phase 2**: Can attack drone (20 HP per hit, 300px range)
- [ ] **Phase 3**: Can attack dragon weak point (25 HP per hit, 250px range)
- [ ] **Phase 4**: Can only damage real boss clone

### Damage Values
| Attack Type | Damage | Notes |
|------------|--------|-------|
| Rocket Hit | 10 HP | Direct collision |
| Rocket Explosion | 15 HP | 120px radius |
| Drone Bullet | 8 HP | Direct hit |
| Fire Zone | 5 HP | Per tick |
| Laser Hit | 20 HP | One-time |
| Dive Explosion | 12 HP | 100px radius |
| Player Attack (Boss) | 50 HP | Melee range |
| Player Attack (Drone) | 20 HP | Projectile |
| Player Attack (Dragon) | 25 HP | Weak point |

### Dash Mechanics
- [ ] **Invulnerability**: 500ms
- [ ] **Cooldown**: 1000ms
- [ ] **Speed Multiplier**: 3x
- [ ] **Duration**: 200ms
- [ ] **Visual**: Bright glow effect

---

## 📋 Timeline System Tests

### Execution Logic
```javascript
// Timeline fires actions at exact times
phaseTime === 0s → fire action
phaseTime === 5s → fire action
phaseTime === 8s → fire action

// Actions only fire once per loop
executedActionsRef tracks: "phase-time-action"
Example: "1-0-trackingBurst" ✅
```

### Loop Reset
- [ ] **Phase 1**: Resets at 42s (40s max + 2s buffer)
- [ ] **Phase 2**: Resets at 32s
- [ ] **Phase 3**: Resets at 27s
- [ ] **Phase 4**: Resets at 22s

### Action Mapping
```javascript
'trackingBurst' → trackingBurst()
'rocketRain' → rocketRain()
'homingSwarm' → homingSwarm()
'diagonalRain' → diagonalRain(angle)
'flameSweep' → flameSweep()
'diveBomb' → diveBomb()
'cloneShift' → cloneShift()
'trackingSplit' → trackingSplit()
'laserGrid' → laserGrid()
'rocketStormStart' → rocketStormStart()
```

---

## 🐛 Edge Case Tests

### Phase Transitions
- [ ] Timeline resets when phase changes
- [ ] `executedActionsRef` clears on phase change
- [ ] Old entities removed (drone → dragon → clones)
- [ ] Boss position resets appropriately

### Knockdown States
- [ ] **Phase 1**: Knockdown after 5th rain (timeline event)
- [ ] **Phase 2**: Knockdown when drone HP = 0
- [ ] **Phase 3**: Knockdown when dragon weak point HP = 0
- [ ] **Phase 4**: No knockdown (continuous)

### Recovery Behavior
- [ ] Timeline restarts after recovery
- [ ] `executedActionsRef` clears
- [ ] Boss returns to correct phase behavior

### Victory Condition
- [ ] Boss HP reaches 0
- [ ] State changes to BOSS_DEAD
- [ ] Rocket storm stops
- [ ] Victory screen displays

### Game Over
- [ ] Player HP reaches 0
- [ ] All attacks stop
- [ ] "TRY AGAIN" button appears

---

## 🎨 Visual Rendering Tests

### Render Order (Bottom to Top)
1. Background gradient
2. Platform (gothic stone)
3. Fire zones
4. Dragon
5. Drone
6. Drone bullets
7. Lasers (telegraph then active)
8. Boss/Clones
9. Rockets
10. Player
11. UI (HP bars, phase indicator)

### Boss HP Bar
- [ ] Shows current phase name
- [ ] Phase color matches current phase
- [ ] State indicator (AIRBORNE / KNOCKED DOWN / RECOVERING)
- [ ] Pixelated skulls on both sides

### Player HP Bar
- [ ] Gradient changes with HP (green/yellow/red)
- [ ] Dash indicator shows cooldown
- [ ] Monospace font

---

## 🚀 Console Debug Messages

Expected console output:
```
🎮 PHASE 1 STARTED - Rocket Shower
📋 Timeline: [...]
🚀 P1: Tracking Burst
🌧️ P1: Rocket Rain (vertical)
💥 BOSS KNOCKED!
⬆️ Boss recovering...
✈️ Boss recovered!
🔁 Phase 1 timeline reset

🎮 PHASE 2 STARTED
🤖 P2: Drone Spawned
🎯 P2: Homing Swarm
🌧️ P1: Rocket Rain (left)
🤖 Drone hit! HP: 80
🤖 Drone destroyed! Boss stunned!

🎮 PHASE 3 STARTED
🐉 P3: Dragon Spawned
🔥 P3: Flame Sweep
💣 P3: Dive Bomb
🐉 Dragon weak point hit! HP: 125
🐉 Dragon stunned! Boss vulnerable!

🎮 PHASE 4 STARTED
👥 P4: Clone Shift
🌪️ P4: Rocket Storm ACTIVE
💥 P4: Tracking Split
⚡ P4: Laser Grid
💥 Split rocket exploded into 4 minis!
```

---

## 🧪 Manual Test Checklist

### Before Testing
1. Open browser console (F12)
2. Start EldenRingGate
3. Watch for phase initialization logs

### Test Sequence
1. **Phase 1**:
   - Survive first 40 seconds
   - Verify timeline attacks fire
   - Get knocked down on 5th shower
   - Attack boss during knockdown
   - Verify boss recovers after 5 seconds

2. **Phase 2** (at 750 HP):
   - Verify drone spawns
   - Attack drone with left click
   - Dodge homing swarm
   - Dodge diagonal rain patterns
   - Destroy drone to knock boss

3. **Phase 3** (at 500 HP):
   - Verify dragon spawns
   - Attack red weak point
   - Dodge flame sweeps
   - Avoid fire zones
   - Dodge dive bomb trail
   - Destroy weak point to knock boss

4. **Phase 4** (at 250 HP):
   - Identify real boss (yellow glow)
   - Dodge continuous rocket storm
   - Avoid laser grid
   - Dodge split mini-rockets
   - Attack real boss only

### Performance Checks
- [ ] Game runs at 60 FPS
- [ ] No memory leaks
- [ ] Timeline doesn't skip actions
- [ ] All entities render correctly
- [ ] Collision detection accurate

---

## 📊 Expected Behavior Summary

| Phase | HP Range | Main Mechanic | Knockdown Trigger | Attacks |
|-------|----------|---------------|-------------------|---------|
| 1 | 1000-750 | Rocket Shower | 5th rain attack | Tracking + Rain |
| 2 | 750-500 | Drone | Destroy drone | Homing + Diagonal |
| 3 | 500-250 | Dragon | Hit weak point | Flame + Dive + Rain |
| 4 | 250-0 | Clones | None | Storm + Split + Lasers |

---

## ✅ Test Pass Criteria

- [ ] All 4 phases trigger at correct HP thresholds
- [ ] All timeline attacks fire at correct times
- [ ] All special mechanics work (drone, dragon, clones)
- [ ] All damage values accurate
- [ ] All visual effects render
- [ ] Console logs match expected output
- [ ] No errors in browser console
- [ ] Game can be completed (0 HP boss)
- [ ] Player can die (0 HP player)
- [ ] Phase transitions smooth
- [ ] Knockdown states work correctly
- [ ] All attack patterns dodgeable

---

## 🔧 Debug Commands

Add these to browser console for testing:

```javascript
// Skip to Phase 2
bossHealthRef.current = 740;
setBossHealth(740);

// Skip to Phase 3
bossHealthRef.current = 490;
setBossHealth(490);

// Skip to Phase 4
bossHealthRef.current = 240;
setBossHealth(240);

// Instant kill boss
bossHealthRef.current = 1;
setBossHealth(1);

// God mode (player)
playerHealthRef.current = 9999;
setPlayerHealth(9999);

// Destroy drone instantly
droneHealthRef.current = 0;

// Destroy dragon weak point
dragonWeakPointHPRef.current = 0;
```

---

## 🎯 Known Issues to Check

- [ ] Timeline loops correctly
- [ ] Clones follow real boss position
- [ ] Lasers don't damage during telegraph
- [ ] Fire zones expire correctly
- [ ] Drone bullets remove after lifetime
- [ ] Rockets clean up when off-screen
- [ ] Split rockets spawn at correct angles
- [ ] Zig-zag rockets wave smoothly
- [ ] Boss doesn't get stuck
- [ ] All attack ranges correct

---

**Test Status**: 🔄 Ready for Testing
**Last Updated**: Phase 4 implementation complete
**Next Steps**: Run full playthrough test, verify all mechanics
