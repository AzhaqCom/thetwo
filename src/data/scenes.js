export const scenes = {
    "scene1": {
        text: `Tu es Elarion, un jeune magicien haut-elfe de la cité d’Ilveras. Tes cheveux argentés tombent en mèches fines autour de ton visage pâle et élégant, et tes yeux d’un bleu profond reflètent la curiosité insatiable qui t’anime.  
Tu portes une robe de mage bleu nuit, brodée de runes argentées qui scintillent à la lumière, et un sac contenant tes parchemins et tes instruments d’érudit.  
Ilveras est une cité ancienne, bâtie sur des falaises dominant la mer. Les tours de cristal de l’Académie des Arcanes s’élèvent au centre, tandis que les ruelles pavées, les fontaines chantantes et les jardins suspendus témoignent de la grandeur passée de ce royaume elfique.  
Aujourd’hui, tu te trouves dans la grande bibliothèque de l’Académie, le cœur de ton apprentissage. Les étagères s’étendent jusqu’au plafond, remplies de parchemins et de grimoires poussiéreux. Une étrange lueur émane d’un vieux manuscrit sur un pupitre isolé. L’air semble vibrer d’une magie ancienne.`,
        choices: [
            { text: "Approcher et lire le manuscrit", next: "scene2a" },
            { text: "Explorer les étagères à la recherche d’un savoir oublié", next: "scene2b" },
            { text: "Ignorer le manuscrit et sortir dans les jardins de l’académie", next: "scene2c" }
        ]
    },
    "scene2a": {
        text: `La page s’écrit sous tes yeux. Un symbole brûlant se grave sur ta paume. Tu perds connaissance quelques instants.  
À ton réveil, le manuscrit est fermé et tout semble calme, mais ton esprit est étrangement éveillé.`,
        choices: [
            { text: "Continuer l'exploration de la bibliothèque", next: "scene3" }
        ]
    },
    "scene2b": {
        text: `En fouillant les étagères, tu trouves un ancien parchemin. Tu le range alors dans ta sacoche.`,
        choices: [
            { text: "Prendre le parchemin et continuer", next: {
                type: "item",
                item: "scrollOfIntelligence", // Le nom de l'objet à donner
                nextScene: "scene3"
            } }
        ]
    },
    "scene2c": {
        text: `Tu ignores le manuscrit et sors dans les jardins suspendus de l’académie. L’air est frais et les fleurs exhalent un parfum mystérieux.  
Cependant, une étrange sensation de chaleur sur ta main gauche te fait découvrir un symbole magique gravé dans ta paume.`,
        choices: [
            { text: "Continuer vers la sortie de l'académie", next: "scene3" }
        ]
    },
    "scene3": {
        text: `Alors que tu quittes l'académie, la route se rétrécit et deux gobelins surgissent d’un buisson, armes brandies !`,
        choices: [
            {
                text: "En Garde !",
                action: (onChoice) => {
                    // On passe un objet qui décrit la rencontre
                    onChoice({
                        type: 'combat',
                        enemies: [
                            { type: 'gobelin', count: 2 }
                        ], next: 'scene4'
                    });
                }
            }
        ]
    },
    "scene4": {
        text: `Après le combat, tu arrives dans une clairière tranquille avec une fontaine cristalline. L'endroit est parfait pour un court repos ou pour méditer.`,
        choices: [
            // CORRECTION : on utilise maintenant un objet action pour le repos court
            {
                text: "Faire un repos court",
                action: { type: 'shortRest', nextScene: "scene5" }
            },
            { text: "Continuer l'exploration", next: "scene5" }
        ]
    },
    "scene5": {
        text: `Tu pénètres dans une forêt mystérieuse. Des murmures magiques semblent flotter dans l’air. Deux chemins se présentent devant toi : l'un plus sombre, l'autre bordé de fleurs luminescentes.`,
        choices: [
            { text: "Prendre le chemin sombre", next: "scene6a" },
            { text: "Prendre le chemin lumineux", next: "scene6b" }
        ]
    },
    "scene6a": {
        text: `Le chemin sombre te mène à un cercle de pierres anciennes, gravées de runes incompréhensibles. Une énigme semble t’attendre.`,
        choices: [
            { text: "Essayer de résoudre l'énigme", next: "scene7" },
            { text: "Contourner le cercle", next: "scene7" }
        ]
    },
    "scene6b": {
        text: `Le chemin lumineux te conduit à une clairière remplie de fleurs qui émettent une lueur douce. Soudain, un piège magique se déclenche, envoyant des éclairs autour de toi !`,
        choices: [
            { text: "Esquiver les éclairs", next: "scene7" }
        ]
    },
    "scene7": {
        text: `Tu découvres un petit trésor dissimulé : une potion de soins et un parchemin contenant un sort offensif de niveau 1.`,
        choices: [
            { text: "Prendre le trésor et continuer", next: "scene8" }
        ]
    },
    "scene8": {
        text: `Un jeune apprenti mage apparaît. Il te propose de l’accompagner pour trouver une relique perdue dans les ruines de l’ancienne cité.`,
        choices: [
            { text: "Accepter la proposition", next: "scene9" },
            { text: "Refuser et continuer seul", next: "scene9" }
        ]
    },
    "scene9": {
        text: `Tu arrives aux ruines anciennes. L’air est chargé de magie. Les murs effondrés laissent deviner d’anciens secrets.`,
        choices: [
            { text: "Explorer les ruines", next: "scene10" },
            { text: "continuer ma route", next: "scene12" }
        ]
    },
    "scene10": {
        text: `Une créature magique mineure surgit ! Un kobold spectral t’attaque.`,
        choices: [
            {
                text: "Engager le combat",
                action: (onChoice) => {
                    // On passe un objet qui décrit la rencontre
                    onChoice({
                        type: 'combat',
                        enemies: [
                            { type: 'kobold', count: 1 }
                        ], next: 'scene11'
                    });
                }
            }
        ]
    },
    "scene11": {
        text: `Après le combat, tu installes un camp improvisé pour un court repos.`,
        choices: [

            {
                text: "Faire un repos court",
                action: { type: 'shortRest', nextScene: "scene12" }
            },
            { text: "Continuer l'exploration", next: "scene12" }
        ]
    },
    "scene12": {
        text: `En continuant, tu découvres un artefact ancien qui augmente temporairement ton intelligence.`,
        choices: [
            { text: "Prendre l'artefact", next: "scene13" }
        ]
    },
    "scene13": {
        text: `Un sentier mène à une caverne mystérieuse. L’air est épais et chargé de magie.`,
        choices: [

            {
                text: "Faire un repos long avant d'entrer",
                action: { type: 'longRest', nextScene: "scene14" }
            }
        ]
    },
    "scene14": {
        text: `Deux gobelins surgissent des ombres pour t'attaquer.`,
        choices: [
            {
                text: "Engager le combat",
                action: (onChoice) => {
                    onChoice({
                        type: 'combat',
                        enemies: [
                            { type: 'gobelin', count: 2 }
                        ], next: 'scene15'
                    });
                }
            }
        ]
    },
    "scene15": {
        text: `Après le combat, tu trouves un lac magique parfait pour un repos long.`,
        choices: [
            // CORRECTION : on utilise maintenant un objet action pour le repos long
            { text: "Faire un repos long", action: { type: 'longRest', nextScene: "scene16" } },
            { text: "Continuer l'exploration", next: "scene16" }
        ]
    },
    "scene16": {
        text: `Tu explores un ancien temple avec des runes mystiques gravées dans les murs.`,
        choices: [
            { text: "Étudier les runes", next: "scene17" },
            { text: "Ignorer et avancer", next: "scene17" }
        ]
    },
    "scene17": {
        text: `Un Diable épineux apparaît pour tester ta maîtrise des sorts.`,
        choices: [
            {
                text: "Combattre le Diable épineux",
                action: (onChoice) => {
                    onChoice({
                        type: 'combat',
                        enemies: [
                            { type: 'diable', count: 1 }
                        ],
                        next: "scene18"
                    });
                }
            }
        ]
    },
    "scene18": {
        text: `Après la bataille, tu trouves des parchemins rares contenant des sorts offensifs.`,
        choices: [
            { text: "Prendre les parchemins", next: "scene19" }
        ]
    },
    "scene19": {
        text: `Un maître de l'académie te retrouve et t'accorde un bonus pour ton apprentissage. Ton intelligence et ton dextérité augmentent légèrement.`,
        choices: [
            { text: "Remercier le maître et continuer", next: "scene20" }
        ]
    },
    "scene20": {
        text: `Le prologue se termine. Tu es prêt à partir pour de nouvelles aventures, fort de ton apprentissage et de tes découvertes.`,
        choices: [
            { text: "Commencer l'aventure principale", next: "prologue-end" }
        ]
    }
};

