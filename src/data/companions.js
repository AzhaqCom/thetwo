import tyrionImage from '../assets/tyrion.png';
import rhingannImage from '../assets/rhingann.png'

export const companions = {
    "Tyrion": {
        name: "Tyrion",
        level: 1,
        race: "Humain",
        class: "Jeune Guerrier",
        historic: "Chercheur de Reliques",
        role: "tank",
        maxHP: 12,
        currentHP: 12,
        ac: 18,
        initiative: 0,
        speed: "9m",
        proficiencyBonus: 2,
        hitDice: 1,
        hitDiceType: 6,
        type: "companion",
        stats: {
            force: 18,
            dexterite: 16,
            constitution: 15,
            intelligence: 13,
            sagesse: 10,
            charisme: 12
        },
        movement: 6,
        image: tyrionImage,
        attacks: [
            {
                name: "son Épée longue",
                type: "melee",
                range: 1,
                description: "Une attaque avec une épée longue",
                damageDice: "1d8",
                damageType: "tranchant",
                stat: "force"
            }
        ],
        inventory: [],
        aiPriority: ["protect", "taunt", "melee_attack"],
        spellcasting: null
    }, 
    "Rhingann": {
        name: "Rhingann",
        level: 1,
        race: "Naine",
        class: "Clerc",
        historic: "", 
        role: "healer",
        maxHP: 13, 
        currentHP: 13, 
        ac: 14,
        initiative: 0,
        speed: "9m",
        proficiencyBonus: 2,
        hitDice: 1,
        hitDiceType: 8, 
        type: "companion",
        stats: {
            force: 14,        
            dexterite: 10,    
            constitution: 14, 
            intelligence: 10, 
            sagesse: 18,     
            charisme: 10      
        },
        movement: 6,
        image: rhingannImage,
        attacks: [
            {
                name: "son Marteau de guerre",
                type: "melee",
                range: 1,
                description: "Une attaque avec un marteau de guerre",
                damageDice: "1d8",
                damageType: "contondant",
                stat: "force"
            }
        ],
        inventory: [],
        aiPriority: ["heal", "buff", "ranged_support"],
        spellcasting: {
            class: "Clerc",
            spellSlots: { 
                "1": { total: 2, used: 0 }
            },
            knownSpells: ["Soins", "Bénédiction"],
            preparedSpells: ["Soins", "Bénédiction"],
            slotsRemaining: {
                "1": 2
            }
        }
    }

};
