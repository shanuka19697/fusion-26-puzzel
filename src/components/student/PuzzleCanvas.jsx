import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Timer as TimerIcon, Eye, Hash, Award, Sparkles } from 'lucide-react';

export default function PuzzleCanvas({ config, onComplete, gameStartTime }) {
  const dimension = config.gridDimension || 3;
  const totalTiles = dimension * dimension;
  const EMPTY_TILE_ID = totalTiles - 1; // Last tile index is the blank gap

  const [tiles, setTiles] = useState([]);
  const [moves, setMoves] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showNumbers, setShowNumbers] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const imageSrc = config.customImageUrl || config.imageSrc || '/assets/monalisa.jpg';

  // Initialize and shuffle puzzle grid
  useEffect(() => {
    initPuzzle();
  }, [dimension, imageSrc]);

  // Timer interval
  useEffect(() => {
    if (isCompleted) return;

    const interval = setInterval(() => {
      if (gameStartTime) {
        setElapsedTime(Math.max(0, Date.now() - gameStartTime));
      } else {
        setElapsedTime((prev) => prev + 100);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [gameStartTime, isCompleted]);

  // Get valid adjacent neighbor indices for any position
  const getAdjacentIndices = (index) => {
    const neighbors = [];
    const row = Math.floor(index / dimension);
    const col = index % dimension;

    if (row > 0) neighbors.push(index - dimension); // Top
    if (row < dimension - 1) neighbors.push(index + dimension); // Bottom
    if (col > 0) neighbors.push(index - 1); // Left
    if (col < dimension - 1) neighbors.push(index + 1); // Right

    return neighbors;
  };

  // Generate a 100% solvable puzzle state via valid random sliding moves
  const initPuzzle = () => {
    let currentTiles = Array.from({ length: totalTiles }, (_, i) => i);
    let emptyPos = EMPTY_TILE_ID;
    const shuffleSteps = dimension * 35; // 3x3 -> 105 steps, 4x4 -> 140 steps

    let lastPos = -1;
    for (let step = 0; step < shuffleSteps; step++) {
      const neighbors = getAdjacentIndices(emptyPos).filter(pos => pos !== lastPos);
      const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
      
      // Swap empty tile with chosen neighbor
      [currentTiles[emptyPos], currentTiles[randomNeighbor]] = [currentTiles[randomNeighbor], currentTiles[emptyPos]];
      lastPos = emptyPos;
      emptyPos = randomNeighbor;
    }

    // Ensure it's not accidentally solved at start
    if (currentTiles.every((val, idx) => val === idx)) {
      const neighbors = getAdjacentIndices(emptyPos);
      const swapWith = neighbors[0];
      [currentTiles[emptyPos], currentTiles[swapWith]] = [currentTiles[swapWith], currentTiles[emptyPos]];
    }

    setTiles(currentTiles);
    setMoves(0);
    setIsCompleted(false);
  };

  const handleTileClick = (clickedIdx) => {
    if (isCompleted) return;

    // Find current index of empty tile
    const emptyIdx = tiles.indexOf(EMPTY_TILE_ID);

    // Check if clicked tile is adjacent to empty tile
    const cRow = Math.floor(clickedIdx / dimension);
    const cCol = clickedIdx % dimension;
    const eRow = Math.floor(emptyIdx / dimension);
    const eCol = emptyIdx % dimension;

    const isAdjacent = Math.abs(cRow - eRow) + Math.abs(cCol - eCol) === 1;

    if (isAdjacent) {
      const newTiles = [...tiles];
      [newTiles[clickedIdx], newTiles[emptyIdx]] = [newTiles[emptyIdx], newTiles[clickedIdx]];

      setTiles(newTiles);
      const newMoves = moves + 1;
      setMoves(newMoves);

      // Check victory: every tile in its original solved position
      const solved = newTiles.every((val, idx) => val === idx);
      if (solved) {
        setIsCompleted(true);
        triggerConfetti();
        const finalTime = gameStartTime ? Date.now() - gameStartTime : elapsedTime;
        if (onComplete) {
          onComplete({ moves: newMoves, solveTime: finalTime });
        }
      }
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 140,
      spread: 80,
      origin: { y: 0.55 }
    });
  };

  const formatTime = (ms) => {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const tenths = Math.floor((ms % 1000) / 100);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${tenths}`;
  };

  return (
    <div className="puzzle-wrapper">
      {/* HUD Bar */}
      <div className="puzzle-hud">
        <div className="hud-item text-gradient-gold">
          <TimerIcon size={20} />
          <span>{formatTime(elapsedTime)}</span>
        </div>
        <div className="hud-item text-gradient-purple">
          <Award size={20} />
          <span>{moves} Slides</span>
        </div>
      </div>

      {/* Helper Controls */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', width: '100%', justifyContent: 'center' }}>
        <button
          className="btn-primary"
          style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          onClick={() => setShowPreview(!showPreview)}
        >
          <Eye size={16} />
          {showPreview ? 'Hide Target' : 'Preview Target'}
        </button>
        <button
          className="btn-primary btn-cyan"
          style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          onClick={() => setShowNumbers(!showNumbers)}
        >
          <Hash size={16} />
          {showNumbers ? 'Hide Numbers' : 'Show Numbers'}
        </button>
      </div>

      {/* Target Preview Overlay */}
      {showPreview && (
        <div style={{ marginBottom: '16px', textAlign: 'center' }}>
          <img
            src={imageSrc}
            alt="Target Artwork"
            style={{ width: '180px', height: '180px', borderRadius: '12px', border: '2px solid #fbbf24', boxShadow: '0 0 20px rgba(251, 191, 36, 0.4)' }}
          />
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Target Completed Picture</p>
        </div>
      )}

      {/* Classic Sliding Puzzle Grid */}
      <div
        className="puzzle-grid-container"
        style={{
          gridTemplateColumns: `repeat(${dimension}, 1fr)`,
          gridTemplateRows: `repeat(${dimension}, 1fr)`
        }}
      >
        {tiles.map((tileOriginalIdx, currentGridIdx) => {
          const isEmptySlot = tileOriginalIdx === EMPTY_TILE_ID;

          // Compute background position percentage for non-empty tiles
          const origRow = Math.floor(tileOriginalIdx / dimension);
          const origCol = tileOriginalIdx % dimension;

          const colPercent = (origCol / (dimension - 1)) * 100;
          const rowPercent = (origRow / (dimension - 1)) * 100;

          // Check if this tile can slide into the empty slot
          const emptyIdx = tiles.indexOf(EMPTY_TILE_ID);
          const cRow = Math.floor(currentGridIdx / dimension);
          const cCol = currentGridIdx % dimension;
          const eRow = Math.floor(emptyIdx / dimension);
          const eCol = emptyIdx % dimension;
          const isSlideable = Math.abs(cRow - eRow) + Math.abs(cCol - eCol) === 1;

          // On victory, show complete image on all tiles including empty slot!
          if (isEmptySlot && !isCompleted) {
            return (
              <div
                key={currentGridIdx}
                className="puzzle-tile empty-slot"
                style={{
                  background: 'rgba(9, 13, 22, 0.95)',
                  border: '1.5px dashed rgba(139, 92, 246, 0.4)',
                  borderRadius: '8px',
                  boxShadow: 'inset 0 0 15px rgba(0, 0, 0, 0.8)'
                }}
              />
            );
          }

          return (
            <div
              key={currentGridIdx}
              className={`puzzle-tile ${isSlideable ? 'slideable' : ''}`}
              onClick={() => handleTileClick(currentGridIdx)}
              style={{
                backgroundImage: `url(${imageSrc})`,
                backgroundSize: `${dimension * 100}% ${dimension * 100}%`,
                backgroundPosition: `${colPercent}% ${rowPercent}%`,
                borderColor: isSlideable ? '#06b6d4' : 'rgba(255, 255, 255, 0.2)'
              }}
            >
              {showNumbers && (
                <div className="tile-number-badge">
                  {tileOriginalIdx + 1}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Instruction */}
      <p style={{ marginTop: '16px', fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
        <Sparkles size={16} color="#06b6d4" />
        <span>Tap any tile next to the empty slot to slide it into position!</span>
      </p>
    </div>
  );
}
