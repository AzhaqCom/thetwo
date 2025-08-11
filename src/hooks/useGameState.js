import { useState, useCallback, useEffect } from 'react';
import { character as initialCharacter, spellSlotsByLevel } from '../data/character';
import { getPrimaryCombatStat, getSpellcastingAbility } from '../components/utils/actionUtils';

import { items } from '../data/items';
import { levels } from '../data/levels';
import { enemyTemplates } from '../data/enemies';
import { spells } from '../data/spells';
import { companions } from '../data/companions';
import { getModifier } from '../components/utils/utils';

const skillToStat = {
    acrobaties: "dexterite",
    arcane: "intelligence",
    athletisme: "force",
    discretion: "dexterite",
    dressage: "sagesse",
    escamotage: "dexterite",
    histoire: "intelligence",
    intimidation: "charisme",
    intuition: "sagesse",
    investigation: "intelligence",
    medecine: "sagesse",
    nature: "intelligence",
    perception: "sagesse",
    persuasion: "charisme",
    religion: "intelligence",
    representation: "charisme",
    survie: "sagesse",
    tromperie: "charisme"
};

export const useGameState = () => {
    const [gamePhase, setGamePhase] = useState('character-selection');
    const [currentScene, setCurrentScene] = useState("scene3");
    const [playerCharacter, setPlayerCharacter] = useState(null);
    const [playerCompanion, setPlayerCompanion] = useState(null);
    const [combatLog, setCombatLog] = useState([]);
    const [isShortResting, setIsShortResting] = useState(false);
    const [isLongResting, setIsLongResting] = useState(false);
    const [nextSceneAfterRest, setNextSceneAfterRest] = useState(null);
    const [combatKey, setCombatKey] = useState(0);

    const addCombatMessage = useCallback((message, type = 'default') => {
        setCombatLog(prevLog => [...prevLog, { message, type }]);
    }, []);

    // Update spell slots when level changes
    useEffect(() => {
        if (!playerCharacter) {
            return;
        }

        const getSpellSlotsForLevel = (level, characterClass) => {
            // Different classes get spells at different levels
            let effectiveLevel = level;
            
            switch (characterClass) {
                case 'Magicien':
                    // Full caster - gets spells at level 1
                    break;
                case 'Paladin':
                case 'Rôdeur':
                    // Half caster - gets spells at level 2, progresses slower
                    effectiveLevel = Math.max(0, Math.floor((level - 1) / 2));
                    break;
                case 'Guerrier':
                    // Eldritch Knight gets spells at level 3
                    if (level >= 3) {
                        effectiveLevel = Math.max(0, Math.floor((level - 2) / 3));
                    } else {
                        return {};
                    }
                    break;
                case 'Roublard':
                    // Arcane Trickster gets spells at level 3
                    if (level >= 3) {
                        effectiveLevel = Math.max(0, Math.floor((level - 2) / 3));
                    } else {
                        return {};
                    }
                    break;
                default:
                    return {};
            }
            
            const slots = spellSlotsByLevel[effectiveLevel];
            if (!slots) {
                return {};
            }

            const newSlots = {};
            for (const spellLevel in slots) {
                newSlots[spellLevel] = { total: slots[spellLevel], used: 0 };
            }
            return newSlots;
        };

        const getKnownSpells = (level, characterClass) => {
            const slots = getSpellSlotsForLevel(level, characterClass);
            const maxSpellLevel = slots ? Math.max(...Object.keys(slots).map(Number)) : 0;
            
            // Filter spells by class
            const availableSpells = Object.values(spells).filter(spell => {
                // Add spell school restrictions based on class
                switch (characterClass) {
                    case 'Magicien':
                        return true; // Wizards can learn all spells
                    case 'Guerrier': // Eldritch Knight
                        return spell.school === 'Abjuration' || spell.school === 'Évocation' || spell.level === 0;
                    case 'Roublard': // Arcane Trickster
                        return spell.school === 'Enchantement' || spell.school === 'Illusion' || spell.level === 0;
                    default:
                        return false;
                }
            });
            
            const cantrips = availableSpells.filter(spell => spell.level === 0).map(spell => spell.name);
            const leveledSpells = availableSpells
                .filter(spell => spell.level > 0 && spell.level <= maxSpellLevel)
                .map(spell => spell.name);
            return [...cantrips, ...leveledSpells];
        };

        // Only update if the character has spellcasting abilities
        if (playerCharacter.spellcasting) {
            const newSpellSlots = getSpellSlotsForLevel(playerCharacter.level, playerCharacter.class);
            const newKnownSpells = getKnownSpells(playerCharacter.level, playerCharacter.class);
            
            // Only update if there are actual changes to prevent infinite loops
            const currentSpellSlots = playerCharacter.spellcasting.spellSlots || {};
            const currentKnownSpells = playerCharacter.spellcasting.knownSpells || [];
            
            const spellSlotsChanged = JSON.stringify(currentSpellSlots) !== JSON.stringify(newSpellSlots);
            const knownSpellsChanged = JSON.stringify(currentKnownSpells) !== JSON.stringify(newKnownSpells);
            
            if (spellSlotsChanged || knownSpellsChanged) {
                setPlayerCharacter(prev => ({
                    ...prev,
                    spellcasting: {
                        ...prev.spellcasting,
                        spellSlots: newSpellSlots,
                        knownSpells: newKnownSpells
                    }
                }));
            }
        }
    }, [playerCharacter, spellSlotsByLevel, spells]);

    const handleSkillCheck = useCallback((skill, dc, onSuccess, onPartialSuccess, onFailure) => {
        const statName = skillToStat[skill];
        const statValue = playerCharacter.stats[statName];
        const statModifier = getModifier(statValue);
        const isProficient = playerCharacter.proficiencies.skills.includes(skill);
        const proficiencyBonus = isProficient ? playerCharacter.proficiencyBonus : 0;
        const skillBonus = statModifier + proficiencyBonus;
        const roll = Math.floor(Math.random() * 20) + 1;
        const totalRoll = roll + skillBonus;

        addCombatMessage(`Tu lances un dé pour la compétence ${skill} (${statName}). Ton résultat est de ${roll} + ${skillBonus} (bonus de compétence) = ${totalRoll}. Le DD était de ${dc}.`, 'skill-check');

        let nextScene = onFailure;
        if (totalRoll >= dc) {
            nextScene = onSuccess;
            addCombatMessage("Réussite ! Tu as réussi le test de compétence.");
        } else if (totalRoll >= (dc - 5) && onPartialSuccess) {
            nextScene = onPartialSuccess;
            addCombatMessage("Réussite partielle. Tu n'as pas réussi totalement, mais tu as un indice ou une petite récompense.");
        } else {
            nextScene = onFailure;
            addCombatMessage("Échec. Tu n'as pas réussi le test de compétence.");
        }

        setCurrentScene(nextScene);
    }, [playerCharacter, addCombatMessage]);

    return {
        // State
        gamePhase,
        setGamePhase,
        currentScene,
        setCurrentScene,
        playerCharacter,
        setPlayerCharacter,
        playerCompanion,
        setPlayerCompanion,
        combatLog,
        setCombatLog,
        isShortResting,
        setIsShortResting,
        isLongResting,
        setIsLongResting,
        nextSceneAfterRest,
        setNextSceneAfterRest,
        combatKey,
        setCombatKey,
        
        // Actions
        addCombatMessage,
        handleSkillCheck
    };
};