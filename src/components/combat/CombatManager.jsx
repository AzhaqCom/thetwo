import { useState, useEffect, useCallback } from 'react';
import { enemyTemplates } from '../../data/enemies';
import { getModifier } from '../utils/utils';
import { useCombatMovement } from '../../hooks/useCombatMovement';

export const useCombatManager = ({
    playerCharacter,
    playerCompanion,
    encounterData,
    addCombatMessage,
    onPlayerTakeDamage,
    onCompanionTakeDamage,
    combatKey
}) => {
    const [combatEnemies, setCombatEnemies] = useState([]);
    const [companionCharacter, setCompanionCharacter] = useState(
        playerCompanion ? { ...playerCompanion, currentHP: playerCompanion.maxHP } : null
    );
    const [turnOrder, setTurnOrder] = useState([]);
    const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
    const [combatPhase, setCombatPhase] = useState('initiative-roll');
    const [playerAction, setPlayerAction] = useState(null);
    const [actionTargets, setActionTargets] = useState([]);
    const [defeated, setDefeated] = useState(false);
    const [victory, setVictory] = useState(false);

    // Use combat movement hook
    const combatMovement = useCombatMovement(
        playerCharacter,
        companionCharacter,
        combatEnemies,
        addCombatMessage,
        onPlayerTakeDamage,
        onCompanionTakeDamage
    );

    // Reset combat when combatKey changes
    useEffect(() => {
        setCombatPhase('initiative-roll');
        setDefeated(false);
        setVictory(false);
        setCombatEnemies([]);
        setTurnOrder([]);
        setCurrentTurnIndex(0);
        setPlayerAction(null);
        setActionTargets([]);
        combatMovement.setCombatPositions({});
        combatMovement.setShowMovementFor(null);
        combatMovement.setShowTargetingFor(null);
        combatMovement.setHasMovedThisTurn(false);
        combatMovement.setSelectedAoESquares([]);
        combatMovement.setAoECenter(null);
    }, [combatKey]);

    // Update companion character when playerCompanion changes
    useEffect(() => {
        if (playerCompanion) {
            setCompanionCharacter(prev => {
                if (!prev || prev.name !== playerCompanion.name) {
                    return { ...playerCompanion };
                }
                return { ...prev, currentHP: playerCompanion.currentHP, maxHP: playerCompanion.maxHP };
            });
        } else {
            setCompanionCharacter(null);
        }
    }, [playerCompanion]);

    // Check for victory condition
    useEffect(() => {
        if (combatPhase === 'end' || combatEnemies.length === 0) {
            return;
        }

        const allEnemiesDefeated = combatEnemies.every(enemy => enemy.currentHP <= 0);
        if (allEnemiesDefeated) {
            setCombatPhase('end');
            setVictory(true);
            addCombatMessage("Victoire ! Les ennemis sont vaincus.", 'victory');
        }
    }, [combatEnemies, combatPhase, addCombatMessage]);

    const handleNextTurn = useCallback(() => {
        if (playerCharacter.currentHP <= 0) {
            setCombatPhase('end');
            setDefeated(true);
            addCombatMessage("Défaite... Tu as perdu connaissance.", 'defeat');
            return;
        }

        let nextIndex = (currentTurnIndex + 1) % turnOrder.length;
        let safetyCounter = 0;
        while (
            safetyCounter < turnOrder.length &&
            (
                (turnOrder[nextIndex].type === 'enemy' && combatEnemies.find(e => e.name === turnOrder[nextIndex].name)?.currentHP <= 0) ||
                (turnOrder[nextIndex].type === 'player' && playerCharacter.currentHP <= 0) ||
                (turnOrder[nextIndex].type === 'companion' && companionCharacter && companionCharacter.currentHP <= 0)
            )
        ) {
            nextIndex = (nextIndex + 1) % turnOrder.length;
            safetyCounter++;
        }

        if (safetyCounter >= turnOrder.length) {
            return;
        }

        setCurrentTurnIndex(nextIndex);
        setCombatPhase('turn');
        setPlayerAction(null);
        setActionTargets([]);
        combatMovement.setSelectedAoESquares([]);
        combatMovement.setAoECenter(null);
        combatMovement.setShowMovementFor(null);
        combatMovement.setShowTargetingFor(null);
        combatMovement.setHasMovedThisTurn(false);
    }, [currentTurnIndex, turnOrder, combatEnemies, addCombatMessage, playerCharacter.currentHP, companionCharacter, combatMovement]);

    return {
        // State
        combatEnemies,
        setCombatEnemies,
        companionCharacter,
        setCompanionCharacter,
        turnOrder,
        setTurnOrder,
        currentTurnIndex,
        setCurrentTurnIndex,
        combatPhase,
        setCombatPhase,
        playerAction,
        setPlayerAction,
        actionTargets,
        setActionTargets,
        defeated,
        setDefeated,
        victory,
        setVictory,
        
        // Combat movement
        ...combatMovement,
        
        // Functions
        handleNextTurn
    };
};