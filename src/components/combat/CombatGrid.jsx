import React, { useState, useCallback, useMemo } from 'react';
import GridSquare from './GridSquare';
import PlayerCard from './PlayerCard';
import CompanionCard from './CompanionCard';
import EnemyCard from './EnemyCard';

const CombatGrid = ({ 
  playerCharacter, 
  playerCompanion, 
  combatEnemies, 
  onSelectTarget, 
  selectedTargets = [],
  currentTurnIndex,
  turnOrder,
  onMoveCharacter,
  combatPositions,
  showMovementFor = null,
  showTargetingFor = null,
  selectedAoESquares = [],
  aoeCenter = null
}) => {
  const GRID_WIDTH = 8;
  const GRID_HEIGHT = 6;

  // Calculate valid movement squares for the current character
  const getValidMovementSquares = useCallback((fromPosition, movementRange = 6) => {
    if (!fromPosition) return new Set();
    
    const validSquares = new Set();
    const { x: startX, y: startY } = fromPosition;
    
    // Simple movement: can move up to movementRange squares in any direction
    for (let x = 0; x < GRID_WIDTH; x++) {
      for (let y = 0; y < GRID_HEIGHT; y++) {
        const distance = Math.abs(x - startX) + Math.abs(y - startY); // Manhattan distance
        if (distance <= movementRange && distance > 0) {
          // Check if square is occupied
          const isOccupied = Object.values(combatPositions).some(pos => pos.x === x && pos.y === y);
          if (!isOccupied) {
            validSquares.add(`${x},${y}`);
          }
        }
      }
    }
    
    return validSquares;
  }, [combatPositions]);

  // Calculate valid targeting squares
  const getValidTargetSquares = useCallback((fromPosition, targetingRange = 'unlimited') => {
    if (!fromPosition) return new Set();
    
    const validSquares = new Set();
    const { x: startX, y: startY } = fromPosition;
    
    for (let x = 0; x < GRID_WIDTH; x++) {
      for (let y = 0; y < GRID_HEIGHT; y++) {
        if (targetingRange === 'melee') {
          // Adjacent squares only (including diagonals)
          const distance = Math.max(Math.abs(x - startX), Math.abs(y - startY));
          if (distance === 1) {
            validSquares.add(`${x},${y}`);
          }
        } else if (targetingRange === 'ranged') {
          // Ranged attacks - limited range but not adjacent
          const distance = Math.abs(x - startX) + Math.abs(y - startY);
          if (distance > 1 && distance <= 12) { // 60 feet = 12 squares
            validSquares.add(`${x},${y}`);
          }
        } else {
          // Ranged or unlimited - can target any square except own position
          if (!(x === startX && y === startY)) {
            validSquares.add(`${x},${y}`);
          }
        }
      }
    }
    
    return validSquares;
  }, []);

  const validMovementSquares = useMemo(() => {
    if (!showMovementFor || !combatPositions[showMovementFor]) return new Set();
    return getValidMovementSquares(combatPositions[showMovementFor]);
  }, [showMovementFor, combatPositions, getValidMovementSquares]);

  const validTargetSquares = useMemo(() => {
    if (!showTargetingFor || !combatPositions[showTargetingFor]) return new Set();
    // Determine range based on current spell or action
    let range = 'unlimited';
    // This would be passed from parent component based on selected spell
    return getValidTargetSquares(combatPositions[showTargetingFor], range);
  }, [showTargetingFor, combatPositions, getValidTargetSquares]);

  const handleSquareClick = useCallback((x, y) => {
    const squareKey = `${x},${y}`;
    
    // Handle movement
    if (showMovementFor && validMovementSquares.has(squareKey)) {
      onMoveCharacter(showMovementFor, { x, y });
      return;
    }
    
    // Handle targeting
    if (showTargetingFor && validTargetSquares.has(squareKey)) {
      // Find character at this position
      const targetId = Object.keys(combatPositions).find(id => {
        const pos = combatPositions[id];
        return pos.x === x && pos.y === y;
      });
      
      if (targetId && onSelectTarget) {
        // Find the actual character/enemy object
        let target = null;
        if (targetId === 'player') {
          target = { ...playerCharacter, id: 'player' };
        } else if (targetId === 'companion') {
          target = { ...playerCompanion, id: 'companion' };
        } else {
          target = combatEnemies.find(enemy => enemy.name === targetId);
        }
        
        if (target) {
          onSelectTarget(target);
        }
      }
    }
  }, [showMovementFor, showTargetingFor, validMovementSquares, validTargetSquares, onMoveCharacter, onSelectTarget, combatPositions, playerCharacter, playerCompanion, combatEnemies]);

  const renderCharacterAtPosition = (x, y) => {
    // Find which character is at this position
    const characterId = Object.keys(combatPositions).find(id => {
      const pos = combatPositions[id];
      return pos && pos.x === x && pos.y === y;
    });


    if (!characterId) return null;

    const isCurrentTurn = turnOrder[currentTurnIndex]?.name === characterId || 
                         (characterId === 'player' && turnOrder[currentTurnIndex]?.type === 'player') ||
                         (characterId === 'companion' && turnOrder[currentTurnIndex]?.type === 'companion');
    
    const isSelected = selectedTargets.some(target => 
      target.id === characterId || 
      target.name === characterId ||
      (characterId === 'player' && target.type === 'player') ||
      (characterId === 'companion' && target.type === 'companion')
    );

    if (characterId === 'player') {
      return (
        <PlayerCard 
          character={playerCharacter}
          isCurrentTurn={isCurrentTurn}
          isSelected={isSelected}
        />
      );
    } else if (characterId === 'companion' && playerCompanion) {
      return (
        <CompanionCard 
          companion={playerCompanion}
          isCurrentTurn={isCurrentTurn}
          isSelected={isSelected}
        />
      );
    } else {
      const enemy = combatEnemies.find(e => e.name === characterId);
      
      if (enemy) {
        return (
          <EnemyCard 
            enemy={enemy}
            isCurrentTurn={isCurrentTurn}
            isSelected={isSelected}
            targetable={enemy.currentHP > 0}
          />
        );
      }
    }

    return null;
  };

  const getSquareClass = (x, y) => {
    const squareKey = `${x},${y}`;
    let classes = [];
    
    if (validMovementSquares.has(squareKey)) {
      classes.push('valid-movement');
    }
    
    if (validTargetSquares.has(squareKey)) {
      classes.push('valid-target');
    }
    
    // Check if this square is part of an AoE effect
    if (selectedAoESquares.some(square => square.x === x && square.y === y)) {
      classes.push('aoe-target');
    }
    
    // Check if this is the AoE center
    if (aoeCenter && aoeCenter.x === x && aoeCenter.y === y) {
      classes.push('aoe-center');
    }
    
    return classes.join(' ');
  };

  const renderGrid = () => {
    const grid = [];
    
    for (let y = 0; y < GRID_HEIGHT; y++) {
      for (let x = 0; x < GRID_WIDTH; x++) {
        const character = renderCharacterAtPosition(x, y);
        
        grid.push(
          <GridSquare
            key={`${x}-${y}`}
            x={x}
            y={y}
            onClick={handleSquareClick}
            className={getSquareClass(x, y)}
          >
            {character}
          </GridSquare>
        );
      }
    }
    
    return grid;
  };

  return (
    <div className="combat-grid-container">
      <div className="combat-grid">
        {renderGrid()}
      </div>
    </div>
  );
};

export default React.memo(CombatGrid);