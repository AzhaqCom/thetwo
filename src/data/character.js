export const character = {
    name: "Elarion",
    level: 1, 
    currentXP: 0,
    race: "Haut Elfe",
    class: "Magicien",
    historic: "Érudit de l'Académie",
    maxHP: 12,
    currentHP: 12,
    ac: 12,
    initiative: 0,
    speed: "9m",
    proficiencyBonus: 2,
    hitDice: 1,
    hitDiceType: 6,
    stats: {
        force: 8,
        dexterite: 14,
        constitution: 12,
        intelligence: 17,
        sagesse: 13,
        charisme: 10
    },
    proficiencies: {
        saves: ["intelligence", "sagesse"],
        skills: ["arcane", "histoire", "investigation", "perspicacite"]
    },
    spellcasting: {
        ability: "intelligence",
        spellSlots: {
            0: { total: Infinity, used: 0 }, // Les sorts mineurs ne coûtent pas d'emplacement
            1: { total: 2, used: 0 }
        },
        // On ne stocke que les noms des sorts
        cantrips: ["Projectile Magique", "Rayon de givre"],
        preparedSpells: ["Armure du Mage"]
    }, inventory: []
};
