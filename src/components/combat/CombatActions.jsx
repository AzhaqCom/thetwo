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

        // Find potential targets
        const availableTargets = getTargetsInRange(
            { ...enemyData, type: 'enemy' }, 
            enemyPos, 
            { type: 'corps-à-corps' }, // Check melee range first
            {
                playerCharacter,
                companionCharacter,
                combatEnemies,
                combatPositions
            }
        );

        // Check if already in attack range
        const attack = enemyData.attacks?.[0];
        if (!attack) {
            addCombatMessage(`${currentTurnEntity.name} n'a pas d'attaque définie.`);
            handleNextTurn();
            return;
        }

        let targetsInRange = [];
        if (playerCharacter.currentHP > 0 && combatPositions.player) {
            if (isInAttackRange(enemyPos, combatPositions.player, attack)) {
                targetsInRange.push({ ...playerCharacter, type: 'player', name: playerCharacter.name, ac: playerCharacter.ac });
            }
        }
        if (companionCharacter && companionCharacter.currentHP > 0 && combatPositions.companion) {
            if (isInAttackRange(enemyPos, combatPositions.companion, attack)) {
                targetsInRange.push({ ...companionCharacter, type: 'companion', name: companionCharacter.name, ac: companionCharacter.ac });
            }
        }

        // If no targets in range, try to move closer
        if (targetsInRange.length === 0) {
            const newPosition = calculateEnemyMovementPosition(enemyData);
            if (newPosition && (newPosition.x !== enemyPos.x || newPosition.y !== enemyPos.y)) {
                updateEnemyPosition(enemyData.name, newPosition);
                addCombatMessage(`${enemyData.name} se déplace vers une meilleure position.`);
                
                // Recalculate targets after movement
                const newEnemyPos = newPosition;
                if (playerCharacter.currentHP > 0 && combatPositions.player) {
                    if (isInAttackRange(newEnemyPos, combatPositions.player, attack)) {
                        targetsInRange.push({ ...playerCharacter, type: 'player', name: playerCharacter.name, ac: playerCharacter.ac });
                    }
                }
                if (companionCharacter && companionCharacter.currentHP > 0 && combatPositions.companion) {
                    if (isInAttackRange(newEnemyPos, combatPositions.companion, attack)) {
                        targetsInRange.push({ ...companionCharacter, type: 'companion', name: companionCharacter.name, ac: companionCharacter.ac });
                    }
                }
            }
        }

        // Execute attack if targets are in range
        if (targetsInRange.length > 0) {
            const randomTarget = targetsInRange[Math.floor(Math.random() * targetsInRange.length)];
            const attackRoll = Math.floor(Math.random() * 20) + 1 + (attack.attackBonus || 0);

            if (attackRoll >= randomTarget.ac) {
                const { damage, message } = calculateDamage(attack);
                if (randomTarget.type === 'player') {
                    onPlayerTakeDamage(damage, `${currentTurnEntity.name} touche ${randomTarget.name} avec ${attack.name} ! Il inflige ${message}.`);
                } else if (randomTarget.type === 'companion') {
                    onCompanionTakeDamage(damage, `${currentTurnEntity.name} touche ${randomTarget.name} avec ${attack.name} ! Il inflige ${message}.`);
                }
            } else {
                addCombatMessage(`${currentTurnEntity.name} tente d'attaquer avec ${attack.name}, mais rate son attaque.`, 'miss');
            }
        } else {
            addCombatMessage(`${currentTurnEntity.name} n'a pas de cible à portée pour attaquer.`);
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
        isInAttackRange
    ]);

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

        const livingEnemies = combatEnemies.filter(e => e.currentHP > 0);
        
        if (livingEnemies.length === 0) {
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

        // Check if already in attack range of any enemy
        let targetsInRange = [];
        livingEnemies.forEach(enemy => {
            const enemyPos = combatPositions[enemy.name];
            if (enemyPos && isInAttackRange(companionPos, enemyPos, { ...attack, type: 'corps-à-corps' })) {
                targetsInRange.push(enemy);
            }
        });

        // If no targets in range, try to move closer
        if (targetsInRange.length === 0) {
            const newPosition = calculateEnemyMovementPosition({ 
                ...companionCharacter, 
                type: 'companion',
                movement: 6,
                attacks: companionCharacter.attacks
            });
            
            if (newPosition && (newPosition.x !== companionPos.x || newPosition.y !== companionPos.y)) {
                updateEnemyPosition('companion', newPosition);
                addCombatMessage(`${companionCharacter.name} se déplace vers une meilleure position.`);
                
                // Recalculate targets after movement
                livingEnemies.forEach(enemy => {
                    const enemyPos = combatPositions[enemy.name];
                    if (enemyPos && isInAttackRange(newPosition, enemyPos, { ...attack, type: 'corps-à-corps' })) {
                        targetsInRange.push(enemy);
                    }
                });
            }
        }

        // Execute attack if targets are in range
        if (targetsInRange.length > 0) {
            const target = targetsInRange[Math.floor(Math.random() * targetsInRange.length)];
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
                addCombatMessage(`${companionCharacter.name} tente d'attaquer avec ${attack.name}, mais rate son attaque.`, 'miss');
            }
        } else {
            addCombatMessage(`${companionCharacter.name} n'a pas de cible à portée pour attaquer.`);
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
        isInAttackRange
    ]);

    return {
        enemyAttack,
        companionAttack
    };
};