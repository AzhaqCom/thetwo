import tyrionImage from '../assets/tyrion.jpg';

export const companions = {
    "Tyrion": {
        name: "Tyrion",
        level: 1,
        race: "Humain",
        class: "Jeune Guerrier", 
        historic: "Chercheur de Reliques",
        maxHP: 10,
        currentHP: 10,
        ac: 13, 
        initiative: 0,
        speed: "9m",
        proficiencyBonus: 2,
        hitDice: 1,
        hitDiceType: 6,
        type: "companion",
        stats: {
            force: 16,
            dexterite: 15,
            constitution: 13,
            intelligence: 12,
            sagesse: 10,
            charisme: 12
        },
        movement: 6,
        image: tyrionImage, 
        attacks: [
            {
                name: "son Épée Courte",
                type: "melee",
                range: 1,
                description: "Une attaque avec une épée courte.",
                damageDice: "1d6",
                damageType: "tranchant",
                stat: "force" 
            }
        ],
        inventory: []
    }
};
