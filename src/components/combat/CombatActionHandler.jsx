import { useCallback, useEffect } from 'react';
import { spells } from '../../data/spells';
import { weapons } from '../../data/weapons';
import { getModifier } from '../utils/utils';
import { rollDice } from '../utils/combatUtils';
import { calculateAttackBonus, calculateActionDamage, requiresAttackRoll, getPrimaryCombatStat, getSpellcastingAbility } from '../utils/actionUtils';

export const useCombatActionHandler = ({
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

    const isInRange = useCallback((casterPos, targetPos, action) => {
        const distance = calculateDistance(casterPos, targetPos);
        
        switch (action.actionType) {
            case 'spell':
                if (action.range === 'touch' || action.range === 'melee') {
                    return distance <= 1;
                } else if (action.range === 'ranged' || typeof action.range === 'number') {
                    return distance <= 12;
                }
                return true;
                
            case 'weapon':
                if (action.category === 'melee') {
                    return distance <= (action.range?.melee || 1);
                } else if (action.category === 'ranged') {
                    // Parse range like "80/320" - use short range converted to squares
                    const rangeStr = action.range?.ranged || '80/320';
                    const shortRange = parseInt(rangeStr.split('/')[0]);
                    const maxSquares = Math.floor(shortRange / 5); // Convert feet to squares
                    return distance <= maxSquares;
                }
                return distance <= 1;
                
            default:
                return true;
        }
    }, [calculateDistance]);

    const findPositionByCharacter = useCallback((character) => {
        if (character.id === 'player') return combatPositions.player;
        if (character.id === 'companion') return combatPositions.companion;
        return combatPositions[character.name];
    }, [combatPositions]);

    const executeWeaponAttack = useCallback((weapon, target) => {
        const attackBonus = calculateAttackBonus(weapon, playerCharacter);
        const attackRoll = Math.floor(Math.random() * 20) + 1 + attackBonus;
        
        if (attackRoll >= target.ac) {
            const damageInfo = calculateActionDamage(weapon, playerCharacter);
            const damage = rollDice(damageInfo.dice) + damageInfo.bonus;
            
            // Vérifier attaque sournoise pour les roublards
            let sneakAttackDamage = 0;
            if (playerCharacter.class === "Roublard" && playerCharacter.specialAbilities?.sneakAttack) {
                // Simplifié : attaque sournoise si l'ennemi a moins de 50% PV (simule l'avantage)
                if (target.currentHP < target.maxHP * 0.5) {
                    sneakAttackDamage = rollDice(playerCharacter.specialAbilities.sneakAttack.damage);
                    addCombatMessage(`Attaque sournoise ! +${sneakAttackDamage} dégâts supplémentaires !`, 'player-damage');
                }
            }
            
            const totalDamage = damage + sneakAttackDamage;
            
            const updatedEnemies = combatEnemies.map(enemy => {
                if (enemy.name === target.name) {
                    const newHP = Math.max(0, enemy.currentHP - totalDamage);
                    return { ...enemy, currentHP: newHP };
                }
                return enemy;
            });
            
            setCombatEnemies(updatedEnemies);
            addCombatMessage(
                `Tu touches ${target.name} avec ${weapon.name} (Jet d'attaque: ${attackRoll}) et infliges ${totalDamage} dégâts ${damageInfo.type} !`, 
                'player-damage'
            );
            
            if (updatedEnemies.find(e => e.name === target.name).currentHP <= 0) {
                addCombatMessage(`${target.name} a été vaincu !`);
            }
        } else {
            addCombatMessage(`Tu rates ${target.name} avec ${weapon.name} (Jet d'attaque: ${attackRoll}).`, 'miss');
        }
    }, [playerCharacter, combatEnemies, setCombatEnemies, addCombatMessage]);

    const executeSpellAttack = useCallback((spell, targets) => {
        const spellUsedSuccessfully = onPlayerCastSpell(spell);
        if (!spellUsedSuccessfully) {
            return false;
        }

        let updatedEnemies = [...combatEnemies];
        const defeatedThisTurn = new Set();

        targets.forEach((target) => {
            const index = updatedEnemies.findIndex((e) => e.name === target.name);
            if (index !== -1 && updatedEnemies[index].currentHP > 0) {
                let damage = 0;

                if (spell.savingThrow) {
                    // Handle saving throw spells (like Fireball)
                    const spellcastingAbility = getSpellcastingAbility(playerCharacter);
                    const savingThrowDC = 8 + playerCharacter.proficiencyBonus + getModifier(playerCharacter.stats[spellcastingAbility]);
                    const targetStat = spell.savingThrow.ability;
                    const targetModifier = getModifier(updatedEnemies[index].stats[targetStat]);
                    const savingThrow = Math.floor(Math.random() * 20) + 1 + targetModifier;
                    
                    damage = rollDice(spell.damage.dice) + (spell.damage.bonus || 0);
                    
                    // Add detailed saving throw message
                    addCombatMessage(`${target.name} fait un jet de sauvegarde de ${targetStat} : ${savingThrow} (1d20 + ${targetModifier}) contre DD ${savingThrowDC}`, 'dice-icon');
                    if (savingThrow >= savingThrowDC) {
                        // Successful save - half damage
                        damage = Math.floor(damage / 2);
                        addCombatMessage(
                            `✅ ${target.name} RÉUSSIT son jet de sauvegarde ! Il ne subit que ${damage} dégâts de ${spell.damage.type} (dégâts réduits de moitié).`, 'heal'
                        );
                    } else {
                        // Failed save - full damage
                        addCombatMessage(
                            `❌ ${target.name} ÉCHOUE son jet de sauvegarde ! Il subit ${damage} dégâts de ${spell.damage.type} (dégâts complets).`, 'player-damage'
                        );
                    }
                    
                    updatedEnemies[index].currentHP = Math.max(0, updatedEnemies[index].currentHP - damage);
                } else if (spell.requiresAttackRoll) {
                    // Handle attack roll spells
                    const spellcastingAbility = getSpellcastingAbility(playerCharacter);
                    const spellAttackBonus = playerCharacter.proficiencyBonus + getModifier(playerCharacter.stats[spellcastingAbility]);
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
                    // Handle automatic hit spells
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
        return true;
    }, [onPlayerCastSpell, combatEnemies, playerCharacter, addCombatMessage, setCombatEnemies]);

    const handleExecuteAction = useCallback((directTargets = null) => {
        const action = playerAction;
        const targets = directTargets || actionTargets; // Use direct targets if provided


        if (!action) {
         
            return;
        }

        if (targets.length === 0) {
       
            addCombatMessage(`Aucune cible trouvée pour ${action.name}.`, 'miss');
            setPlayerAction(null);
            setActionTargets([]);
            setSelectedAoESquares([]);
            setAoECenter(null);
            setShowTargetingFor(null);
            return;
        }

        // Validate range for all targets
        const playerPos = combatPositions.player;
        const invalidTargets = targets.filter(target => {
            const targetPos = findPositionByCharacter(target);
            return !isInRange(playerPos, targetPos, action);
        });
        
        if (invalidTargets.length > 0) {
            addCombatMessage(`Certaines cibles sont hors de portée.`, 'miss');
          
            setPlayerAction(null);
            setActionTargets([]);
            setSelectedAoESquares([]);
            setAoECenter(null);
            setShowTargetingFor(null);
            return;
        }

        let actionExecuted = false;

        switch (action.actionType) {
            case 'spell':
            
                actionExecuted = executeSpellAttack(action, targets);
                break;
                
            case 'weapon':
              
                // Pour les armes, on attaque chaque cible individuellement
                targets.forEach(target => {
                    executeWeaponAttack(action, target);
                });
                actionExecuted = true;
                break;
                
            default:
           
                addCombatMessage(`Type d'action "${action.actionType}" non supporté.`, 'miss');
                break;
        }

        if (actionExecuted) {
      
            setPlayerAction(null);
            setActionTargets([]);
            setSelectedAoESquares([]);
            setAoECenter(null);
            setShowTargetingFor(null);
            handleNextTurn();
        } else {
            
        }
    }, [
        playerAction,
        actionTargets,
        combatPositions,
        findPositionByCharacter,
        isInRange,
        executeSpellAttack,
        executeWeaponAttack,
        addCombatMessage,
        setPlayerAction,
        setActionTargets,
        setSelectedAoESquares,
        setAoECenter,
        setShowTargetingFor,
        handleNextTurn
    ]);


    return {
        handleExecuteAction
    };
};