import React, { useCallback } from 'react';
import { useCombatManager } from './CombatManager';
import { useCombatActions } from './CombatActions';
import { useCombatActionHandler } from './CombatActionHandler';
import CombatTurnManager from './CombatTurnManager';
import CombatGrid from './CombatGrid';
import PlayerTurnPanel from './PlayerTurnPanel';

const CombatPanel = ({
    playerCharacter,
    playerCompanion,
    onCombatEnd,
    addCombatMessage,
    setCombatLog,
    encounterData,
    onPlayerCastSpell,
    onPlayerTakeDamage,
    onReplayCombat,
    combatKey,
    onCompanionTakeDamage
}) => {
    // Use combat manager hook
    const combatManager = useCombatManager({
        playerCharacter,
        playerCompanion,
        encounterData,
        addCombatMessage,
        onPlayerTakeDamage,
        onCompanionTakeDamage,
        combatKey
    });

    // Use combat actions hook
    const { enemyAttack, companionAttack } = useCombatActions({
        playerCharacter,
        companionCharacter: combatManager.companionCharacter,
        combatEnemies: combatManager.combatEnemies,
        setCombatEnemies: combatManager.setCombatEnemies,
        turnOrder: combatManager.turnOrder,
        currentTurnIndex: combatManager.currentTurnIndex,
        combatPositions: combatManager.combatPositions,
        onPlayerTakeDamage,
        onCompanionTakeDamage,
        handleNextTurn: combatManager.handleNextTurn,
        updateEnemyPosition: combatManager.updateEnemyPosition,
        calculateEnemyMovementPosition: combatManager.calculateEnemyMovementPosition,
        addCombatMessage
    });
    
    // Use action handler hook
    const { handleExecuteAction } = useCombatActionHandler({
        playerCharacter,
        playerAction: combatManager.playerAction,
        actionTargets: combatManager.actionTargets,
        setPlayerAction: combatManager.setPlayerAction,
        setActionTargets: combatManager.setActionTargets,
        setSelectedAoESquares: combatManager.setSelectedAoESquares,
        setAoECenter: combatManager.setAoECenter,
        setShowTargetingFor: combatManager.setShowTargetingFor,
        combatEnemies: combatManager.combatEnemies,
        setCombatEnemies: combatManager.setCombatEnemies,
        combatPositions: combatManager.combatPositions,
        onPlayerCastSpell,
        addCombatMessage,
        handleNextTurn: combatManager.handleNextTurn
    });

    const handlePlayerMoveCharacter = useCallback((characterId, newPosition) => {
        combatManager.handleMoveCharacter(characterId, newPosition);
        combatManager.setCombatPhase('player-action');
    }, [combatManager]);
 const findCharacterAtPosition = useCallback((x, y) => {
        // Check player
        if (combatManager.combatPositions.player && combatManager.combatPositions.player.x === x && combatManager.combatPositions.player.y === y) {
            return { ...playerCharacter, id: 'player', name: playerCharacter.name };
        }
        
        // Check companion
        if (combatManager.combatPositions.companion && combatManager.combatPositions.companion.x === x && combatManager.combatPositions.companion.y === y && combatManager.companionCharacter) {
            return { ...combatManager.companionCharacter, id: 'companion', name: combatManager.companionCharacter.name };
        }
        
        // Check enemies
        for (const enemy of combatManager.combatEnemies) {
            const enemyPos = combatManager.combatPositions[enemy.name];
            if (enemyPos && enemyPos.x === x && enemyPos.y === y) {
                return enemy;
            }
        }
        
        return null;
    }, [combatManager.combatPositions, playerCharacter, combatManager.companionCharacter, combatManager.combatEnemies]);
    const handleTargetSelection = useCallback(
        (enemy) => {
            console.log('🎯 Target selection called with:', enemy);
            console.log('🎯 Current playerAction:', combatManager.playerAction);
            console.log('🎯 Current actionTargets:', combatManager.actionTargets);
            
            if (combatManager.playerAction?.areaOfEffect) {
                console.log('🔥 Handling AoE spell');
                // Handle AoE spell targeting
                const centerPos = enemy.isPosition ? { x: enemy.x, y: enemy.y } : findPositionByCharacter(enemy);
                if (centerPos) {
                    console.log('🎯 Setting AoE center at:', centerPos);
                    combatManager.setAoECenter(centerPos);
                    const affectedSquares = calculateAoESquares(centerPos, combatManager.playerAction.areaOfEffect);
                    console.log('🔥 Affected squares:', affectedSquares);
                    combatManager.setSelectedAoESquares(affectedSquares);
                    
                    // Find all targets in affected squares
                    const targets = [];
                    affectedSquares.forEach(square => {
                        const targetAtSquare = findCharacterAtPosition(square.x, square.y);
                        if (targetAtSquare && targetAtSquare.currentHP > 0 && targetAtSquare.type === 'enemy') {
                            targets.push(targetAtSquare);
                        }
                    });
                    
                    console.log('AoE Targets found:', targets);
                    
                    // Set targets BEFORE executing
                    console.log('🎯 Setting targets:', targets);
                    combatManager.setActionTargets(targets);
                    
                    // Auto-execute AoE spell immediately after target selection
                    const executeTimeout = setTimeout(() => {
                        console.log('🚀 Executing AoE spell after timeout');
                        handleExecuteAction();
                    }, 300); // Increased delay to ensure state update
                    
                    // Store timeout reference for cleanup if needed
                    return () => clearTimeout(executeTimeout);
                }
            } else {
                console.log('🎯 Handling single target spell/attack');
                // Handle single target or projectile spells
                const maxTargets = combatManager.playerAction?.projectiles || 1;
                console.log('🎯 Max targets:', maxTargets);
                combatManager.setActionTargets((prevTargets) => {
                    const newTargets = [...prevTargets, enemy];
                    console.log('🎯 New targets array:', newTargets);
                    return newTargets;
                });
            }
        },
        [combatManager, findCharacterAtPosition, handleExecuteAction]
    );

    const calculateAoESquares = useCallback((center, aoeType) => {
        const squares = [];
        
        switch (aoeType.shape) {
            case 'sphere':
                const radius = Math.floor(aoeType.radius / 5); // Convert feet to squares
                for (let x = center.x - radius; x <= center.x + radius; x++) {
                    for (let y = center.y - radius; y <= center.y + radius; y++) {
                        if (x >= 0 && x < 8 && y >= 0 && y < 6) {
                            const distance = Math.sqrt(Math.pow(x - center.x, 2) + Math.pow(y - center.y, 2));
                            if (distance <= radius) {
                                squares.push({ x, y });
                            }
                        }
                    }
                }
                break;
            case 'cube':
                const size = Math.floor(aoeType.size / 5); // Convert feet to squares
                for (let x = center.x; x < center.x + size && x < 8; x++) {
                    for (let y = center.y; y < center.y + size && y < 6; y++) {
                        if (x >= 0 && y >= 0) {
                            squares.push({ x, y });
                        }
                    }
                }
                break;
        }
        
        return squares;
    }, []);

   

    const findPositionByCharacter = useCallback((character) => {
        if (character.id === 'player') return combatManager.combatPositions.player;
        if (character.id === 'companion') return combatManager.combatPositions.companion;
        return combatManager.combatPositions[character.name];
    }, [combatManager.combatPositions]);

    // Render different phases
    const renderCombatPhase = () => {
        switch (combatManager.combatPhase) {
            case 'initializing':
                return (
                    <div className="combat-controls">
                        <p>Initialisation du combat...</p>
                    </div>
                );

            case 'initiative-display':
                return (
                    <div className="combat-controls">
                        <p>Les jets d'initiative ont été lancés. Clique pour commencer le combat !</p>
                        <button onClick={combatManager.startCombat}>
                            Commencer le combat
                        </button>
                    </div>
                );

            case 'player-movement':
                return (
                    <div className="combat-controls">
                        <h3>Phase de Mouvement</h3>
                        <p>Clique sur une case verte pour te déplacer (6 cases maximum).</p>
                        <button onClick={() => {
                            combatManager.setShowMovementFor(null);
                            combatManager.setCombatPhase('player-action');
                        }}>
                            Passer le mouvement
                        </button>
                    </div>
                );

            case 'player-action':
                return (
                    <PlayerTurnPanel
                        playerCharacter={playerCharacter}
                        onSelectAction={(action) => {
                            combatManager.setPlayerAction(action);
                            combatManager.setShowTargetingFor('player');
                        }}
                        onPassTurn={() => {
                            combatManager.setPlayerAction(null);
                            combatManager.setShowTargetingFor(null);
                            combatManager.handleNextTurn();
                        }}
                        selectedAction={combatManager.playerAction}
                        selectedTargets={combatManager.actionTargets}
                    />
                );

            case 'end':
                return (
                    <div className="combat-controls">
                        <h3>Combat terminé !</h3>
                        {combatManager.victory && (
                            <button onClick={() => {
                                setCombatLog([]);
                                onCombatEnd(encounterData);
                            }}>
                                Continuer l'aventure
                            </button>
                        )}
                        {combatManager.defeated && (
                            <>
                                <p>Tu as été vaincu. Tu peux rejouer le combat ou continuer l'aventure.</p>
                                <button onClick={onReplayCombat} style={{ marginTop: '10px' }}>
                                    Rejouer le combat
                                </button>
                            </>
                        )}
                    </div>
                );

            case 'turn':
            case 'executing-turn':
            default:
                return (
                    <div className="combat-controls">
                        <p>Le combat est en cours...</p>
                    </div>
                );
        }
    };

    return (
        <div className="combat-panel-container">
            {/* Turn Manager - handles automatic turn progression */}
            <CombatTurnManager
                combatPhase={combatManager.combatPhase}
                setCombatPhase={combatManager.setCombatPhase}
                turnOrder={combatManager.turnOrder}
                currentTurnIndex={combatManager.currentTurnIndex}
                playerCharacter={playerCharacter}
                companionCharacter={combatManager.companionCharacter}
                combatEnemies={combatManager.combatEnemies}
                handleNextTurn={combatManager.handleNextTurn}
                addCombatMessage={addCombatMessage}
                setShowMovementFor={combatManager.setShowMovementFor}
                enemyAttack={enemyAttack}
                companionAttack={companionAttack}
            />

            {/* Combat Grid - shows after initialization */}
            {combatManager.isInitialized && (
                <CombatGrid
                    playerCharacter={playerCharacter}
                    playerCompanion={combatManager.companionCharacter}
                    combatEnemies={combatManager.combatEnemies}
                    onSelectTarget={handleTargetSelection}
                    selectedTargets={combatManager.actionTargets}
                    currentTurnIndex={combatManager.currentTurnIndex}
                    turnOrder={combatManager.turnOrder}
                    onMoveCharacter={combatManager.handleMoveCharacter}
                    combatPositions={combatManager.combatPositions}
                    showMovementFor={combatManager.showMovementFor}
                    showTargetingFor={combatManager.showTargetingFor}
                    selectedAoESquares={combatManager.selectedAoESquares}
                    aoeCenter={combatManager.aoeCenter}
                />
            )}

            {/* Phase-specific controls */}
            {renderCombatPhase()}
        </div>
    );
};

export default CombatPanel;