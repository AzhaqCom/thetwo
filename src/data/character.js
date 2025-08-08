export const spellSlotsByLevel = {
    1: { 1: 2 },
    2: { 1: 3 },
    3: { 1: 4, 2: 2 },
    4: { 1: 4, 2: 3 },
    5: { 1: 4, 2: 3, 3: 2 }
};

export const character = {
    name: "Elarion",
    level: 1,
    currentXP: 0,
    race: "Haut Elfe",
    class: "Magicien",
    historic: "Érudit de l'Académie",
    maxHP: 12,
    currentHP: 12,
    ac: 13,
    initiative: 0,
    speed: "9m",
    proficiencyBonus: 2,
    hitDice: 1,
    hitDiceType: 6,
    type: "player",
    stats: {
        force: 10,
        dexterite: 15,
        constitution: 12,
        intelligence: 16,
        sagesse: 13,
        charisme: 12
    },
    proficiencies: {
        saves: ["intelligence", "sagesse"],
        skills: ["arcane", "histoire", "investigation", "perspicacite"]
    },
    spellcasting: {
        ability: "intelligence",
        spellSlots: {},
        knownSpells: [], 
        cantrips: ["Projectile Magique", "Rayon de givre"],
        preparedSpells: ["Armure du Mage"] ,
        activeSpells:{}
    },
    inventory: []
};
