export const enemyTemplates = {
    gobelin: {
        name: "Gobelin",
        maxHP: 7,
        currentHP: 7,
        ac: 15,
        xp: 50,
        stats: {
            force: 8,
            dexterite: 14,
            constitution: 10,
            intelligence: 10,
            sagesse: 8,
            charisme: 8,
        },
        attacks: [
            {
                name: "son Cimeterre",
                type: "corps-à-corps",
                attackBonus: 4,
                reach: 1.5,
                targets: 1,
                damageDice: "1d6",
                damageBonus: 2,
                damageType: "tranchant",
                description: "Attaque au corps à corps avec une arme : +4 au toucher, allonge 1,50 m, une cible. Touché : 5 (1d6 + 2) dégâts tranchants."
            }
        ],
        image: "https://www.aidedd.org/dnd/images/goblin.jpg"
    }, mephiteBoueux: {
        name: "Méphite boueux",
        maxHP: 27,
        currentHP: 27,
        ac: 11,
        stats: {
            force: 8,
            dexterite: 12,
            constitution: 12,
            intelligence: 9,
            sagesse: 11,
            charisme: 7
        },
        movement: 6,
        attacks: [
            {
                name: "Poing",
                type: "corps-à-corps",
                attackBonus: 3,
                reach: 1.5,
                targets: 1,
                damageDice: "1d6",
                damageBonus: 1,
                damageType: "contondant",
                description: "Attaque au corps à corps avec une arme : +3 au toucher, allonge 1,50 m, une créature. Touché : 4 (1d6 + 1) dégâts contondants."
            }
        ]
        , image: "https://www.aidedd.org/dnd/images/mud-mephit.jpg"
    },
    kobold: {
        name: "Kobold",
        maxHP: 5,
        currentHP: 5,
        ac: 12,
        xp: 25,
        stats: {
            force: 8,
            dexterite: 15,
            constitution: 10,
            intelligence: 8,
            sagesse: 8,
            charisme: 8,
        },
        attacks: [
            {
                name: "sa Dague",
                type: "corps-à-corps",
                attackBonus: 4,
                reach: 1,
                targets: 1,
                damageDice: "1d4",
                damageBonus: 2,
                damageType: "perforant",
                description: "Attaque au corps à corps : +4 au toucher, allonge 1 m, une cible. Touché : 4 (1d4 + 2) dégâts perforants."
            }
        ],
        image: "https://www.aidedd.org/dnd/images/kobold.jpg"
    },
    goule: {
        name: "Goule",
        maxHP: 22,
        currentHP: 22,
        ac: 12,
        xp: 200,
        stats: {
            force: 13,
            dexterite: 15,
            constitution: 10,
            intelligence: 7,
            sagesse: 10,
            charisme: 6,
        },
        attacks: [
            {
                name: "Griffes",
                type: "corps-à-corps",
                attackBonus: 4,
                reach: 1.5,
                targets: 1,
                damageDice: "2d4",
                damageBonus: 2,
                damageType: "tranchant",
                description: "Attaque au corps à corps avec une arme : +4 au toucher, allonge 1,50 m, une cible. Touché : 7 (2d4 + 2) dégâts tranchants. Si la cible est une créature autre qu'un elfe ou un mort-vivant, celle-ci doit réussir un jet de sauvegarde de Constitution DD 10 pour ne pas être paralysée pendant 1 minute. La cible peut relancer le jet de sauvegarde à la fin de chacun de ses tours, mettant fin à l'effet qui l'affecte en cas de réussite."
            }

        ],
        image: 'https://www.aidedd.org/dnd/images/ghoul.jpg',
    },
    squelette: {
        name: "Squelette",
        maxHP: 13,
        currentHP: 13,
        ac: 13,
        xp: 50,
        stats: {
            force: 10,
            dexterite: 14,
            constitution: 15,
            intelligence: 6,
            sagesse: 8,
            charisme: 5,
        },
        attacks: [
            {
                name: "son Epee courte",
                type: "corps-à-corps",
                attackBonus: 4,
                reach: 1,
                targets: 1,
                damageDice: "1d6",
                damageBonus: 2,
                damageType: "perforant",
                description: "Attaque au corps à corps : +4 au toucher, allonge 1 m, une cible. Touché : 4 (1d4 + 2) dégâts perforants."
            }
        ],
        image: "https://www.aidedd.org/dnd/images/skeleton.jpg"
    },
    diablotin: {
        name: "Diablotin",
        maxHP: 10,
        currentHP: 10,
        ac: 13,
        xp: 200,
        stats: {
            force: 6,
            dexterite: 17,
            constitution: 13,
            intelligence: 11,
            sagesse: 12,
            charisme: 14,
        },
        attacks: [
            {

                name: "Dard",
                type: "corps-à-corps",
                attackBonus: 5,
                reach: 1,
                targets: 1,
                damageDice: "1d4",
                damageBonus: 3,
                damageType: "perforants",
                description: "Attaque au corps à corps : +4 au toucher, allonge 1 m, une cible. Touché : 4 (1d4 + 2) dégâts perforants."
            }

        ],
        image: "https://www.aidedd.org/dnd/images/imp.jpg"
    }
    ,
    diable: {
        name: "Diable épineux",
        maxHP: 22,
        currentHP: 22,
        ac: 13,
        xp: 450,
        stats: {
            force: 10,
            dexterite: 15,
            constitution: 12,
            intelligence: 11,
            sagesse: 14,
            charisme: 8,
        },
        attackSets: [
            {
                name: "Morsure et fourche",
                attacks: [
                    {
                        name: "Morsure",
                        type: "corps-à-corps",
                        attackBonus: 2,
                        damageDice: "2d4",
                        damageBonus: 0,
                        damageType: "tranchants",
                        description: "Attaque avec ces crocs aceres"
                    },
                    {
                        name: "Fourche",
                        type: "corps-à-corps",
                        attackBonus: 2,
                        damageDice: "1d6",
                        damageBonus: 0, // D'après la fiche, pas de bonus de dégâts
                        damageType: "perforants",
                        description: "Attaque avec une fourche"
                    }
                ]
            },
            {
                name: "Double épine caudale",
                attacks: [
                    {
                        name: "Épine caudale",
                        type: "distance",
                        attackBonus: 4,
                        damageDice: "1d4",
                        damageBonus: 2,
                        damageType: "perforants",
                        secondaryDamageDice: "1d6",
                        secondaryDamageBonus: 0,
                        secondaryDamageType: "feu",
                        description: "Projette une épine de sa queue"
                    },
                    {
                        name: "Épine caudale", // Une deuxième épine
                        type: "distance",
                        attackBonus: 4,
                        damageDice: "1d4",
                        damageBonus: 2,
                        damageType: "perforants",
                        secondaryDamageDice: "1d6",
                        secondaryDamageBonus: 0,
                        secondaryDamageType: "feu",
                        description: "Projette une épine de sa queue"
                    }
                ]
            }
        ],
        image: "https://www.aidedd.org/dnd/images/spined-devil.jpg"
    }
};