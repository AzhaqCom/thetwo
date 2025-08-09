import { useState, useCallback, useEffect } from 'react';
import { character as initialCharacter, spellSlotsByLevel } from '../data/character';
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
    const [currentScene, setCurrentScene] = useState("scene1");
    const [playerCharacter, setPlayerCharacter] = useState(initialCharacter);
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
        const getSpellSlotsForLevel = (level) => {
            const slots = spellSlotsByLevel[level];
            if (!slots) {
                return {};
            }

            const newSlots = {};
            for (const spellLevel in slots) {
                newSlots[spellLevel] = { total: slots[spellLevel], used: 0 };
            }
            return newSlots;
        };

        const getKnownSpells = (level) => {
            const slots = spellSlotsByLevel[level];
            const maxSpellLevel = slots ? Math.max(...Object.keys(slots).map(Number)) : 0;
            const cantrips = Object.values(spells).filter(spell => spell.level === 0).map(spell => spell.name);
            const leveledSpells = Object.values(spells)
                .filter(spell => spell.level > 0 && spell.level <= maxSpellLevel)
                .map(spell => spell.name);
            return [...cantrips, ...leveledSpells];
        };

        setPlayerCharacter(prev => ({
            ...prev,
            spellcasting: {
                ...prev.spellcasting,
                spellSlots: getSpellSlotsForLevel(prev.level),
                knownSpells: getKnownSpells(prev.level)
            }
        }));
    }, [playerCharacter.level]);

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