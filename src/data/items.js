import { getModifier } from '../components/utils/utils';

export const items = {
    potionOfHealing: {
        name: "Potion de Soin",
        description: "Restaure 2d4 + 2 PV.",
        type: "consumable",
        iconType: "heal",
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
    // Ajout d'une potion de soin supérieure
    potionOfSuperiorHealing: {
        name: "Potion de Soin Supérieure",
        description: "Restaure 4d4 + 4 PV.",
        type: "consumable",
        iconType: "heal",
        use: (playerCharacter) => {
            let healAmount = 0;
            for (let i = 0; i < 4; i++) {
                healAmount += Math.floor(Math.random() * 4) + 1;
            }
            healAmount += 4;
            const newHP = Math.min(playerCharacter.maxHP, playerCharacter.currentHP + healAmount);
            return {
                ...playerCharacter,
                currentHP: newHP
            };
        },
        message: (healAmount) => `Tu as bu une Potion de Soin Supérieure et récupères ${healAmount} PV.`,
    },
    scrollOfStrength: {
        name: "Parchemin de Force",
        description: "Augmente ta Force de 2 de manière permanente.",
        type: "consumable",
        iconType: "upgrade",
        use: (playerCharacter) => {
            return {
                ...playerCharacter,
                stats: {
                    ...playerCharacter.stats,
                    force: playerCharacter.stats.force + 2
                }
            };
        },
        message: () => `Tu as lu un Parchemin de Force et te sens plus puissant !`
    },
    scrollOfDexterity: {
        name: "Parchemin d'Agilité",
        description: "Augmente ta Dextérité de 2 de manière permanente.",
        type: "consumable",
        iconType: "upgrade",
        use: (playerCharacter) => {
            return {
                ...playerCharacter,
                stats: {
                    ...playerCharacter.stats,
                    dexterite: playerCharacter.stats.dexterite + 2
                }
            };
        },
        message: () => `Tu as lu un Parchemin d'Agilité et te sens plus agile !`
    },
    scrollOfConstitution: {
        name: "Parchemin de Vitalité",
        description: "Augmente ta Constitution de 2 de manière permanente et tes PV maximum de 2.",
        type: "consumable",
        iconType: "upgrade",
        use: (playerCharacter) => {
            return {
                ...playerCharacter,
                stats: {
                    ...playerCharacter.stats,
                    constitution: playerCharacter.stats.constitution + 2
                },
                maxHP: playerCharacter.maxHP + 2,
                currentHP: playerCharacter.currentHP + 2,
            };
        },
        message: () => `Tu as lu un Parchemin de Vitalité, ton corps se renforce et tu gagnes des PV !`
    },
    scrollOfIntelligence: {
        name: "Parchemin d'Intelligence",
        description: "Augmente ton Intelligence de 2 de manière permanente.",
        type: "consumable",
        iconType: "upgrade",
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
    scrollOfSagesse: {
        name: "Parchemin de Sagesse",
        description: "Augmente ta Sagesse de 2 de manière permanente.",
        type: "consumable",
        iconType: "upgrade",
        use: (playerCharacter) => {
            return {
                ...playerCharacter,
                stats: {
                    ...playerCharacter.stats,
                    sagesse: playerCharacter.stats.sagesse + 2
                }
            };
        },
        message: () => `Tu as lu un Parchemin de Sgesse et te sens plus sagace !`
    },
    bookArtHeal: {
        name: "Livre l'art de la prestidigitation",
        description: "C'est un jolie livre vous devriez le lire",
        type: "consumable",
        iconType: "heal",
        use: (playerCharacter) => {
            const healAmount = 2
            const newHP = Math.min(playerCharacter.maxHP, playerCharacter.currentHP + healAmount);
            return {
                ...playerCharacter,
                currentHP: newHP
            };
        },
        message: () => `Tu as lu ce livre pendant une heure et tu t'es un peu reposé, tu as récuperer 2PV`
    },
    // Ajout d'une arme pour illustrer un autre type d'objet
    shortsword: {
        name: "Épée Courte",
        description: "Une arme légère et rapide.",
        type: "weapon",
        damage: "1d6", // Le dé de dégâts
        damageType: "perforant",
        isFinesse: true, // Peut être utilisée avec la Dextérité
        isLight: true, // Peut être utilisée à deux mains
    },
    longsword: {
        name: "Épée Longue",
        description: "Une épée classique, polyvalente en combat.",
        type: "weapon",
        damage: "1d8",
        damageType: "tranchant",
    },
    dagger: {
        name: "Dague",
        description: "Une petite lame facile à cacher et à lancer.",
        type: "weapon",
        damage: "1d4",
        damageType: "perforant",
        isFinesse: true,
        isLight: true,
        isThrown: true,
        range: "20/60",
    },
};