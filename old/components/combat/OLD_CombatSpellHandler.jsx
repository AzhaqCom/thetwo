import { useCallback, useEffect } from 'react';
import { spells } from '../../data/spells';
import { getModifier } from '../utils/utils';
import { rollDice } from '../utils/combatUtils';

export const useCombatSpellHandler = ({
    playerCharacter,
    playerAction,
    actionTargets,
    setPlayerAction,
    setActionTargets,
    setSelectedAoESquares,
    setAoECenter,
    setShowTargetingFor,
    combatEnemies,
    setCombatEnemies,
    combatPositions,
    onPlayerCastSpell,
    addCombatMessage,
    handleNextTurn
}) => {
    const calculateDistance = useCallback((pos1, pos2) => {
        if (!pos1 || !pos2) return Infinity;
        return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
    }, []);

    const isInRange = useCallback((casterPos, targetPos, spell) => {
        const distance = calculateDistance(casterPos, targetPos);
        
        if (spell.range === 'touch' || spell.range === 'melee') {
            return distance <= 1;
        } else if (spell.range === 'ranged' || typeof spell.range === 'number') {
            return distance <= 12;
        }
        
        return true;
    }, [calculateDistance]);

    const findPositionByCharacter = useCallback((character) => {
        if (character.id === 'player') return combatPositions.player;
        if (character.id === 'companion') return combatPositions.companion;
        return combatPositions[character.name];
    }, [combatPositions]);

    const handleCastSpellClick = useCallback(() => {
        const spell = playerAction;
        const targets = actionTargets;

        // Validate range for all targets
        const playerPos = combatPositions.player;
        const invalidTargets = targets.filter(target => {
            const targetPos = findPositionByCharacter(target);
            return !isInRange(playerPos, targetPos, spell);
        });
        
        if (invalidTargets.length > 0) {
            addCombatMessage(`Certaines cibles sont hors de portée du sort.`, 'miss');
            setPlayerAction(null);
            setActionTargets([]);
            setSelectedAoESquares([]);
            setAoECenter(null);
            setShowTargetingFor(null);
            return;
        }

        const spellUsedSuccessfully = onPlayerCastSpell(spell);
        if (!spellUsedSuccessfully) {
            setPlayerAction(null);
            setActionTargets([]);
            return;
        }

        let updatedEnemies = [...combatEnemies];
        const defeatedThisTurn = new Set();

        targets.forEach((target) => {
            const index = updatedEnemies.findIndex((e) => e.name === target.name);
            if (index !== -1 && updatedEnemies[index].currentHP > 0) {
                let damage = 0;

                if (spell.requiresAttackRoll) {
                    const spellAttackBonus = playerCharacter.proficiencyBonus + getModifier(playerCharacter.stats.intelligence);
                    const attackRoll = Math.floor(Math.random() * 20) + 1 + spellAttackBonus;
                    if (attackRoll >= updatedEnemies[index].ac) {
                        damage = rollDice(spell.damage.dice) + (spell.damage.bonus || 0);
                        updatedEnemies[index].currentHP = Math.max(0, updatedEnemies[index].currentHP - damage);
                        addCombatMessage(
                            `Le sort "${spell.name}" touche ${target.name} (Jet d'attaque: ${attackRoll}) et inflige ${damage} dégâts de ${spell.damage.type} !`, 'player-damage'
                        );
                    } else {
                        addCombatMessage(`Le sort "${spell.name}" rate ${target.name} (Jet d'attaque: ${attackRoll}).`, 'miss');
                    }
                } else {
                    damage = rollDice(spell.damage.dice) + (spell.damage.bonus || 0);
                    updatedEnemies[index].currentHP = Math.max(0, updatedEnemies[index].currentHP - damage);
                    addCombatMessage(`Le sort "${spell.name}" frappe ${target.name} et inflige ${damage} dégâts de ${spell.damage.type} !`, 'player-damage');
                }

                if (updatedEnemies[index].currentHP <= 0 && !defeatedThisTurn.has(updatedEnemies[index].name)) {
                    addCombatMessage(`${updatedEnemies[index].name} a été vaincu !`);
                    defeatedThisTurn.add(updatedEnemies[index].name);
                }
            }
        });

        setCombatEnemies(updatedEnemies);
        setPlayerAction(null);
        setActionTargets([]);
        setSelectedAoESquares([]);
        setAoECenter(null);
        setShowTargetingFor(null);
        handleNextTurn();
    }, [
        playerAction,
        actionTargets,
        onPlayerCastSpell,
        combatEnemies,
        playerCharacter,
        addCombatMessage,
        handleNextTurn,
        combatPositions,
        findPositionByCharacter,
        isInRange,
        setPlayerAction,
        setActionTargets,
        setSelectedAoESquares,
        setAoECenter,
        setShowTargetingFor,
        setCombatEnemies
    ]);

    // Auto-cast spell when enough targets are selected
    useEffect(() => {
        if (playerAction && actionTargets.length === (playerAction.projectiles || 1)) {
            handleCastSpellClick();
        }
    }, [actionTargets, playerAction, handleCastSpellClick]);

    return {
        handleCastSpellClick
    };
};