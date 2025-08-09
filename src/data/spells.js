export const spells = {
    // Sorts mineurs (Cantrips - niveau 0)
    "Projectile Magique": {
        name: "Projectile Magique",
        level: 0,
        school: "Évocation",
        castingTime: "1 action",
        range: "36 mètres",
        description: "Vous créez trois fléchettes faites d'énergie magique brillante. Chacune touche une créature de votre choix, située à portée et dans votre champ de vision. Une fléchette inflige 1d4+1 dégâts de force à la cible. Toutes les fléchettes frappent leur cible en même temps, sachant que vous pouvez toutes les diriger contre une seule et même créature ou les répartir entre plusieurs.",
        damage: { dice: "1d4", bonus: 1, type: "force" },
        projectiles: 3,
        requiresAttackRoll: false,
        castableOutOfCombat: false // Ajouté pour la clarté
    },
    "Rayon de givre": {
        name: "Rayon de givre",
        level: 0,
        school: "Évocation",
        castingTime: "1 action",
        range: "18 mètres",
        description: "Un rayon de lumière d'un blanc bleuté file vers une créature à portée. Faites une attaque de sort à distance contre la cible. Si vous la touchez, elle subit 1d8 dégâts de froid et sa vitesse est réduite de 3 mètres jusqu'au début de votre prochain tour.",
        damage: { dice: "1d8", bonus: 0, type: "froid" },
        projectiles: 1,
        requiresAttackRoll: true,
        castableOutOfCombat: false // Ajouté pour la clarté
    },
    "Rayon Ardent": {
        name: "Rayon Ardent",
        level: 2,
        school: "Évocation",
        castingTime: "1 action",
        range: "36 mètres",
        description: "Vous créez trois rayons de feu et les projetez sur des cibles à portée. Vous pouvez les diriger contre une même cible ou contre des cibles différentes. Faites une attaque de sort à distance pour chaque rayon. Si vous touchez, la cible reçoit 2d6 dégâts.",
        damage: { dice: "2d6", bonus: 0, type: "feu" },
        projectiles: 3,
        requiresAttackRoll: true,
        castableOutOfCombat: false // Ajouté pour la clarté
    },

    "Boule de Feu": {
        name: "Boule de Feu",
        level: 3,
        school: "Évocation",
        castingTime: "1 action",
        range: "45 mètres",
        description: "Une boule de feu explose dans une sphère de 6 mètres de rayon centrée sur un point à portée. Chaque créature dans la zone doit faire un jet de sauvegarde de Dextérité. En cas d'échec, elle subit 8d6 dégâts de feu, ou la moitié en cas de réussite.",
        damage: { dice: "8d6", bonus: 0, type: "feu" },
        areaOfEffect: { shape: "sphere", radius: 20 }, // 20 feet = 4 squares radius
        savingThrow: { ability: "dexterite", dc: "spell" },
        requiresAttackRoll: false,
        castableOutOfCombat: false
    },
    "Armure du Mage": {
        name: "Armure du Mage",
        level: 1,
        school: "Abjuration",
        castingTime: "1 action",
        range: "Toucher",
        description: "Vous touchez une créature consentante et non-vêtue d'une armure. Sa Classe d'Armure devient 13 + son modificateur de Dextérité.",
        requiresAttackRoll: false,
        castableOutOfCombat: true // <-- NOUVEAU : Ce sort peut être lancé hors combat
    }
};