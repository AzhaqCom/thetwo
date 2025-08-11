export const weapons = {
    // Armes de mêlée simples
    dagger: {
        name: "Dague",
        id: "dagger",
        type: "weapon",
        category: "melee",
        damage: "1d4",
        damageType: "perforant",
        properties: ["finesse", "light", "thrown"],
        range: { melee: 1, thrown: "20/60" },
        stat: "force", // Peut être "dexterite" avec finesse
        description: "Une petite lame facile à manier."
    },
    club: {
        name: "Gourdin",
        id: "club",
        type: "weapon", 
        category: "melee",
        damage: "1d4",
        damageType: "contondant",
        properties: ["light"],
        range: { melee: 1 },
        stat: "force",
        description: "Un simple bâton de bois."
    },
    quarterstaff: {
        name: "Bâton",
        id: "quarterstaff",
        type: "weapon",
        category: "melee", 
        damage: "1d6",
        damageType: "contondant",
        properties: ["versatile"],
        range: { melee: 1 },
        stat: "force",
        description: "Un bâton solide pouvant être manié à une ou deux mains."
    },

    // Armes de mêlée de guerre
    longsword: {
        name: "Épée longue",
        id: "longsword",
        type: "weapon",
        category: "melee",
        damage: "1d8",
        damageType: "tranchant", 
        properties: ["versatile"],
        range: { melee: 1 },
        stat: "force",
        description: "Une épée classique, équilibrée et polyvalente."
    },
    shortsword: {
        name: "Épée courte",
        id: "shortsword",
        type: "weapon",
        category: "melee",
        damage: "1d6", 
        damageType: "perforant",
        properties: ["finesse", "light"],
        range: { melee: 1 },
        stat: "force", // Peut être "dexterite" avec finesse
        description: "Une lame courte et rapide."
    },
    rapier: {
        name: "Rapière",
        id: "rapier",
        type: "weapon",
        category: "melee",
        damage: "1d8",
        damageType: "perforant",
        properties: ["finesse"],
        range: { melee: 1 },
        stat: "dexterite", // Finesse par défaut
        description: "Une épée d'estoc élégante et précise."
    },
    battleaxe: {
        name: "Hache de bataille",
        id:"battleaxe",
        type: "weapon",
        category: "melee",
        damage: "1d8",
        damageType: "tranchant",
        properties: ["versatile"],
        range: { melee: 1 },
        stat: "force",
        description: "Une hache lourde et tranchante."
    },
    warhammer: {
        name: "Marteau de guerre",
        id: "warhammer",
        type: "weapon",
        category: "melee", 
        damage: "1d8",
        damageType: "contondant",
        properties: ["versatile"],
        range: { melee: 1 },
        stat: "force",
        description: "Un marteau lourd conçu pour le combat."
    },
    greatsword: {
        name: "Épée à deux mains",
        id: "greatsword",
        type: "weapon",
        category: "melee",
        damage: "2d6",
        damageType: "tranchant",
        properties: ["heavy", "two-handed"],
        range: { melee: 1 },
        stat: "force",
        description: "Une épée massive nécessitant les deux mains."
    },

    // Armes à distance simples
    lightCrossbow: {
        name: "Arbalète légère",
        id: "lightCrossbow",
        type: "weapon",
        category: "ranged",
        damage: "1d8",
        damageType: "perforant",
        properties: ["ammunition", "loading", "two-handed"],
        range: { ranged: "80/320" },
        stat: "dexterite",
        description: "Une arbalète facile à manier."
    },
    shortbow: {
        name: "Arc court",
        id: "shortbow",
        type: "weapon",
        category: "ranged",
        damage: "1d6", 
        damageType: "perforant",
        properties: ["ammunition", "two-handed"],
        range: { ranged: "80/320" },
        stat: "dexterite",
        description: "Un arc compact et maniable."
    },

    // Armes à distance de guerre
    longbow: {
        name: "Arc long",
        id: "longbow",
        type: "weapon",
        category: "ranged",
        damage: "1d8",
        damageType: "perforant", 
        properties: ["ammunition", "heavy", "two-handed"],
        range: { ranged: "150/600" },
        stat: "dexterite",
        description: "Un arc puissant avec une longue portée."
    },
    heavyCrossbow: {
        name: "Arbalète lourde",
        id: "heavyCrossbow",
        type: "weapon",
        category: "ranged",
        damage: "1d10",
        damageType: "perforant",
        properties: ["ammunition", "heavy", "loading", "two-handed"],
        range: { ranged: "100/400" },
        stat: "dexterite", 
        description: "Une arbalète puissante mais lente à recharger."
    }
};

// Propriétés des armes
export const weaponProperties = {
    ammunition: "Nécessite des munitions pour attaquer à distance",
    finesse: "Peut utiliser la Dextérité au lieu de la Force",
    heavy: "Les créatures de taille P ont un désavantage aux jets d'attaque",
    light: "Idéale pour le combat à deux armes",
    loading: "Ne peut tirer qu'un projectile par action",
    range: "Peut être utilisée pour des attaques à distance",
    reach: "Ajoute 1,50 m à l'allonge",
    thrown: "Peut être lancée pour une attaque à distance", 
    "two-handed": "Nécessite les deux mains",
    versatile: "Peut être utilisée à une ou deux mains"
};