import { useCallback } from 'react';
import { enemyTemplates } from '../data/enemies';
import { levels } from '../data/levels';

export const useCombatActions = (
    playerCharacter,
    setPlayerCharacter,
    playerCompanion,
    setPlayerCompanion,
    addCombatMessage,
    currentScene,
    setCurrentScene,
    setCombatLog,
    setCombatKey
) => {
    const handleCombatEnd = useCallback((hasWon) => {
        if (hasWon) {
            const nextScene = currentScene.next || "sceneFallback";
            setCurrentScene(nextScene);
        } else {
            addCombatMessage("Défaite... Tu as perdu connaissance.", 'defeat');
        }
    }, [currentScene, addCombatMessage, setCurrentScene]);

    const handleCombatVictory = useCallback((defeatedEncounterData) => {
        const totalXPGained = (defeatedEncounterData.enemies || defeatedEncounterData).reduce((sum, encounter) => {
            const enemyTemplate = enemyTemplates[encounter.type];
            if (enemyTemplate) {
                return sum + (enemyTemplate.xp * encounter.count);
            }
            return sum;
        }, 0);

        let newXP = playerCharacter.currentXP + totalXPGained;
        let newLevel = playerCharacter.level;

        const levelUpMessages = [];
        while (levels[newLevel + 1] && newXP >= levels[newLevel + 1].xpRequired) {
            newLevel++;
            levelUpMessages.push(`Tu as atteint le niveau ${newLevel} !`);
        }

        if (totalXPGained > 0) {
            addCombatMessage(`Tu as gagné ${totalXPGained} points d'expérience.`, 'experience');
        }
        levelUpMessages.forEach(msg => addCombatMessage(msg, 'levelup'));
        
        setPlayerCharacter(prevCharacter => ({
            ...prevCharacter,
            currentXP: newXP,
            level: newLevel,
        }));

        const nextScene = currentScene.next || "sceneFallback";
        setCurrentScene(nextScene);
    }, [currentScene, playerCharacter, addCombatMessage, setPlayerCharacter, setCurrentScene]);

    const handlePlayerTakeDamage = useCallback((damage, message) => {
        addCombatMessage(message, 'enemy-damage');
        setPlayerCharacter(prev => {
            const newHP = Math.max(0, prev.currentHP - damage);
            if (newHP <= 0) {
                handleCombatEnd(false);
            }
            return { ...prev, currentHP: newHP };
        });
    }, [addCombatMessage, handleCombatEnd, setPlayerCharacter]);

    const handleCompanionTakeDamage = useCallback((damage, message) => {
        addCombatMessage(message, 'enemy-damage');
        setPlayerCompanion(prev => {
            if (!prev) return null;
            const newHP = Math.max(0, prev.currentHP - damage);
            return { ...prev, currentHP: newHP };
        });
    }, [addCombatMessage, setPlayerCompanion]);

    const resetCharacter = useCallback(() => {
        setPlayerCharacter(prev => {
            const healedCharacter = {
                ...prev,
                currentHP: prev.maxHP,
                hitDice: prev.level,
                spellcasting: {
                    ...prev.spellcasting,
                    spellSlots: Object.fromEntries(
                        Object.entries(prev.spellcasting.spellSlots).map(([level, slots]) => [
                            level,
                            { ...slots, used: 0 }
                        ])
                    )
                }
            };
            return healedCharacter;
        });

        setPlayerCompanion(prev => {
            if (prev) {
                return { ...prev, currentHP: prev.maxHP, hitDice: prev.level };
            }
            return null;
        });
    }, [setPlayerCharacter, setPlayerCompanion]);

    const handleReplayCombat = useCallback(() => {
        resetCharacter();
        setCombatLog([]);
        setCombatKey(prevKey => prevKey + 1);
    }, [resetCharacter, setCombatLog, setCombatKey]);

    return {
        handleCombatEnd,
        handleCombatVictory,
        handlePlayerTakeDamage,
        handleCompanionTakeDamage,
        resetCharacter,
        handleReplayCombat
    };
};