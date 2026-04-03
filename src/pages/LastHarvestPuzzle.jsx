import { useState, useEffect, useRef } from 'react';
import './LastHarvestPuzzle.css';
import '../components/GateMusic.css';

const AUDIO_V2        = new URL('../assets/audio/v2.mp3', import.meta.url).href;
const AUDIO_DELIRIOUS = new URL('../assets/audio/Delirious.mp3', import.meta.url).href;
const AUDIO_CATAN     = new URL('../assets/audio/Catan Universe Menu Theme.mp3', import.meta.url).href;

// Narrator timeline — times relative to v2 start
const NARRATOR_TIMELINE = [
  { time: 500,   phase: 'fields'   },
  { time: 5000,  phase: 'resource' },
  { time: 9000,  phase: 'drag'     },
  { time: 16000, phase: 'logs'     },
  { time: 23000, phase: 'hint'     },
  { time: 29000, phase: 'memory'   },
  { time: 34000, phase: 'recall'   },
  { time: 39000, phase: 'mistake'  },
  { time: 44000, phase: 'reset'    },
  { time: 49000, phase: 'ritual'   },
  { time: 56000, phase: 'gate'     },
  { time: 61000, phase: 'chaos'    },
];

const PHASE_CALLOUT = {
  fields:   { icon: '🌾', title: 'THE FIELDS',            desc: 'Thirteen hexagonal fields lay before you.\nEach one conceals a hidden resource.' },
  resource: { icon: '🧱', title: 'HIDDEN RESOURCES',       desc: 'Six types of cursed resources are buried\nacross the board. You must find them all.' },
  drag:     { icon: '☝️', title: 'DRAG TO PLACE',          desc: 'Grab a resource tile from the right palette.\nDrop it onto any hex on the board.', tutorial: 'drag' },
  logs:     { icon: '📜', title: 'READ THE GAME LOGS',     desc: 'Every dice roll and harvested resource is\nrecorded here. Scroll down to read.', tutorial: 'scroll' },
  hint:     { icon: '💡', title: 'USE HINTS',              desc: 'Click "Reveal Random Tile" to uncover a hex.\nOr right-click any hex to check it.', tutorial: 'hint' },
  memory:   { icon: '🧠', title: 'RELY ON MEMORY',         desc: 'The pattern cannot be seen directly.\nOnly remembered.' },
  recall:   { icon: '🔄', title: 'NOW — RECALL',           desc: 'Once all thirteen are gathered,\nyou must reconstruct the exact order.' },
  mistake:  { icon: '⚠️', title: 'ONE MISTAKE',            desc: '…and the sequence collapses.\nThe domain resets.' },
  reset:    { icon: '↩',  title: 'BEGIN AGAIN',            desc: 'The mind is forced to start over.\nRepetition is the price of failure.' },
  ritual:   { icon: '✨', title: 'COMPLETE THE RITUAL',    desc: 'Thirteen fields. Perfect order.\nNot a single deviation.' },
  gate:     { icon: '🚪', title: 'THE GATE OPENS',         desc: 'Success breaks the seal.\nThe path forward is yours.' },
  chaos:    { icon: '🌪️', title: 'MEMORY OVERCOMES CHAOS', desc: 'Failure repeats…\nuntil you transcend it.' },
};

// Hex positions matching CSS layout (3-4-5-4-3 pattern)
const HEX_POSITIONS = [
  { left: 240, top: 20 },   // 0
  { left: 375, top: 20 },   // 1
  { left: 510, top: 20 },   // 2
  { left: 172, top: 136 },  // 3
  { left: 307, top: 136 },  // 4
  { left: 442, top: 136 },  // 5
  { left: 577, top: 136 },  // 6
  { left: 105, top: 252 },  // 7
  { left: 240, top: 252 },  // 8
  { left: 375, top: 252 },  // 9
  { left: 510, top: 252 },  // 10
  { left: 645, top: 252 },  // 11
  { left: 172, top: 368 },  // 12
  { left: 307, top: 368 },  // 13
  { left: 442, top: 368 },  // 14
  { left: 577, top: 368 },  // 15
  { left: 240, top: 484 },  // 16
  { left: 375, top: 484 },  // 17
  { left: 510, top: 484 },  // 18
];
const HEX_W = 135;
const HEX_H = 155;

// Build vertex map: compute all unique vertices of the hex grid
// In Catan, settlements sit at vertices (intersections of 2-3 hexes)
function buildVertexMap() {
  const VERTEX_OFFSETS = [
    { dx: HEX_W / 2, dy: 0 },           // 0 = top
    { dx: HEX_W, dy: HEX_H * 0.25 },    // 1 = topRight
    { dx: HEX_W, dy: HEX_H * 0.75 },    // 2 = bottomRight
    { dx: HEX_W / 2, dy: HEX_H },        // 3 = bottom
    { dx: 0, dy: HEX_H * 0.75 },         // 4 = bottomLeft
    { dx: 0, dy: HEX_H * 0.25 },         // 5 = topLeft
  ];

  const rawVertices = [];
  for (let h = 0; h < 19; h++) {
    for (let v = 0; v < 6; v++) {
      rawVertices.push({
        x: HEX_POSITIONS[h].left + VERTEX_OFFSETS[v].dx,
        y: HEX_POSITIONS[h].top + VERTEX_OFFSETS[v].dy,
        hexId: h,
        vertexIndex: v,
      });
    }
  }

  // Deduplicate vertices within 3px tolerance (shared between hexes)
  const TOLERANCE = 3;
  const vertices = [];
  const hexVertexToGlobal = {};

  for (const rv of rawVertices) {
    let foundIdx = -1;
    for (let i = 0; i < vertices.length; i++) {
      if (Math.abs(vertices[i].x - rv.x) < TOLERANCE && Math.abs(vertices[i].y - rv.y) < TOLERANCE) {
        foundIdx = i;
        break;
      }
    }
    if (foundIdx >= 0) {
      if (!vertices[foundIdx].adjacentHexes.includes(rv.hexId)) {
        vertices[foundIdx].adjacentHexes.push(rv.hexId);
      }
      hexVertexToGlobal[`${rv.hexId}-${rv.vertexIndex}`] = foundIdx;
    } else {
      const id = vertices.length;
      vertices.push({
        id,
        x: rv.x,
        y: rv.y,
        adjacentHexes: [rv.hexId],
        neighbors: [],
      });
      hexVertexToGlobal[`${rv.hexId}-${rv.vertexIndex}`] = id;
    }
  }

  // Build edge adjacency between vertices (needed for distance rule)
  for (let h = 0; h < 19; h++) {
    for (let v = 0; v < 6; v++) {
      const v1 = hexVertexToGlobal[`${h}-${v}`];
      const v2 = hexVertexToGlobal[`${h}-${(v + 1) % 6}`];
      if (v1 !== undefined && v2 !== undefined && v1 !== v2) {
        if (!vertices[v1].neighbors.includes(v2)) vertices[v1].neighbors.push(v2);
        if (!vertices[v2].neighbors.includes(v1)) vertices[v2].neighbors.push(v1);
      }
    }
  }

  return vertices;
}

const VERTEX_MAP = buildVertexMap();

// Catan Board Generator
class CatanBoardGenerator {
  constructor() {
    this.resources = [
      { type: 'wood', image: new URL('../assets/catan/wood.png', import.meta.url).href, name: 'Wood' },
      { type: 'brick', image: new URL('../assets/catan/brick.png', import.meta.url).href, name: 'Brick' },
      { type: 'sheep', image: new URL('../assets/catan/sheep.png', import.meta.url).href, name: 'Sheep' },
      { type: 'wheat', image: new URL('../assets/catan/wheat.png', import.meta.url).href, name: 'Wheat' },
      { type: 'ore', image: new URL('../assets/catan/ore.png', import.meta.url).href, name: 'Ore' },
      { type: 'desert', image: new URL('../assets/catan/desert.png', import.meta.url).href, name: 'Desert' },
    ];

    // Standard Catan number distribution (no 7)
    this.numberTokens = [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12];

    // Player settlement images (colors: purple, blue, red, green)
    this.playerSettlements = [
      new URL('../assets/catan/white.png', import.meta.url).href,   // Player 1
      new URL('../assets/catan/blue.png', import.meta.url).href,    // Player 2
      new URL('../assets/catan/red.png', import.meta.url).href,     // Player 3
      new URL('../assets/catan/green.png', import.meta.url).href,   // Player 4
    ];

    this.board = this.generateBoard();
    this.settlements = this.placeSettlements();
    this.gameLog = this.simulateGame();
  }

  generateBoard() {
    // Standard Catan resource distribution: 4 wood, 4 wheat, 4 sheep, 3 brick, 3 ore, 1 desert
    const resourceDist = [
      'wood', 'wood', 'wood', 'wood',
      'wheat', 'wheat', 'wheat', 'wheat',
      'sheep', 'sheep', 'sheep', 'sheep',
      'brick', 'brick', 'brick',
      'ore', 'ore', 'ore',
      'desert'
    ];

    // Shuffle resources
    const shuffledResources = [...resourceDist].sort(() => Math.random() - 0.5);

    // Shuffle numbers
    const shuffledNumbers = [...this.numberTokens].sort(() => Math.random() - 0.5);

    const hexes = [];
    let numberIndex = 0;

    for (let i = 0; i < 19; i++) {
      const resourceType = shuffledResources[i];
      const resource = this.resources.find(r => r.type === resourceType);

      // Desert has no number
      const number = resourceType === 'desert' ? null : shuffledNumbers[numberIndex++];

      hexes.push({
        id: i,
        resource: resource,
        number: number,
      });
    }

    return hexes;
  }

  placeSettlements() {
    // In Catan, settlements are placed at VERTICES (intersections of 2-3 hexes)
    // Distance rule: no two settlements can be on adjacent vertices
    const usedVertices = new Set();
    const blockedVertices = new Set(); // Adjacent vertices blocked by distance rule
    const settlements = [];
    const playerColors = ['#ffffff', '#3498db', '#e74c3c', '#2ecc71'];

    for (let player = 0; player < 4; player++) {
      const playerPlacements = [];

      for (let s = 0; s < 2; s++) {
        // Valid vertices: not used, not blocked, touching at least 2 hexes (proper intersections)
        const validVertices = VERTEX_MAP.filter(v =>
          !usedVertices.has(v.id) &&
          !blockedVertices.has(v.id) &&
          v.adjacentHexes.length >= 2
        );

        if (validVertices.length === 0) break;

        const vertex = validVertices[Math.floor(Math.random() * validVertices.length)];
        usedVertices.add(vertex.id);

        // Distance rule: block all adjacent vertices
        vertex.neighbors.forEach(n => blockedVertices.add(n));

        playerPlacements.push({
          vertexId: vertex.id,
          x: vertex.x,
          y: vertex.y,
          adjacentHexes: vertex.adjacentHexes,
        });
      }

      settlements.push({
        player: player + 1,
        name: `Player ${player + 1}`,
        color: playerColors[player],
        placements: playerPlacements,
      });
    }

    return settlements;
  }

  simulateGame() {
    const turns = [];
    const numTurns = 30; // 30 turns of data (increased for better solvability)
    let robberHex = 18; // Desert starts with robber

    for (let t = 0; t < numTurns; t++) {
      const dice1 = Math.floor(Math.random() * 6) + 1;
      const dice2 = Math.floor(Math.random() * 6) + 1;
      const sum = dice1 + dice2;

      // Handle 7 - robber roll
      if (sum === 7) {
        // Move robber to random non-desert hex
        const nonDesertHexes = this.board
          .map((h, idx) => h.resource.type !== 'desert' ? idx : null)
          .filter(idx => idx !== null);
        const oldRobber = robberHex;
        robberHex = nonDesertHexes[Math.floor(Math.random() * nonDesertHexes.length)];

        turns.push({
          turn: t + 1,
          dice1,
          dice2,
          sum,
          isRobberTurn: true,
          robberFrom: oldRobber + 1,
          robberTo: robberHex + 1,
          production: [],
        });
        continue;
      }

      // Find hexes with this number
      const producingHexes = this.board.filter(h => h.number === sum);

      // Calculate production for each player
      // Each settlement produces from ALL adjacent hexes (vertex-based)
      const production = [];

      this.settlements.forEach(settlement => {
        const resources = {};

        settlement.placements.forEach(placement => {
          placement.adjacentHexes.forEach(hexId => {
            const hex = this.board[hexId];
            // Production blocked if robber is on this hex
            if (hex.number === sum && hex.resource.type !== 'desert' && hexId !== robberHex) {
              resources[hex.resource.type] = (resources[hex.resource.type] || 0) + 1;
            }
          });
        });

        // Add to production log
        Object.entries(resources).forEach(([resourceType, amount]) => {
          production.push({
            player: settlement.name,
            color: settlement.color,
            resource: resourceType,
            amount: amount,
          });
        });
      });

      turns.push({
        turn: t + 1,
        dice1,
        dice2,
        sum,
        isRobberTurn: false,
        production,
        robberBlocks: robberHex,
      });
    }

    return turns;
  }
}

// Standard Catan tile distribution limits
const RESOURCE_LIMITS = {
  wood: 4,
  wheat: 4,
  sheep: 4,
  brick: 3,
  ore: 3,
  desert: 1,
};

const NUMBER_LIMITS = {
  2: 1, 3: 2, 4: 2, 5: 2, 6: 2,
  8: 2, 9: 2, 10: 2, 11: 2, 12: 1,
};

function LastHarvestPuzzle() {
  const [generator] = useState(() => new CatanBoardGenerator());
  const [playerBoard, setPlayerBoard] = useState(Array(19).fill(null).map(() => ({ resource: null, number: null })));
  const [draggedItem, setDraggedItem] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [hintsRemaining, setHintsRemaining] = useState(5); // 5 hints available
  const [revealedHexes, setRevealedHexes] = useState(new Set()); // Track revealed hexes
  const [checkingHex, setCheckingHex] = useState(null); // Currently checking hex
  const [hexFeedback, setHexFeedback] = useState({}); // Feedback for individual hexes
  const feedbackTimeoutRef = useRef(null);
  const v2Ref           = useRef(null);
  const deliriousRef    = useRef(null);
  const catanRef        = useRef(null);
  const narratorTimers  = useRef([]);
  const [showIntro, setShowIntro]         = useState(true);
  const [narratorPhase, setNarratorPhase] = useState(null);
  const [showMusicControls, setShowMusicControls] = useState(false);
  const [musicVolume, setMusicVolume] = useState(() => {
    const saved = localStorage.getItem('gate_music_volume');
    return saved !== null ? parseFloat(saved) : 0.2;
  });

  // Apply volume multiplier to all audio refs when musicVolume changes
  useEffect(() => {
    const multiplier = musicVolume / 0.2; // normalize: 0.2 is the default "100%"
    if (v2Ref.current) v2Ref.current.volume = Math.min(1, 0.6 * multiplier);
    if (deliriousRef.current) deliriousRef.current.volume = Math.min(1, 0.08 * multiplier);
    if (catanRef.current) catanRef.current.volume = Math.min(1, 0.2 * multiplier);
  }, [musicVolume]);

  // Set up audio objects on mount (do not play yet)
  useEffect(() => {
    const multiplier = musicVolume / 0.2;
    const v2       = new Audio(AUDIO_V2);
    const delirious = new Audio(AUDIO_DELIRIOUS);
    const catan    = new Audio(AUDIO_CATAN);
    v2.volume        = Math.min(1, 0.6 * multiplier);
    delirious.volume = Math.min(1, 0.08 * multiplier);
    delirious.loop   = true;
    catan.volume     = Math.min(1, 0.2 * multiplier);
    catan.loop       = true;
    v2Ref.current        = v2;
    deliriousRef.current = delirious;
    catanRef.current     = catan;
    return () => {
      v2.pause();
      delirious.pause();
      catan.pause();
      narratorTimers.current.forEach(clearTimeout);
    };
  }, []);

  const handleIntroConfirm = () => {
    setShowIntro(false);
    const v2       = v2Ref.current;
    const delirious = deliriousRef.current;
    const catan    = catanRef.current;
    if (!v2) return;
    // Delirious starts immediately, v2 starts after 6 seconds
    delirious.play().catch(() => {});
    const v2Start = setTimeout(() => {
      v2.play().catch(() => {});
      v2.addEventListener('ended', () => {
        delirious.pause();
        narratorTimers.current.forEach(clearTimeout);
        setNarratorPhase(null);
        catan.play().catch(() => {});
      }, { once: true });
      // Schedule narrator phases relative to v2 start
      const phaseTimers = NARRATOR_TIMELINE.map(({ time, phase }) =>
        setTimeout(() => setNarratorPhase(phase), time)
      );
      narratorTimers.current.push(...phaseTimers);
    }, 7400);
    narratorTimers.current = [v2Start];
  };

  // Count how many of each resource/number have been placed
  const placedResources = {};
  const placedNumbers = {};
  playerBoard.forEach(hex => {
    if (hex.resource) {
      placedResources[hex.resource.type] = (placedResources[hex.resource.type] || 0) + 1;
    }
    if (hex.number) {
      placedNumbers[hex.number] = (placedNumbers[hex.number] || 0) + 1;
    }
  });

  const getRemainingResource = (type) => (RESOURCE_LIMITS[type] || 0) - (placedResources[type] || 0);
  const getRemainingNumber = (num) => (NUMBER_LIMITS[num] || 0) - (placedNumbers[num] || 0);

  const showInfoFeedback = (message) => {
    setFeedback({ type: 'info', message });

    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }

    feedbackTimeoutRef.current = setTimeout(() => {
      setFeedback(null);
      feedbackTimeoutRef.current = null;
    }, 5000);
  };

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, []);

  const handleDragStart = (item, type) => {
    // Block drag if limit reached
    if (type === 'resource' && getRemainingResource(item.type) <= 0) return;
    if (type === 'number' && getRemainingNumber(item) <= 0) return;
    setDraggedItem({ item, type });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (hexId) => {
    if (!draggedItem) return;

    // Don't allow dropping on revealed hexes
    if (revealedHexes.has(hexId)) {
      showInfoFeedback('🔒 This tile is locked! It was revealed by a hint and cannot be modified.');
      setDraggedItem(null);
      return;
    }

    const newBoard = [...playerBoard];

    if (draggedItem.type === 'resource') {
      // If replacing an existing resource, that frees up 1 of the old type
      // Check limit for new type considering the swap
      const oldType = newBoard[hexId].resource?.type;
      const effectivePlaced = oldType === draggedItem.item.type
        ? (placedResources[draggedItem.item.type] || 0)
        : (placedResources[draggedItem.item.type] || 0) + (oldType ? 0 : 0);

      if (getRemainingResource(draggedItem.item.type) <= 0 && oldType !== draggedItem.item.type) {
        setDraggedItem(null);
        return;
      }
      // If replacing with same resource on a tile that already has a number, also clear number if switching to desert
      if (draggedItem.item.type === 'desert') {
        newBoard[hexId] = { resource: draggedItem.item, number: null };
      } else {
        newBoard[hexId] = { ...newBoard[hexId], resource: draggedItem.item };
      }
    } else if (draggedItem.type === 'number') {
      // Only allow numbers on non-desert tiles
      if (newBoard[hexId].resource?.type === 'desert') {
        setDraggedItem(null);
        return;
      }
      // Check limit considering swap
      const oldNum = newBoard[hexId].number;
      if (getRemainingNumber(draggedItem.item) <= 0 && oldNum !== draggedItem.item) {
        setDraggedItem(null);
        return;
      }
      newBoard[hexId] = { ...newBoard[hexId], number: draggedItem.item };
    }

    setPlayerBoard(newBoard);
    setDraggedItem(null);
  };

  const handleClearHex = (hexId) => {
    // Don't clear revealed hexes
    if (revealedHexes.has(hexId)) {
      showInfoFeedback('🔒 This tile is locked! It was revealed by a hint and cannot be modified.');
      return;
    }

    const newBoard = [...playerBoard];
    newBoard[hexId] = { resource: null, number: null };
    setPlayerBoard(newBoard);
  };

  const handleSubmit = () => {
    let correctResources = 0;
    let correctNumbers = 0;
    let totalResources = 19;
    let totalNumbers = 18; // Desert doesn't have a number

    playerBoard.forEach((playerHex, idx) => {
      const actualHex = generator.board[idx];

      if (playerHex.resource?.type === actualHex.resource.type) {
        correctResources++;
      }

      if (actualHex.resource.type !== 'desert') {
        if (playerHex.number === actualHex.number) {
          correctNumbers++;
        }
      }
    });

    const resourcePercent = Math.floor((correctResources / totalResources) * 100);
    const numberPercent = Math.floor((correctNumbers / totalNumbers) * 100);
    const totalPercent = Math.floor(((correctResources + correctNumbers) / (totalResources + totalNumbers)) * 100);

    if (totalPercent === 100) {
      setFeedback({
        type: 'success',
        message: '🎉 PERFECT! You reconstructed the hidden board!'
      });
      setSubmitted(true);
    } else {
      setFeedback({
        type: 'error',
        message: `Resources: ${resourcePercent}% | Numbers: ${numberPercent}% | Total: ${totalPercent}%`
      });
    }
  };

  const handleReset = () => {
    setPlayerBoard(Array(19).fill(null).map(() => ({ resource: null, number: null })));
    setFeedback(null);
    setHintsRemaining(5);
    setRevealedHexes(new Set());
    setHexFeedback({});
  };

  const handleRevealRandomTile = () => {
    if (hintsRemaining <= 0) return;

    // Find unrevealed hexes
    const unrevealedHexes = generator.board
      .map((hex, idx) => idx)
      .filter(idx => !revealedHexes.has(idx));

    if (unrevealedHexes.length === 0) {
      showInfoFeedback('All tiles already revealed!');
      return;
    }

    // Pick random unrevealed hex
    const randomIdx = unrevealedHexes[Math.floor(Math.random() * unrevealedHexes.length)];
    const actualHex = generator.board[randomIdx];

    // Reveal it on player board
    const newBoard = [...playerBoard];
    newBoard[randomIdx] = {
      resource: actualHex.resource,
      number: actualHex.number,
    };

    setPlayerBoard(newBoard);
    setRevealedHexes(new Set([...revealedHexes, randomIdx]));
    setHintsRemaining(hintsRemaining - 1);
    showInfoFeedback(`Revealed Hex ${randomIdx + 1}! ${hintsRemaining - 1} hints remaining.`);
  };

  const handleCheckHex = (hexId) => {
    if (hintsRemaining <= 0) return;

    const playerHex = playerBoard[hexId];
    const actualHex = generator.board[hexId];

    // Check if resource and number match
    const resourceMatch = playerHex.resource?.type === actualHex.resource.type;
    const numberMatch = actualHex.resource.type === 'desert' ? true : playerHex.number === actualHex.number;
    const isCorrect = resourceMatch && numberMatch;

    // Determine detailed message
    let message = '';
    let feedbackClass = '';

    if (resourceMatch && numberMatch) {
      message = '✓ Correct!';
      feedbackClass = 'correct';
    } else if (resourceMatch && !numberMatch) {
      message = '✓ Resource Correct\n✗ Number Wrong';
      feedbackClass = 'partial';
    } else if (!resourceMatch && numberMatch) {
      message = '✓ Number Correct\n✗ Resource Wrong';
      feedbackClass = 'partial';
    } else {
      message = '✗ Both Wrong';
      feedbackClass = 'incorrect';
    }

    setHexFeedback({
      ...hexFeedback,
      [hexId]: {
        isCorrect,
        message,
        feedbackClass,
        timestamp: Date.now(),
      }
    });

    setHintsRemaining(hintsRemaining - 1);

    // Clear feedback after 3 seconds (longer for detailed messages)
    setTimeout(() => {
      setHexFeedback(prev => {
        const newFeedback = { ...prev };
        delete newFeedback[hexId];
        return newFeedback;
      });
    }, 3000);
  };

  const highlightBoard   = ['fields','memory','recall','ritual','gate'].includes(narratorPhase);
  const highlightPalette = ['resource','drag','recall'].includes(narratorPhase);
  const highlightLogs    = ['logs','recall'].includes(narratorPhase);
  const highlightHint    = narratorPhase === 'hint';
  const highlightDanger  = ['mistake','reset','chaos'].includes(narratorPhase);
  const callout          = narratorPhase ? PHASE_CALLOUT[narratorPhase] : null;

  return (
    <div className="catan-puzzle-container">

      {/* Music Volume Control */}
      <div className="gate-music-toggle">
        <button
          className="gate-music-btn"
          onClick={() => setShowMusicControls(!showMusicControls)}
          title="Music Controls"
        >
          🎵
        </button>
      </div>
      {showMusicControls && (
        <div className="gate-music-panel">
          <button className="gate-music-close" onClick={() => setShowMusicControls(false)}>
            ✕
          </button>
          <div className="gate-music-controls">
            <div className="gate-music-volume">
              <span className="gate-music-vol-label">VOL</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={musicVolume}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setMusicVolume(v);
                  localStorage.setItem('gate_music_volume', v.toString());
                }}
                className="gate-music-slider"
              />
              <span className="gate-music-vol-value">{Math.round(musicVolume * 100)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* JJK Intro Dialog */}
      {showIntro && (() => {
        const S = 0.72; // board scale factor
        const HEX_W_S = 135 * S;
        const HEX_H_S = 155 * S;
        const ORIGIN_L = 105;
        const ORIGIN_T = 20;
        const boardW = (645 - ORIGIN_L + 135) * S; // ~591px
        const boardH = (484 - ORIGIN_T + 155) * S; // ~474px
        return (
          <div style={{
            position:'fixed', inset:0, zIndex:9999,
            display:'flex', alignItems:'center', justifyContent:'center',
            overflow:'hidden',
          }}>
            <style>{`
              @keyframes jjkFadeIn{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
              @keyframes jjkPulse{0%,100%{box-shadow:0 0 30px #6a0dad,0 0 60px #3a007a}50%{box-shadow:0 0 60px #9b30ff,0 0 120px #5500bb}}
              @keyframes hexFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
            `}</style>

            {/* Catan board as background */}
            <div style={{
              position:'absolute', inset:0,
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <div style={{
                position:'relative', width: boardW, height: boardH,
                filter:'blur(2px) brightness(0.55) saturate(1.3)',
              }}>
                {generator.board.map((hex, idx) => {
                  const pos = HEX_POSITIONS[idx];
                  return (
                    <div key={idx} style={{
                      position:'absolute',
                      left: (pos.left - ORIGIN_L) * S,
                      top:  (pos.top  - ORIGIN_T) * S,
                      width: HEX_W_S, height: HEX_H_S,
                      clipPath:'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)',
                      overflow:'hidden',
                    }}>
                      {hex.resource && (
                        <img
                          src={hex.resource.image}
                          alt=""
                          style={{ width:'100%', height:'100%', objectFit:'cover' }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Dark gradient overlay over board */}
              <div style={{
                position:'absolute', inset:0,
                background:'radial-gradient(ellipse at center, rgba(5,0,20,0.55) 0%, rgba(0,0,10,0.85) 100%)',
              }} />
            </div>

            {/* Dialog card */}
            <div style={{
              position:'relative', zIndex:2,
              maxWidth:'420px', width:'90%', padding:'52px 40px',
              background:'rgba(6,0,22,0.78)',
              border:'1px solid rgba(106,13,173,0.8)',
              borderRadius:'6px',
              backdropFilter:'blur(16px)',
              textAlign:'center',
              animation:'jjkFadeIn .7s cubic-bezier(.22,1,.36,1), jjkPulse 3s ease-in-out infinite',
            }}>
              <p style={{
                color:'#d4b8f0', fontSize:'20px', lineHeight:1.7,
                marginBottom:'40px', letterSpacing:'1px', fontWeight:600,
              }}>
                EXPLAIN IN JJK TERMINOLOGY
              </p>
              <button
                onClick={handleIntroConfirm}
                style={{
                  padding:'14px 56px', background:'rgba(106,13,173,0.9)',
                  color:'white', border:'1px solid #9b30ff',
                  borderRadius:'3px', fontSize:'17px', fontWeight:'bold',
                  letterSpacing:'4px', cursor:'pointer',
                  transition:'all .2s',
                }}
                onMouseEnter={e => { e.target.style.background='#9b30ff'; e.target.style.boxShadow='0 0 20px #9b30ff'; }}
                onMouseLeave={e => { e.target.style.background='rgba(106,13,173,0.9)'; e.target.style.boxShadow='none'; }}
              >
                YES
              </button>
            </div>
          </div>
        );
      })()}

      {/* Global glow + cinematic styles */}
      <style>{`
        @keyframes boardGlow  {0%,100%{box-shadow:0 0 0 0 transparent}50%{box-shadow:0 0 55px 18px rgba(80,220,100,0.45)}}
        @keyframes paletteGlow{0%,100%{box-shadow:0 0 0 0 transparent}50%{box-shadow:0 0 55px 18px rgba(80,160,255,0.50)}}
        @keyframes logsGlow   {0%,100%{box-shadow:0 0 0 0 transparent}50%{box-shadow:0 0 55px 18px rgba(255,210,80,0.50)}}
        @keyframes dangerGlow {0%,100%{box-shadow:0 0 0 0 transparent}50%{box-shadow:0 0 65px 22px rgba(255,40,40,0.60)}}
        @keyframes ritualGlow {0%,100%{box-shadow:0 0 0 0 transparent}50%{box-shadow:0 0 65px 22px rgba(220,170,0,0.65)}}
        @keyframes hintGlow   {0%,100%{box-shadow:0 0 0 0 transparent}50%{box-shadow:0 0 40px 14px rgba(255,230,80,0.7)}}
        @keyframes calloutIn  {from{opacity:0;transform:translate(-50%,-50%) scale(.9)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}
        @keyframes dragCursor {0%{transform:translate(180px,0) scale(1)}60%{transform:translate(0,0) scale(1)}80%{transform:translate(0,0) scale(.9)}100%{transform:translate(180px,0) scale(1)}}
        @keyframes scrollArrow{0%,100%{transform:translateY(0);opacity:.4}50%{transform:translateY(8px);opacity:1}}
        @keyframes hintPulse  {0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
        .narrator-board-glow   { animation: boardGlow   1.4s ease-in-out infinite !important; }
        .narrator-palette-glow { animation: paletteGlow 1.4s ease-in-out infinite !important; }
        .narrator-logs-glow    { animation: logsGlow    1.4s ease-in-out infinite !important; }
        .narrator-danger-glow  { animation: dangerGlow  .8s  ease-in-out infinite !important; }
        .narrator-ritual-glow  { animation: ritualGlow  1.6s ease-in-out infinite !important; }
        .narrator-hint-glow    { animation: hintGlow    .9s  ease-in-out infinite !important; }
      `}</style>

      {/* Cinematic callout — centered over the board */}
      {callout && (
        <div key={narratorPhase} style={{
          position:'fixed', top:'50%', left:'50%', zIndex:1000,
          transform:'translate(-50%,-50%)',
          width:'800px', maxWidth:'60vw',
          padding:'28px 32px 26px',
          background: highlightDanger
            ? 'rgba(40,0,0,0.88)'
            : (narratorPhase==='ritual'||narratorPhase==='gate')
            ? 'rgba(30,22,0,0.88)'
            : 'rgba(6,0,22,0.88)',
          border: `1px solid ${highlightDanger ? '#ff3333' : (narratorPhase==='ritual'||narratorPhase==='gate') ? '#d4a800' : '#6a0dad'}`,
          borderRadius:'6px',
          backdropFilter:'blur(10px)',
          textAlign:'center',
          pointerEvents:'none',
          animation:'calloutIn .45s cubic-bezier(.22,1,.36,1)',
        }}>
          <div style={{ fontSize:'44px', marginBottom:'10px', lineHeight:1 }}>{callout.icon}</div>
          <div style={{
            fontSize:'18px', fontWeight:'900', letterSpacing:'2px', marginBottom:'10px',
            color: highlightDanger ? '#ff6666'
              : (narratorPhase==='ritual'||narratorPhase==='gate') ? '#ffd966'
              : '#e8d4ff',
          }}>{callout.title}</div>
          <div style={{ fontSize:'13px', lineHeight:1.8, color:'#a888c8', whiteSpace:'pre-line' }}>
            {callout.desc}
          </div>

          {callout.tutorial === 'drag' && (
            <div style={{ marginTop:'14px', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px' }}>
              <div style={{ fontSize:'26px', animation:'dragCursor 2s ease-in-out infinite' }}>🧱</div>
              <div style={{ color:'#c4a8e0', fontSize:'16px' }}>→ drop →</div>
              <div style={{ fontSize:'26px', opacity:.5 }}>⬡</div>
            </div>
          )}
          {callout.tutorial === 'scroll' && (
            <div style={{ marginTop:'12px', display:'flex', justifyContent:'center', gap:'6px' }}>
              {['▼','▼','▼'].map((a,i)=>(
                <div key={i} style={{ fontSize:'18px', color:'#ffd966', animation:`scrollArrow 1s ease-in-out ${i*0.2}s infinite` }}>{a}</div>
              ))}
            </div>
          )}
          {callout.tutorial === 'hint' && (
            <div style={{ marginTop:'12px', fontSize:'28px', animation:'hintPulse 1s ease-in-out infinite' }}>
              💡→🎁
            </div>
          )}
        </div>
      )}

      {/* Nebula Background */}
      <div className="nebula-bg"></div>
      <div className="fog-layer"></div>

      <div className="puzzle-header">
        <h1 className="puzzle-title glitch" data-text="THE LAST HARVEST">THE LAST HARVEST</h1>
        <p className="puzzle-subtitle">Deduce the hidden Catan board from settlements and game logs...</p>
      </div>

      <div className="puzzle-layout">
        {/* Left: Game Logs */}
        <div className={`logs-panel ${highlightLogs ? 'narrator-logs-glow' : ''}`}>
          <h3 className="panel-title">📜 GAME LOGS</h3>
          <div className="logs-content">
            {generator.gameLog.map((turn) => (
              <div key={turn.turn} className={`turn-log ${turn.isRobberTurn ? 'robber-turn' : ''}`}>
                <div className="dice-roll-log">
                  <span className="turn-num">Turn {turn.turn}:</span>
                  <span className="dice-display">
                    <span className="die">{turn.dice1}</span>
                    <span className="plus">+</span>
                    <span className="die">{turn.dice2}</span>
                    <span className="equals">=</span>
                    <span className="sum">{turn.sum}</span>
                  </span>
                </div>

                {turn.isRobberTurn ? (
                  <div className="robber-log">
                    <div className="robber-icon">🛡️</div>
                    <div className="robber-text">
                      Robber moved from Hex {turn.robberFrom} → Hex {turn.robberTo}
                    </div>
                  </div>
                ) : turn.production.length > 0 ? (
                  <div className="production-log">
                    <div className="prod-label">Dice {turn.sum}:</div>
                    {turn.production.map((prod, i) => (
                      <div key={i} className="production-item">
                        <span className="player-name" style={{ color: prod.color }}>{prod.player}</span>
                        <span className="got-text">got</span>
                        <span className="resource-amount">{prod.amount}x</span>
                        <span className="resource-name">{prod.resource}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="production-log">
                    <div className="no-production">No production this turn</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Center: Catan Board */}
        <div className={`board-section ${highlightBoard ? 'narrator-board-glow' : ''} ${highlightDanger ? 'narrator-danger-glow' : ''} ${narratorPhase === 'ritual' || narratorPhase === 'gate' ? 'narrator-ritual-glow' : ''}`}>
          <h3 className="panel-title">🗺️ RECONSTRUCT THE BOARD</h3>
          <p className="board-hint">Settlements are shown. Drag tiles and numbers from the palette.</p>

          {/* Hint System */}
          <div className={`hint-system ${highlightHint ? 'narrator-hint-glow' : ''}`}>
            <div className="hint-counter">💡 Hints: {hintsRemaining}/5</div>
            <button
              className="hint-btn reveal-btn"
              onClick={handleRevealRandomTile}
              disabled={hintsRemaining <= 0}
            >
              🎁 Reveal Random Tile
            </button>
            <div className="hint-instructions">Right-click a hex to check if it's correct (costs 1 hint)</div>
          </div>

          <div className="catan-board-hexagon">
            {generator.board.map((hex, idx) => {
              const playerHex = playerBoard[idx];
              const isRevealed = revealedHexes.has(idx);
              const hexCheck = hexFeedback[idx];

              return (
                <div
                  key={idx}
                  className={`catan-hex hex-${idx} ${isRevealed ? 'revealed' : ''} ${hexCheck ? `${hexCheck.feedbackClass}-check` : ''}`}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(idx)}
                  onClick={() => handleClearHex(idx)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (hintsRemaining > 0 && !isRevealed) {
                      handleCheckHex(idx);
                    }
                  }}
                  title={isRevealed ? `Hex ${idx + 1} - 🔒 Locked (revealed by hint)` : `Hex ${idx + 1} - Left-click to clear, Right-click to check`}
                  style={{ cursor: isRevealed ? 'not-allowed' : 'pointer' }}
                >
                  <div className="hex-inner">
                    {/* Resource tile background */}
                    {playerHex.resource && (
                      <img
                        src={playerHex.resource.image}
                        alt={playerHex.resource.name}
                        className="hex-resource-img"
                      />
                    )}

                    {/* Robber marker (visual hint) */}
                    {generator.gameLog[generator.gameLog.length - 1]?.robberBlocks === idx && (
                      <img
                        src={new URL('../assets/catan/robbery.png', import.meta.url).href}
                        alt="Robber"
                        className="robber-marker"
                      />
                    )}

                    {/* Number token */}
                    {playerHex.number && (
                      <div className="hex-number-token">{playerHex.number}</div>
                    )}

                    {/* Hex ID for reference */}
                    {!playerHex.resource && !playerHex.number && (
                      <div className="hex-id">{idx + 1}</div>
                    )}

                    {/* Revealed indicator */}
                    {isRevealed && (
                      <div className="revealed-badge">
                        <span className="gift-icon">🎁</span>
                        <span className="lock-icon">🔒</span>
                      </div>
                    )}

                    {/* Check feedback */}
                    {hexCheck && (
                      <div className={`hex-check-feedback ${hexCheck.feedbackClass}`}>
                        {hexCheck.message}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Settlements at vertices — color-specific images by player */}
            {generator.settlements.flatMap((settlement) =>
              settlement.placements.map((placement, pIdx) => (
                <div
                  key={`s-${settlement.player}-${pIdx}`}
                  className="settlement-vertex-marker"
                  style={{
                    left: `${placement.x - 27.5}px`,
                    top: `${placement.y - 27.5}px`,
                  }}
                >
                  <img
                    src={generator.playerSettlements[settlement.player - 1]}
                    alt={`${settlement.name} Settlement`}
                    className="settlement-img"
                  />
                </div>
              ))
            )}
          </div>

          {feedback && (
            <div className={`feedback ${feedback.type} ${feedback.type === 'info' ? 'floating' : ''}`}>{feedback.message}</div>
          )}

          <div className="board-actions">
            <button className="reset-btn" onClick={handleReset}>RESET BOARD</button>
            <button className="submit-btn" onClick={handleSubmit} disabled={submitted}>
              SUBMIT RECONSTRUCTION
            </button>
          </div>
        </div>

        {/* Right: Tile Palette */}
        <div className={`palette-panel ${highlightPalette ? 'narrator-palette-glow' : ''}`}>
          <h3 className="panel-title">🎨 RESOURCE TILES</h3>
          <div className="resource-palette">
            {generator.resources.map((res, idx) => {
              const remaining = getRemainingResource(res.type);
              const exhausted = remaining <= 0;
              return (
                <div
                  key={idx}
                  className={`palette-item ${exhausted ? 'exhausted' : ''}`}
                  draggable={!exhausted}
                  onDragStart={() => handleDragStart(res, 'resource')}
                >
                  <img src={res.image} alt={res.name} className="palette-img" />
                  <span className="palette-name">{res.name}</span>
                  <span className={`palette-count ${exhausted ? 'count-zero' : ''}`}>
                    {remaining}/{RESOURCE_LIMITS[res.type]}
                  </span>
                </div>
              );
            })}
          </div>

          <h3 className="panel-title">🎲 NUMBER TOKENS</h3>
          <div className="number-palette">
            {[2, 3, 4, 5, 6, 8, 9, 10, 11, 12].map((num) => {
              const remaining = getRemainingNumber(num);
              const exhausted = remaining <= 0;
              return (
                <div
                  key={num}
                  className={`palette-number ${exhausted ? 'exhausted' : ''}`}
                  draggable={!exhausted}
                  onDragStart={() => handleDragStart(num, 'number')}
                >
                  <span>{num}</span>
                  <span className={`number-count ${exhausted ? 'count-zero' : ''}`}>
                    {remaining}/{NUMBER_LIMITS[num]}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="palette-hint">
            💡 Drag tiles and numbers onto hexes.<br/>
            Click a hex to clear it.
          </div>
        </div>
      </div>
    </div>
  );
}

export default LastHarvestPuzzle;
