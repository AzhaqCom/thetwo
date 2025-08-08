export const scenes = {
    "scene1": {
        text: `Tu es Elarion, un jeune magicien haut-elfe de la cité d'Ilveras. Tes cheveux argentés tombent en mèches fines autour de ton visage pâle et élégant, et tes yeux d'un bleu profond reflètent la curiosité insatiable qui t'anime. 
Tu portes une robe de mage bleu nuit, brodée de runes argentées qui scintillent à la lumière, et un sac contenant tes parchemins et tes instruments d'érudit. 
Ilveras est une cité ancienne, bâtie sur des falaises dominant la mer. Les tours de cristal de l'Académie des Arcanes s'élèvent au centre, tandis que les ruelles pavées, les fontaines chantantes et les jardins suspendus témoignent de la grandeur passée de ce royaume elfique. 
Aujourd'hui, tu te trouves dans la grande bibliothèque de l'Académie, le cœur de ton apprentissage. Les étagères s'étendent jusqu'au plafond, remplies de parchemins et de grimoires poussiéreux. Une étrange lueur émane d'un vieux manuscrit sur un pupitre isolé. L'air semble vibrer d'une magie ancienne.`,
        choices: [
            { text: "Approcher et lire le manuscrit", next: "scene2a" },
            { text: "Explorer les étagères à la recherche d'un savoir oublié", next: "scene2b" },
            { text: "Ignorer le manuscrit et sortir dans les jardins de l'académie", next: "scene2c" }
        ]
    },
    "scene2a": {
        text: `La page s'écrit sous tes yeux. Un symbole brûlant se grave sur ta paume. Tu perds connaissance quelques instants. 
À ton réveil, le manuscrit est fermé et tout semble calme, mais ton esprit est étrangement éveillé.`,
        choices: [
            { text: "Continuer l'exploration de la bibliothèque", next: "scene3" }
        ]
    },
    "scene2b": {
        text: `En fouillant les étagères, tu trouves un ancien parchemin qui semble te murmurer des secrets. Il est d'une grande valeur pour un érudit comme toi.`,
        choices: [
            {
                text: "Prendre le parchemin et continuer",
                next: { type: "item", item: "scrollOfIntelligence", nextScene: "scene3" }
            }
        ]
    },
    "scene2c": {
        text: `Tu ignores le manuscrit et sors dans les jardins suspendus de l'académie. L'air est frais et les fleurs exhalent un parfum mystérieux. 
Cependant, une étrange sensation de chaleur sur ta main gauche te fait découvrir un symbole magique gravé dans ta paume.`,
        choices: [
            { text: "Continuer vers la sortie de l'académie", next: "scene3" }
        ]
    },
    "scene3": {
        text: `Alors que tu quittes l'académie, la route se rétrécit et deux gobelins, au sourire dément, surgissent d'un buisson, armes brandies ! Ils semblent prêts à en découdre.`,
        choices: [
            {
                text: "En Garde !",
                action: {
                    type: 'combat',
                    enemies: [{ type: 'gobelin', count: 2 }],
                    next: 'scene4'
                }
            }
        ]
    },
    "scene4": {
        text: `Après le combat, tu arrives dans une clairière tranquille avec une fontaine cristalline qui chante doucement. L'endroit est parfait pour un court repos ou pour méditer.`,
        choices: [
            {
                text: "Faire un repos court (récupère des PV)",
                action: { type: 'shortRest', nextScene: "scene5" }
            },
            { text: "Continuer l'exploration", next: "scene5" }
        ]
    },
    "scene5": {
        text: `Tu pénètres dans une forêt mystérieuse. Des murmures magiques semblent flotter dans l'air, des créatures invisibles t'observent. Deux chemins se présentent devant toi : l'un plus sombre et escarpé, l'autre bordé de fleurs luminescentes.`,
        choices: [
            { text: "Prendre le chemin sombre", next: "scene6" },
            { text: "Prendre le chemin lumineux", next: "scene6" }
        ]
    },
    "scene6": {
        text: `En arrivant devant un pont ancien, tu aperçois un symbole gravé dans la pierre. Il représente un blason oublié de la fondation de l'Académie, mais l'histoire derrière ce symbole a été perdue au fil du temps.`,
        choices: [
            {
                text: "Essayer de se souvenir de l'histoire du blason",
                action: {
                    type: 'skillCheck',
                    skill: 'histoire',
                    dc: 15,
                    onSuccess: "scene6a",
                    onPartialSuccess: "scene6b",
                    onFailure: "scene6c"
                }
            },
            {
                text: "Ignorer le blason et traverser le pont",
                next: "scene7"
            }
        ]
    },
    "scene6a": {
        text: `Grâce à tes vastes connaissances, tu te souviens parfaitement que ce blason appartient à l'un des fondateurs originels de l'Académie, un mage excentrique qui a scellé un passage secret derrière le pont. Tu découvres un mécanisme caché et un passage s'ouvre, révélant un coffre.`,
        choices: [
            {
                text: "Ouvrir le coffre",
                next: { type: "item", item: "potionVieSup", nextScene: "scene7" }
            }
        ]
    },
    "scene6b": {
        text: `Tu te souviens que ce blason est lié aux fondateurs de l'Académie, mais tu ne parviens pas à te souvenir des détails précis. En tâtonnant autour de la pierre, tu sens une légère vibration, mais tu ne parviens pas à activer le mécanisme. Tu continues ton chemin.`,
        choices: [
            {
                text: "Continuer l'exploration",
                next: "scene7"
            }
        ]
    },
    "scene6c": {
        text: `Le blason ne te dit absolument rien. En touchant la pierre, une décharge électrique te parcourt, te laissant un peu étourdi. Il vaut mieux ne pas insister et continuer.`,
        choices: [
            {
                text: "Continuer l'exploration",
                next: "scene7"
            }
        ]
    },
    "scene7": {
        text: `Après avoir traversé le pont, tu découvres un petit trésor dissimulé dans une crevasse : une potion de soins et un parchemin d'Intelligence'.`,
        choices: [
            {
                text: "Les ranger dans mon sac !",
                next: {
                    type: "item",
                    item: ["potionOfHealing", "scrollOfIntelligence"],
                    nextScene: "scene8"
                }
            }
        ]
    },
    "scene8": {
        text: `Un jeune apprenti mage, l'air perdu, apparaît sur ton chemin. Il te propose de l'accompagner pour trouver une relique perdue dans les ruines de l'ancienne cité. Tu sens qu'il a besoin d'aide.`,
        choices: [
            {
                text: "Accepter la proposition",
                next: {
                    type: "ally",
                    ally: "Tyrion",
                    nextScene: "scene9"
                }
            },

        ]
    },
    "scene9": {
        text: `Tu arrives aux ruines anciennes, où les murs effondrés laissent deviner d'anciens secrets. L'air est chargé de magie, mais aussi d'une étrange odeur de mort.`,
        choices: [
            { text: "Explorer les ruines", next: "scene10" },
            { text: "Continuer ma route", next: "scene12" }
        ]
    },
    "scene10": {
        text: `Une créature tout droit venue des profondeurs apparaît ! Une goule assoifée de sang t'attaque, accompagnée de deux squelettes. L'odeur de décomposition est insoutenable.`,
        choices: [
            {
                text: "Engager le combat",
                action: {
                    type: 'combat',
                    enemies: [

                        { type: 'squelette', count: 2 }
                    ],
                    next: 'scene11'
                }
            }
        ]
    },
    "scene11": {
        text: `Après le combat, tu trouves un endroit relativement sûr pour t'installer. C'est l'occasion de te remettre de tes blessures et de reprendre ton souffle.`,
        choices: [
            {
                text: "Faire un repos court (récupère des PV)",
                action: { type: 'shortRest', nextScene: "scene12" }
            },
            {
                text: "Faire un repos long (récupère tous les PV et les ressources de classe)",
                action: { type: 'longRest', nextScene: "scene12" }
            }
        ]
    },
    "scene12": {
        text: `En continuant ton chemin, tu découvres un artefact ancien. C'est un Parchemin de Vitalité qui augmente la résistance de celui qui le lit.`,
        choices: [
            {
                text: "Prendre le parchemin",
                next: { type: "item", item: "scrollOfConstitution", nextScene: "scene13" }
            }
        ]
    },
    "scene13": {
        text: `Un sentier mène à une caverne mystérieuse. L'air est épais et chargé de magie. Une odeur de souffre en émane. Tu sens qu'il a un danger imminent.`,
        choices: [
            {
                text: "Essayer de percevoir le danger",
                action: {
                    type: 'skillCheck',
                    skill: 'perception',
                    dc: 14,
                    onSuccess: "scene13a",
                    onPartialSuccess: "scene13b",
                    onFailure: "scene13c"
                }
            },
            {
                text: "Rentrer dans la caverne",
                next: "scene14"
            }
        ]
    },
    "scene13a": {
        text: `Grâce à ton ouie fine d'elfe et a tes sens alerte, tu as entendu des bruits de pas et des chuchotements provenant de l'intérieur de la caverne. Tu te prépares à un combat imminent.`,
        choices: [
            {
                text: "Se tenir pret",
                next: { type: "item", item: "scrollOfSagesse", nextScene: "scene14" }
            }
        ]
    },
    "scene13b": {
        text: `Tu entends des bruits étranges venant de la caverne, mais tu ne peux pas identifier clairement le danger. Tu décides de rester sur tes gardes.`,
        choices: [
            {
                text: "Rentrer dans la caverne",
                next: "scene14"
            }
        ]
    },
    "scene13c": {
        text: `Hélas, tu n'entends rien de suspect. Tu te sens un peu imprudent, mais tu décides de continuer malgré tout.`,
        choices: [
            {
                text: "Rentrer dans la caverne",
                next: "scene14"
            }
        ]
    },
    "scene14": {
        text: `À l'intérieur de la caverne, deux diablotins surgissent des ombres tout feu tout flammes pour t'attaquer. Ils gardent l'entrée de la salle principale.`,
        choices: [
            {
                text: "Engager le combat",
                action: {
                    type: 'combat',
                    enemies: [{ type: 'diablotin', count: 2 }],
                    next: 'scene15'
                }
            }
        ]
    },
    "scene15": {
        text: `Après le combat, tu trouves un lac magique qui scintille dans l'obscurité. L'endroit est parfait pour te régénérer complètement.`,
        choices: [
            {
                text: "Faire un repos long (récupère tous les PV et les ressources de classe)",
                action: { type: 'longRest', nextScene: "scene16" }
            },
            { text: "Continuer l'exploration", next: "scene16" }
        ]
    },
    "scene16": {
        text: `Tu explores un ancien temple avec des runes mystiques gravées dans les murs. Tu sens une énergie démoniaque émaner d'une des runes.`,
        choices: [
            { text: "Étudier les runes", next: "scene17" },
            { text: "Ignorer et avancer", next: "scene17" }
        ]
    },
    "scene17": {
        text: `Un Diable épineux apparaît pour tester ta maîtrise des sorts. Il te défie d'un regard brûlant.`,
        choices: [
            {
                text: "Combattre le Diable épineux",
                action: {
                    type: 'combat',
                    enemies: [{ type: 'diable', count: 1 }],
                    next: "scene18"
                }
            }
        ]
    },
    "scene18": {
        text: `Après la bataille, tu trouves un parchemin améliorant ton agilité, ainsi que des notes sur l'art de la prestidigitation.`,
        choices: [
            {
                text: "Prendre les parchemins",
                next: { type: "item", item: ["scrollOfDexterity", "bookArtHeal"], nextScene: "scene19" }
            }
        ]
    },
    "scene19": {
        text: `Un maître de l'académie te retrouve, impressionné par tes exploits. Il t'accorde un bonus pour ton apprentissage. Ton intelligence et ta dextérité augmentent légèrement.`,
        choices: [
            {
                text: "Prendre les parchemins",
                next: { type: "item", item: ["scrollOfDexterity", "scrollOfIntelligence"], nextScene: "scene20" }
            }
        ]
    },
    "scene20": {
        text: `Le prologue se termine. Tu es prêt à partir pour de nouvelles aventures, fort de ton apprentissage et de tes découvertes.`,
        choices: [
            { text: "Commencer l'aventure principale", next: "scene1" }
        ]
    }
};
