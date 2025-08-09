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
    const enemyAttack = useCallback(() => {
        const currentTurnEntity = turnOrder[currentTurnIndex];
        const enemyData = combatEnemies.find(e => e.name === currentTurnEntity.name);

        if (!enemyData || enemyData.currentHP <= 0) {
            addCombatMessage(`${currentTurnEntity.name} est déjà vaincu et ne peut pas attaquer.`);
            handleNextTurn();
            return;
        }

        // Handle enemy movement
        const enemyPos = combatPositions[enemyData.name];
        if (enemyPos) {
            const newPosition = calculateEnemyMovementPosition(enemyData);
            if (newPosition && (newPosition.x !== enemyPos.x || newPosition.y !== enemyPos.y)) {
                updateEnemyPosition(enemyData.name, newPosition);
                addCombatMessage(`${enemyData.name} se déplace vers une meilleure position.`);
            }
        }

        // Handle attacks with delay to ensure position updates
        setTimeout(() => {
            const attackSet = enemyData.attackSets?.[Math.floor(Math.random() * enemyData.attackSets.length)] || {
                name: enemyData.attacks?.[0]?.name,
                attacks: [enemyData.attacks?.[0]]
            };

            if (!attackSet.attacks[0]) {
                addCombatMessage(`${currentTurnEntity.name} n'a pas d'attaque définie.`);
                handleNextTurn();
                return;
            }

            const updatedEnemyPos = combatPositions[enemyData.name];
            
            for (const attack of attackSet.attacks) {
                const attackRoll = Math.floor(Math.random() * 20) + 1 + (attack.attackBonus || 0);
                
                const attackWithType = {
                    ...attack,
                    type: attack.type || 'corps-à-corps'
                };
                
                const availableTargets = getTargetsInRange(
                    { ...enemyData, type: 'enemy' }, 
                    updatedEnemyPos, 
                    attackWithType, 
                    {
                        playerCharacter,
                        companionCharacter,
                        combatEnemies,
                        combatPositions
                    }
                );
                
                if (availableTargets.length === 0) {
                    addCombatMessage(`${currentTurnEntity.name} n'a pas de cible à portée pour attaquer.`);
                    continue;
                }
                
                const randomTarget = availableTargets[Math.floor(Math.random() * availableTargets.length)];

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
            }
            handleNextTurn();
        }, 100);
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
        updateEnemyPosition
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
        const livingEnemies = combatEnemies.filter(e => e.currentHP > 0);
        
        if (livingEnemies.length === 0) {
            addCombatMessage("Il n'y a plus d'ennemis à attaquer.");
            handleNextTurn();
            return;
        }
        
        if (companionPos) {
            const newPosition = calculateEnemyMovementPosition({ 
                ...companionCharacter, 
                type: 'companion',
                movement: 6,
                attacks: companionCharacter.attacks
            });
            
            if (newPosition && (newPosition.x !== companionPos.x || newPosition.y !== companionPos.y)) {
                updateEnemyPosition('companion', newPosition);
                addCombatMessage(`${companionCharacter.name} se déplace vers une meilleure position.`);
            }
        }

        const attack = companionCharacter.attacks?.[0];
        if (!attack) {
            addCombatMessage(`${companionCharacter.name} n'a pas d'attaque définie.`);
            handleNextTurn();
            return;
        }

        const updatedCompanionPos = combatPositions.companion;
        const availableTargets = getTargetsInRange(
            { ...companionCharacter, type: 'companion' }, 
            updatedCompanionPos, 
            { ...attack, type: 'corps-à-corps' },
            {
                playerCharacter,
                companionCharacter,
                combatEnemies,
                combatPositions
            }
        );
        
        if (availableTargets.length === 0) {
            addCombatMessage(`${companionCharacter.name} n'a pas de cible à portée pour attaquer.`);
            handleNextTurn();
            return;
        }
        
        const target = availableTargets[Math.floor(Math.random() * availableTargets.length)];
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

        console.log('CombatActions - Companion attack completed, calling handleNextTurn');
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
        setCombatEnemies
    ]);

    return {
        enemyAttack,
        companionAttack
    };
};