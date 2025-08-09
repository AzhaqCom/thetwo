import { useCallback } from 'react';
import { spells } from '../../data/spells';
import { getModifier } from '../utils/utils';
import { rollDice, calculateDamage, getTargetsInRange } from '../utils/combatUtils';

export const useCombatActions = ({
    playerCharacter,
    companionCharacter,
    combatEnemies,
    setCombatEnemies,
    turnOrder,
    currentTurnIndex,
    combatPositions,
    addCombatMessage,
    onPlayerTakeDamage,
    onCompanionTakeDamage,
    handleNextTurn,
    updateEnemyPosition,
    calculateEnemyMovementPosition
}) => {
    const calculateDistance = useCallback((pos1, pos2) => {
        if (!pos1 || !pos2) return Infinity;
        return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
    }, []);

    const isInAttackRange = useCallback((attackerPos, targetPos, attack) => {
        const distance = calculateDistance(attackerPos, targetPos);
        
        if (attack.type === 'corps-à-corps' || attack.type === 'melee') {
            return distance <= 1; // Adjacent squares only
        } else if (attack.type === 'distance' || attack.type === 'ranged') {
            return distance <= 12; // 60 feet = 12 squares
        }
        
        // Default to melee range
        return distance <= 1;
    }, [calculateDistance]);

    // Helper function to find valid targets for enemies
    const findValidTargetsForEnemy = useCallback(() => {
        const validTargets = [];
        
        // Priority 1: Player (if alive)
        if (playerCharacter && playerCharacter.currentHP > 0 && combatPositions.player) {
            validTargets.push({
                ...playerCharacter,
                type: 'player',
                name: playerCharacter.name,
                ac: playerCharacter.ac,
                position: combatPositions.player,
                priority: 1
            });
        }
        
        // Priority 2: Companion (if alive)
        if (companionCharacter && companionCharacter.currentHP > 0 && combatPositions.companion) {
            validTargets.push({
                ...companionCharacter,
                type: 'companion',
                name: companionCharacter.name,
                ac: companionCharacter.ac,
                position: combatPositions.companion,
                priority: 2
            });
        }
        
        // Sort by priority (lower number = higher priority)
        return validTargets.sort((a, b) => a.priority - b.priority);
    }, [playerCharacter, companionCharacter, combatPositions]);

    // Helper function to find best target for companion (lowest HP enemy)
    const findBestTargetForCompanion = useCallback(() => {
        const livingEnemies = combatEnemies.filter(e => e.currentHP > 0);
        
        if (livingEnemies.length === 0) return null;
        
        // Find enemy with lowest currentHP
        const bestTarget = livingEnemies.reduce((lowest, enemy) => {
            if (enemy.currentHP < lowest.currentHP) {
                return enemy;
            }
            return lowest;
        });
        
        return bestTarget;
    }, [combatEnemies]);

    const enemyAttack = useCallback(() => {
        const currentTurnEntity = turnOrder[currentTurnIndex];
        const enemyData = combatEnemies.find(e => e.name === currentTurnEntity.name);

        if (!enemyData || enemyData.currentHP <= 0) {
            addCombatMessage(`${currentTurnEntity.name} est déjà vaincu et ne peut pas attaquer.`);
            handleNextTurn();
            return;
        }

        const enemyPos = combatPositions[enemyData.name];
        if (!enemyPos) {
            addCombatMessage(`${currentTurnEntity.name} n'a pas de position définie.`);
            handleNextTurn();
            return;
        }

        // Find valid targets (with priority system)
        const validTargets = findValidTargetsForEnemy();
        
        if (validTargets.length === 0) {
            addCombatMessage(`${currentTurnEntity.name} n'a aucune cible valide à attaquer.`);
            handleNextTurn();
            return;
        }

        const attack = enemyData.attacks?.[0];
        if (!attack) {
            addCombatMessage(`${currentTurnEntity.name} n'a pas d'attaque définie.`);
            handleNextTurn();
            return;
        }

        // Check which targets are in attack range
        const targetsInRange = validTargets.filter(target => 
            isInAttackRange(enemyPos, target.position, attack)
        );

        // If no targets in range, try to move closer
        if (targetsInRange.length === 0) {
            addCombatMessage(`${enemyData.name} n'a aucune cible à portée, il tente de se rapprocher.`);
            const newPosition = calculateEnemyMovementPosition(enemyData);
            if (newPosition && (newPosition.x !== enemyPos.x || newPosition.y !== enemyPos.y)) {
                updateEnemyPosition(enemyData.name, newPosition);
                addCombatMessage(`${enemyData.name} se déplace vers une meilleure position.`);
                
                // Recalculate targets after movement with updated position
                const updatedValidTargets = findValidTargetsForEnemy();
                const newTargetsInRange = updatedValidTargets.filter(target => 
                    isInAttackRange(newPosition, target.position, attack)
                );
                
                // Execute attack if now in range
                if (newTargetsInRange.length > 0) {
                    const target = newTargetsInRange[0]; // Take highest priority target
                    executeEnemyAttack(currentTurnEntity, target, attack);
                } else {
                    addCombatMessage(`${currentTurnEntity.name} ne peut toujours pas atteindre de cible après son déplacement.`);
                }
            } else {
                addCombatMessage(`${currentTurnEntity.name} ne peut pas se déplacer vers une meilleure position.`);
            }
        } else {
            // Attack the highest priority target in range
            const target = targetsInRange[0];
            executeEnemyAttack(currentTurnEntity, target, attack);
        }

        handleNextTurn();
    }, [
        addCombatMessage,
        handleNextTurn,
        onPlayerTakeDamage,
        playerCharacter,
        turnOrder,
        currentTurnIndex,
        combatEnemies,
        companionCharacter,
        onCompanionTakeDamage,
        combatPositions,
        calculateEnemyMovementPosition,
        updateEnemyPosition,
        isInAttackRange,
        findValidTargetsForEnemy
    ]);

    // Helper function to execute enemy attack
    const executeEnemyAttack = useCallback((attacker, target, attack) => {
        const attackRoll = Math.floor(Math.random() * 20) + 1 + (attack.attackBonus || 0);

        if (attackRoll >= target.ac) {
            const { damage, message } = calculateDamage(attack);
            if (target.type === 'player') {
                onPlayerTakeDamage(damage, `${attacker.name} touche ${target.name} avec ${attack.name} ! Il inflige ${message}.`);
            } else if (target.type === 'companion') {
                onCompanionTakeDamage(damage, `${attacker.name} touche ${target.name} avec ${attack.name} ! Il inflige ${message}.`);
            }
        } else {
            addCombatMessage(`${attacker.name} tente d'attaquer ${target.name} avec ${attack.name}, mais rate son attaque.`, 'miss');
        }
    }, [onPlayerTakeDamage, onCompanionTakeDamage, addCombatMessage]);

    const companionAttack = useCallback(() => {
        if (!companionCharacter) {
            addCombatMessage("Aucun compagnon disponible pour attaquer.");
            handleNextTurn();
            return;
        }

        if (companionCharacter.currentHP <= 0) {
            addCombatMessage("Le compagnon est déjà vaincu et ne peut pas agir.");
            handleNextTurn();
            return;
        }

        const companionPos = combatPositions.companion;
        if (!companionPos) {
            addCombatMessage(`${companionCharacter.name} n'a pas de position définie.`);
            handleNextTurn();
            return;
        }

        // Find the best target (lowest HP enemy)
        const bestTarget = findBestTargetForCompanion();
        
        if (!bestTarget) {
            addCombatMessage("Il n'y a plus d'ennemis à attaquer.");
            handleNextTurn();
            return;
        }
        
        const attack = companionCharacter.attacks?.[0];
        if (!attack) {
            addCombatMessage(`${companionCharacter.name} n'a pas d'attaque définie.`);
            handleNextTurn();
            return;
        }

        // Check if best target is in range
        const bestTargetPos = combatPositions[bestTarget.name];
        const isTargetInRange = bestTargetPos && isInAttackRange(companionPos, bestTargetPos, { ...attack, type: 'corps-à-corps' });

        if (!isTargetInRange) {
            addCombatMessage(`${companionCharacter.name} n'est pas à portée de sa cible prioritaire (${bestTarget.name}), il se déplace.`);
            const newPosition = calculateEnemyMovementPosition({ 
                ...companionCharacter, 
                type: 'companion',
                attacks: companionCharacter.attacks
            });
            
            if (newPosition && (newPosition.x !== companionPos.x || newPosition.y !== companionPos.y)) {
                updateEnemyPosition('companion', newPosition);
                addCombatMessage(`${companionCharacter.name} se déplace vers une meilleure position.`);
                
                // Check if now in range of best target after movement
                if (bestTargetPos && isInAttackRange(newPosition, bestTargetPos, { ...attack, type: 'corps-à-corps' })) {
                    executeCompanionAttack(bestTarget, attack);
                } else {
                    addCombatMessage(`${companionCharacter.name} ne peut toujours pas atteindre sa cible après son déplacement.`);
                }
            } else {
                addCombatMessage(`${companionCharacter.name} ne peut pas se déplacer vers une meilleure position.`);
            }
        } else {
            // Attack the best target directly
            executeCompanionAttack(bestTarget, attack);
        }

        handleNextTurn();
    }, [
        addCombatMessage,
        handleNextTurn,
        combatEnemies,
        companionCharacter,
        combatPositions,
        calculateEnemyMovementPosition,
        updateEnemyPosition,
        playerCharacter,
        setCombatEnemies,
        isInAttackRange,
        findBestTargetForCompanion
    ]);

    // Helper function to execute companion attack
    const executeCompanionAttack = useCallback((target, attack) => {
        const attackBonus = getModifier(companionCharacter.stats.force || companionCharacter.stats.dexterite);
        const attackRoll = Math.floor(Math.random() * 20) + 1 + attackBonus;
        
        if (attackRoll >= target.ac) {
            const { damage, message } = calculateDamage(attack);
            const updatedEnemies = combatEnemies.map(enemy => {
                if (enemy.name === target.name) {
                    const newHP = Math.max(0, enemy.currentHP - damage);
                    return { ...enemy, currentHP: newHP };
                }
                return enemy;
            });
            setCombatEnemies(updatedEnemies);
            addCombatMessage(`${companionCharacter.name} touche ${target.name} avec ${attack.name} ! Il inflige ${message}.`, 'player-damage');
            if (updatedEnemies.find(e => e.name === target.name).currentHP <= 0) {
                addCombatMessage(`${target.name} a été vaincu !`);
            }
        } else {
            addCombatMessage(`${companionCharacter.name} tente d'attaquer ${target.name} avec ${attack.name}, mais rate son attaque.`, 'miss');
        }
    }, [companionCharacter, combatEnemies, setCombatEnemies, addCombatMessage]);

    return {
        enemyAttack,
        companionAttack
    };
};