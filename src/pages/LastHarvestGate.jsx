import { useState, useEffect } from 'react';
import GateMusic from '../components/GateMusic';
import './LastHarvestGate.css';

// Catan resources
const resources = [
  { id: 1, name: 'Wheat', icon: '🌾', color: '#FFD700' },
  { id: 2, name: 'Ore', icon: '⛏️', color: '#A9A9A9' },
  { id: 3, name: 'Wood', icon: '🪵', color: '#8B4513' },
  { id: 4, name: 'Sheep', icon: '🐑', color: '#FFFFFF' },
  { id: 5, name: 'Clay', icon: '🧱', color: '#D2691E' },
];

function LastHarvestGate() {
  const [harvestedResources, setHarvestedResources] = useState([]);
  const [gameState, setGameState] = useState('harvesting'); // harvesting, arranging, checking, won
  const [sequence, setSequence] = useState('');
  const [userSequence, setUserSequence] = useState('');
  const [message, setMessage] = useState('Harvest the fields to reveal the sequence...');
  const [fallingSheep, setFallingSheep] = useState([]);

  // Generate random sequence of 13 resources
  const generateSequence = () => {
    let seq = '';
    for (let i = 0; i < 13; i++) {
      const randomResource = resources[Math.floor(Math.random() * resources.length)];
      seq += randomResource.id;
    }
    return seq;
  };

  useEffect(() => {
    const seq = generateSequence();
    setSequence(seq);
    console.log("%c🌾 GATE 3: THE LAST HARVEST 🌾", "color: #FFD700; font-size: 20px; font-weight: bold;");
    console.log("%cHarvest resources from the fields...", "color: #8B4513; font-size: 14px;");
    console.log("%cArrange them in the correct order to pass!", "color: #DAA520; font-size: 12px;");
  }, []);

  const handleHarvest = (resourceId) => {
    // Add to harvested sequence
    const newHarvested = [...harvestedResources, resourceId];
    setHarvestedResources(newHarvested);

    // Check if we've harvested all 13
    if (newHarvested.length === 13) {
      setGameState('arranging');
      setMessage('All fields harvested! Now arrange them in order...');
    }
  };

  const handleResourceClick = (index) => {
    if (gameState !== 'arranging') return;

    // Add to user sequence
    const resource = harvestedResources[index];
    setUserSequence(userSequence + resource);

    // Check if it matches so far
    if (resource.toString() !== sequence[userSequence.length].toString()) {
      setMessage('❌ Wrong order! Try again!');
      setUserSequence('');
      // Create falling sheep animation on failure
      createFallingSheep();
    } else if (userSequence.length + 1 === 13) {
      // Correct sequence!
      setGameState('won');
      setMessage('✅ Perfect harvest! You gathered the sequence correctly!');
    }
  };

  const createFallingSheep = () => {
    const sheep = {
      id: Date.now(),
      left: Math.random() * 90 + 5,
      delay: 0,
    };
    setFallingSheep(prev => [...prev, sheep]);
    setTimeout(() => {
      setFallingSheep(prev => prev.filter(s => s.id !== sheep.id));
    }, 3000);
  };

  const resetGame = () => {
    const seq = generateSequence();
    setSequence(seq);
    setHarvestedResources([]);
    setUserSequence('');
    setGameState('harvesting');
    setMessage('Harvest the fields to reveal the sequence...');
  };

  const getResourceById = (id) => resources.find(r => r.id === id);

  return (
    <div className="harvest-container">

      <GateMusic src={new URL('../assets/audio/Catan Universe Menu Theme.mp3', import.meta.url).href} />

      <div className="stars"></div>
      <div className="twinkling"></div>

      <div className="harvest-content">
        <h1 className="harvest-title glitch" data-text="Gate 3: The Last Harvest">
          Gate 3: The Last Harvest
        </h1>

        <div className="message-display">{message}</div>

        {gameState === 'harvesting' && (
          <div className="harvesting-section">
            <div className="fields-grid">
              {Array(13).fill(0).map((_, i) => (
                <div
                  key={i}
                  className="field"
                  onClick={() => handleHarvest(Math.floor(Math.random() * 5) + 1)}
                  style={{
                    opacity: i < harvestedResources.length ? 0.3 : 1,
                  }}
                >
                  <div className="field-icon">🌾</div>
                  {i < harvestedResources.length && (
                    <div className="harvested-check">✓</div>
                  )}
                </div>
              ))}
            </div>
            <div className="harvested-display">
              <p className="harvested-label">Harvested ({harvestedResources.length}/13):</p>
              <div className="harvested-resources">
                {harvestedResources.map((resourceId, idx) => {
                  const resource = getResourceById(resourceId);
                  return (
                    <div key={idx} className="harvested-resource" style={{ color: resource.color }}>
                      {resource.icon}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {gameState === 'arranging' && (
          <div className="arranging-section">
            <div className="user-sequence">
              <p className="sequence-label">Your sequence ({userSequence.length}/13):</p>
              <div className="sequence-display">
                {userSequence.split('').map((resourceId, idx) => {
                  const resource = getResourceById(parseInt(resourceId));
                  return (
                    <div key={idx} className="sequence-item" style={{ color: resource.color }}>
                      {resource.icon}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="resources-to-arrange">
              <p className="arrange-label">Click resources in order:</p>
              <div className="resources-grid">
                {harvestedResources.map((resourceId, idx) => {
                  const resource = getResourceById(resourceId);
                  const isUsed = userSequence.includes(resourceId.toString()) &&
                    userSequence.split('').filter(r => r === resourceId.toString()).length ===
                    (idx + 1 - userSequence.length);

                  return (
                    <div
                      key={idx}
                      className={`arrangeable-resource ${isUsed ? 'used' : ''}`}
                      onClick={() => handleResourceClick(idx)}
                      style={{ opacity: isUsed ? 0.3 : 1 }}
                    >
                      <div className="resource-icon" style={{ color: resource.color }}>
                        {resource.icon}
                      </div>
                      <div className="resource-name">{resource.name}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {gameState === 'won' && (
          <div className="victory-section">
            <div className="victory-display">
              <div className="victory-emoji">🎉</div>
              <h2 className="victory-title">Harvest Complete!</h2>
              <p className="victory-message">You successfully gathered and arranged the harvest!</p>
            </div>
            <button className="next-gate-btn" onClick={() => window.location.href = '/gate-3-puzzle'}>
              Unveil the Hidden Board
            </button>
          </div>
        )}

        {gameState !== 'won' && (
          <button className="reset-btn" onClick={resetGame}>
            Reset Game
          </button>
        )}
      </div>

      {/* Falling Sheep Animation */}
      {fallingSheep.map((sheep) => (
        <div
          key={sheep.id}
          className="falling-sheep"
          style={{
            left: `${sheep.left}%`,
            animationDelay: `${sheep.delay}s`,
          }}
        >
          🐑
        </div>
      ))}
    </div>
  );
}

export default LastHarvestGate;
