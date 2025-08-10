import { useState, useCallback, useEffect } from 'react';
import { levels } from '../data/levels';
import { getSpellcastingAbility } from '../components/utils/actionUtils';

/**
 * Centralized character management hook
 * Handles all character-related operations in a consistent way
 */
export const useCharacterManager = () => {
    const [characters, setCharacters] = useState({
        player: null,
        companion: null
    });

    // Generic character update function
    const updateCharacter = useCallback((characterType, updates) => {
        setCharacters(prev => ({
            ...prev,
            [characterType]: prev[characterType] ? { ...prev[characterType], ...updates } : null
        }));
    }, []);

    // Level up character
    const levelUpCharacter = useCallback((characterType, newXP) => {
        const character = characters[characterType];
        if (!character) return;

        let newLevel = character.level;
        while (levels[newLevel + 1] && newXP >= levels[newLevel + 1].xpRequired) {
            newLevel++;
        }

        if (newLevel > character.level) {
            // Calculate HP increase
            const hpIncrease = Math.floor(Math.random() * character.hitDiceType) + 1 + 
                Math.floor((character.stats.constitution - 10) / 2);

            updateCharacter(characterType, {
                level: newLevel,
                currentXP: newXP,
                maxHP: character.maxHP + hpIncrease,
                currentHP: character.currentHP + hpIncrease,
                hitDice: newLevel
            });

            return { leveledUp: true, newLevel, hpGained: hpIncrease };
        } else {
            updateCharacter(characterType, { currentXP: newXP });
            return { leveledUp: false };
        }
    }, [characters, updateCharacter]);

    // Take damage
    const takeDamage = useCallback((characterType, damage) => {
        const character = characters[characterType];
        if (!character) return false;

        const newHP = Math.max(0, character.currentHP - damage);
        updateCharacter(characterType, { currentHP: newHP });
        
        return newHP <= 0; // Return true if character died
    }, [characters, updateCharacter]);

    // Heal character
    const healCharacter = useCallback((characterType, healAmount) => {
        const character = characters[characterType];
        if (!character) return 0;

        const actualHeal = Math.min(healAmount, character.maxHP - character.currentHP);
        updateCharacter(characterType, { 
            currentHP: character.currentHP + actualHeal 
        });
        
        return actualHeal;
    }, [characters, updateCharacter]);

    // Rest functions
    const shortRest = useCallback((characterType) => {
        const character = characters[characterType];
        if (!character) return;

        // Reset some abilities, but not spell slots
        updateCharacter(characterType, {
            // Add short rest recovery logic here
        });
    }, [characters, updateCharacter]);

    const longRest = useCallback((characterType) => {
        const character = characters[characterType];
        if (!character) return;

        const updates = {
            currentHP: character.maxHP,
            hitDice: character.level
        };

        // Reset spell slots if character has spellcasting
        if (character.spellcasting) {
            updates.spellcasting = {
                ...character.spellcasting,
                spellSlots: Object.fromEntries(
                    Object.entries(character.spellcasting.spellSlots).map(([level, slots]) => [
                        level,
                        { ...slots, used: 0 }
                    ])
                )
            };
        }

        updateCharacter(characterType, updates);
    }, [characters, updateCharacter]);

    // Cast spell
    const castSpell = useCallback((characterType, spell) => {
        const character = characters[characterType];
        if (!character?.spellcasting) return false;

        if (spell.level > 0) {
            const spellSlots = character.spellcasting.spellSlots[spell.level];
            if (!spellSlots || spellSlots.used >= spellSlots.total) {
                return false; // No spell slots available
            }

            // Use spell slot
            const newSpellSlots = {
                ...character.spellcasting.spellSlots,
                [spell.level]: {
                    ...spellSlots,
                    used: spellSlots.used + 1
                }
            };

            updateCharacter(characterType, {
                spellcasting: {
                    ...character.spellcasting,
                    spellSlots: newSpellSlots
                }
            });
        }

        return true;
    }, [characters, updateCharacter]);

    return {
        characters,
        setCharacters,
        updateCharacter,
        levelUpCharacter,
        takeDamage,
        healCharacter,
        shortRest,
        longRest,
        castSpell
    };
};