// src/data/items.js

import { getModifier } from '../components/utils/utils';

export const items = {
    potionOfHealing: {
        name: "Potion de Soin",
        description: "Restaure 2d4 + 2 PV.",
        type: "consumable",
        use: (playerCharacter) => {
            const healAmount = Math.floor(Math.random() * 4) + 1 + Math.floor(Math.random() * 4) + 1 + 2;
            const newHP = Math.min(playerCharacter.maxHP, playerCharacter.currentHP + healAmount);
            return {
                ...playerCharacter,
                currentHP: newHP
            };
        },
        message: (healAmount) => `Tu as bu une Potion de Soin et récupères ${healAmount} PV.`,
    },
    scrollOfStrength: {
        name: "Parchemin de Force",
        description: "Augmente ta Force de 2 de manière permanente.",
        type: "consumable",
        use: (playerCharacter) => {
            return {
                ...playerCharacter,
                stats: {
                    ...playerCharacter.stats,
                    strength: playerCharacter.stats.strength + 2
                }
            };
        },
        message: () => `Tu as lu un Parchemin de Force et te sens plus puissant !`
    },
    scrollOfIntelligence: { // Ajout du nouveau parchemin
        name: "Parchemin d'Intelligence",
        description: "Augmente ton Intelligence de 2 de manière permanente.",
        type: "consumable",
        use: (playerCharacter) => {
            return {
                ...playerCharacter,
                stats: {
                    ...playerCharacter.stats,
                    intelligence: playerCharacter.stats.intelligence + 2
                }
            };
        },
        message: () => `Tu as lu un Parchemin d'Intelligence et te sens plus sagace !`
    },
};