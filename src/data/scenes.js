export const scenes = {
    "scene1": {
        text: `Tu es Elarion, un jeune magicien haut-elfe de la cité d'Ilveras. Tes cheveux argentés tombent en mèches fines autour de ton visage pâle et élégant, et tes yeux d'un bleu profond reflètent la curiosité insatiable qui t'anime. Tu portes une robe de mage bleu nuit, brodée de runes argentées, et un sac rempli de tes parchemins.

Ilveras est une cité ancienne, bâtie sur des falaises dominant la mer. Les tours de cristal de l'Académie des Arcanes s'élèvent au centre, tandis que les ruelles pavées et les jardins suspendus témoignent de la grandeur passée de ce royaume elfique.

Récemment, tu as entendu des murmures concernant une ancienne prophétie liée à un "symbole perdu" qui pourrait détenir la clé d'un pouvoir immense. Ces murmures t'ont mené à la grande bibliothèque de l'Académie, le cœur de ton apprentissage. En explorant les rangées d'étagères, une étrange lueur émane d'un vieux manuscrit sur un pupitre isolé. L'air vibre d'une magie ancienne, et tu sens une forte connexion avec cet objet.`,
        choices: [
            { text: "Approcher et lire le manuscrit", next: "scene2a" },
            { text: "Explorer les étagères à la recherche d'un savoir oublié", next: "scene2b" },
            { text: "Ignorer le manuscrit et sortir dans les jardins de l'académie", next: "scene2c" }
        ]
    },
    "scene2a": {
        text: `Tu t'approches du manuscrit. Au moment où tu le touches, une page s'efface sous tes yeux et un symbole brûlant se grave sur ta paume. La douleur est si intense que tu perds connaissance quelques instants. À ton réveil, le manuscrit est fermé, mais ton esprit est étrangement éveillé. Tu comprends instinctivement que ce symbole est la clé de la prophétie. La piste la plus prometteuse pour découvrir sa signification se trouve à Meresnya, la grande cité marchande, connue pour ses érudits et ses archives millénaires.`,
        choices: [
            { text: "Préparer ton voyage vers Meresnya", next: "scene3" }
        ]
    },
    "scene2b": {
        text: `En fouillant les étagères, tu trouves un ancien parchemin qui semble te murmurer des secrets. Il est d'une grande valeur pour un érudit comme toi. Soudain, le manuscrit que tu as vu plus tôt attire ton attention à nouveau, il se met à léviter doucement au-dessus du pupitre. Le symbole de la prophétie apparaît sur la couverture. Le parchemin que tu as en main te révèle alors que la seule personne qui peut t'aider est un mystérieux maître de la ville de Meresnya.`,
        choices: [
            {
                text: "Prendre le parchemin et commencer le voyage",
                next: { type: "item", item: "scrollOfIntelligence", nextScene: "scene3" }
            }
        ]
    },
    "scene2c": {
        text: `Tu ignores le manuscrit et sors dans les jardins suspendus de l'académie. L'air est frais et les fleurs exhalent un parfum mystérieux. Cependant, une étrange sensation de chaleur sur ta main gauche te fait découvrir un symbole magique gravé dans ta paume. Tu réalises que c'est un signe, lié à la prophétie que tu étudiais. Un vent soudain murmure le nom de "Meresnya", et tu comprends que c'est là que tu dois te rendre pour percer son secret.`,
        choices: [
            { text: "Préparer ton voyage vers Meresnya", next: "scene3" }
        ]
    },
    "scene3": {
        text: `Alors que tu quittes l'enceinte sacrée de l'académie pour la route menant à la grande cité de Meresnya, le sentier se rétrécit brusquement. Deux gobelins à la peau vert-de-gris et aux sourires déments surgissent d'un buisson, leurs armes de fortune brandies. Ils grognent et s'avancent vers toi, prêts à en découdre.`,
        choices: [
            {
                text: "Dégainer ton arme et te défendre !",
                action: {
                    type: 'combat',
                    enemies: [{ type: 'gobelin', count: 2 }],
                    next: 'scene4'
                }
            }
        ]
    },
    "scene4": {
        text: `Après avoir repoussé les gobelins, tu continues ta route, ton cœur battant encore la chamade. Tu arrives bientôt dans une clairière baignée de soleil. Au centre, une fontaine cristalline chante doucement, ses eaux pures glissant sur la pierre usée. C'est un endroit paisible, parfait pour faire une courte pause et reprendre ton souffle.`,
        choices: [
            {
                text: "Faire un court repos pour soigner tes blessures",
                action: { type: 'shortRest', nextScene: "scene5" }
            },
            { text: "Continuer l'exploration sans t'arrêter", next: "scene5" }
        ]
    },
    "scene5": {
        text: `Tu pénètres dans la Forêt de Murmures, un bois ancien et mystérieux où les arbres centenaires tordent leurs branches comme des doigts crochus. Des murmures magiques semblent flotter dans l'air, et tu as l'impression que des créatures invisibles t'observent. Le sentier se divise en deux. L'un, sombre et escarpé, s'enfonce entre les arbres, tandis que l'autre est bordé de fleurs luminescentes, créant une lueur apaisante.`,
        choices: [
            { text: "Prendre le chemin sombre", next: "scene6" },
            { text: "Prendre le chemin lumineux", next: "scene6" }
        ]
    },
    "scene6": {
        text: `Peu importe le chemin choisi, tu arrives devant un ancien pont de pierre, enjambant un torrent tumultueux. Un symbole étrangement familier est gravé dans la pierre. Il représente un blason oublié, celui d'un des fondateurs de l'Académie des Arcanes, dont l'histoire a été perdue au fil du temps. Le symbole sur ta paume semble réagir, émettant une faible chaleur.`,
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
        text: `Grâce à tes vastes connaissances académiques, tu te souviens parfaitement que ce blason appartient à l'un des fondateurs originels de l'Académie, un mage excentrique qui a scellé un passage secret derrière le pont. En observant attentivement la pierre, tu découvres un mécanisme caché. Le symbole sur ta main s'illumine au moment où tu l'actives, et un passage s'ouvre, révélant un coffre.`,
        choices: [
            {
                text: "Ouvrir le coffre",
                next: { type: "item", item: "potionVieSup", nextScene: "scene7" }
            }
        ]
    },
    "scene6b": {
        text: `Tu te souviens que ce blason est lié aux fondateurs de l'Académie, mais tu ne parviens pas à te souvenir des détails précis. En touchant la pierre, tu sens une légère vibration qui résonne avec le symbole sur ta main, mais tu ne parviens pas à activer le mécanisme. Tu n'as d'autre choix que de continuer ton chemin.`,
        choices: [
            {
                text: "Continuer l'exploration",
                next: "scene7"
            }
        ]
    },
    "scene6c": {
        text: `Le blason ne te dit absolument rien. En touchant la pierre, une décharge électrique te parcourt, te laissant un peu étourdi. Le symbole sur ta main reste silencieux. Il vaut mieux ne pas insister et continuer ton chemin.`,
        choices: [
            {
                text: "Continuer l'exploration",
                next: "scene7"
            }
        ]
    },
    "scene7": {
        text: `Après avoir traversé le pont, tu longes le torrent. Tu remarques un petit trésor dissimulé dans une crevasse : une fiole de potion de soins et un ancien parchemin. Le parchemin brille d'une faible lueur magique, tu sens qu'il pourrait améliorer tes capacités.`,
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
        text: `Un jeune guerrier au regard déterminé apparaît sur ton chemin. Il se nomme Tyrion. Il porte une armure de cuir souple usée par les voyages et te propose de l'accompagner vers les ruines de Valdoria, une ancienne cité maudite, pour y chercher une relique perdue de son ordre. Tu sens qu'il a besoin d'aide, et son chemin pourrait également t'en apprendre plus sur le mystérieux symbole gravé sur ta main.`,
        choices: [
            {
                text: "Accepter la proposition et faire équipe avec Tyrion",
                next: {
                    type: "ally",
                    ally: "Tyrion",
                    nextScene: "scene9"
                }
            },
            {
                text: "Refuser l'offre et continuer seul",
                next: "scene9"
            }
        ]
    },
    "scene9": {
        text: "Après des heures de marche, tu arrives devant les ruines anciennes de Valdoria, un lieu chargé d'histoire et de légendes. Les vestiges de ce qui fut autrefois une cité majestueuse s'étendent à perte de vue, des murs effondrés et des arches brisées se dressant comme les squelettes d'un géant endormi. L'air, étrangement immobile, est imprégné de l'odeur de la pierre humide, de la terre et d'un effluve métallique qui te glace le sang : le parfum de la mort. Une aura magique palpable émane de l'ensemble du site, comme si les échos des sorts passés continuaient de vibrer dans le silence. Deux chemins s'offrent à toi : l'un s'enfonce dans les entrailles des ruines, l'autre contourne prudemment la zone.",
        choices: [
            { text: "T'aventurer plus profondément dans les ruines", next: "scene10" },
            { text: "Continuer ton chemin et contourner les ruines", next: "scene12" }
        ]
    },
    "scene10": {
        text: "Ignorant les avertissements de ton instinct, tu t'engages dans l'allée principale des ruines. Les bâtiments, réduits à l'état de carcasses de pierre, te rappellent des histoires oubliées de batailles et de puissantes magies. Soudain, un craquement macabre brise le silence. Deux silhouettes squelettiques, animées par une force obscure, émergent des décombres d'une ancienne taverne. Leurs os jaunis par le temps, leurs orbites vides fixées sur toi, elles brandissent des épées rouillées. Ces gardiens d'outre-tombe semblent prêts à défendre ce lieu jusqu'à ce que leurs derniers os tombent en poussière.",
        choices: [
            {
                text: "Préparer ton arme et te défendre !",
                action: {
                    type: 'combat',
                    enemies: [
                        { type: 'squelette', count: 2 }
                    ],
                    enemyPositions: [
                        { x: 6, y: 1 },  // Premier squelette
                        { x: 7, y: 2 }   // Deuxième squelette
                    ],
                    next: 'scene11'
                }
            }
        ]
    },
    "scene11": {
        text: "Après un combat acharné contre les gardiens d'outre-tombe, tu parviens à les vaincre. Leurs ossements s'effondrent sur le sol en une poignée de poussière. Le silence revient, encore plus lourd qu'avant. Tu décides de fouiller les restes de la taverne et découvres, caché sous une dalle brisée, un coffre vermoulu. À l'intérieur, un peu d'or et une fiole de potion de soin. Mais surtout, une ancienne carte partiellement brûlée indique le chemin vers une crypte située plus loin dans les ruines. C'est peut-être la piste qui te mènera à la vérité sur le symbole.",
        choices: [
            {
                text: "Prendre les objets et suivre le chemin de la crypte",
                next: { type: "item", item: "potionOfHealing", nextScene: "scene13" }
            },
            {
                text: "Ignorer la carte et faire demi-tour",
                next: "scene12"
            }
        ]
    },
    "scene12": {
        text: "Tu décides de ne pas t'attarder dans cet endroit lugubre et fais le tour des ruines. Le chemin est long et parsemé d'embûches naturelles, mais tu évites le combat. Finalement, tu rejoins la route principale. Tu as l'impression d'avoir évité un danger, mais aussi d'avoir laissé derrière toi un secret bien gardé. Le murmure des ruines s'éloigne derrière toi, et tu continues ta route vers la prochaine étape.",
        choices: [
            {
                text: "Continuer l'aventure",
                next: "scene13"
            }
        ]
    },
    "scene13": {
        text: `Un sentier mène à une caverne mystérieuse, dont l'entrée est masquée par un rideau de lierre. L'air qui en émane est épais et chargé de magie, avec une légère odeur de souffre. Tu sens une présence malveillante et un danger imminent qui t'attirent, comme si le mystère du symbole de ta main était lié à ce lieu.`,
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
                text: "Rentrer directement dans la caverne",
                next: "scene14"
            }
        ]
    },
    "scene13a": {
        text: `Grâce à tes sens d'elfe aiguisés et à ta concentration, tu perçois clairement des bruits de pas et des chuchotements venant de l'intérieur de la caverne. Tu sens que des créatures t'attendent à l'affût, prêtes à bondir. Le symbole sur ta paume s'illumine et une potion de sagesse tombe à tes pieds. Tu te prépares à un combat imminent.`,
        choices: [
            {
                text: "Se tenir prêt",
                next: { type: "item", item: "scrollOfSagesse", nextScene: "scene14" }
            }
        ]
    },
    "scene13b": {
        text: `Tu entends des bruits étranges venant de la caverne, comme des raclements de pierre et des chuchotements lointains, mais tu ne peux pas identifier clairement le danger. Tu décides de rester sur tes gardes, sans savoir exactement à quoi t'attendre.`,
        choices: [
            {
                text: "Rentrer dans la caverne",
                next: "scene14"
            }
        ]
    },
    "scene13c": {
        text: `Malgré tes efforts, tu n'entends rien de suspect. Le silence de la caverne te semble trompeur. Tu te sens un peu imprudent, mais tu décides de continuer malgré tout, le symbole sur ta main te brûlant légèrement.`,
        choices: [
            {
                text: "Rentrer dans la caverne",
                next: "scene14"
            }
        ]
    },
    "scene14": {
        text: `À l'intérieur de la caverne, l'odeur de soufre est plus forte. Deux diablotins surgissent des ombres, tout feu tout flamme, leurs corps de créatures infernales s'agitant de rage. Ils gardent l'entrée de la salle principale et se jettent sur toi, prêts à t'attaquer.`,
        choices: [
            {
                text: "Engager le combat",
                action: {
                    type: 'combat',
                    enemies: [{ type: 'diablotin', count: 2 }],
                    enemyPositions: [
                        { x: 5, y: 0 },  // Premier diablotin
                        { x: 6, y: 1 }   // Deuxième diablotin
                    ],
                    next: 'scene15'
                }
            }
        ]
    },
    "scene15": {
        text: `Après le combat, tu trouves un lac magique qui scintille dans l'obscurité. Ses eaux émettent une lumière bleutée et les vapeurs qui s'en échappent apaisent ton esprit. L'endroit est parfait pour te régénérer complètement et panser tes blessures.`,
        choices: [
            {
                text: "Faire un repos long (récupère tous les PV et les ressources de classe)",
                action: { type: 'longRest', nextScene: "scene16" }
            },
            { text: "Continuer l'exploration", next: "scene16" }
        ]
    },
    "scene16": {
        text: `Ressourcé, tu explores un ancien temple caché au fond de la caverne. Des runes mystiques sont gravées dans les murs, émettant une énergie sombre mais fascinante. L'une d'elles, en particulier, semble vibrer en harmonie avec le symbole sur ta main, dégageant une forte énergie démoniaque.`,
        choices: [
            { text: "Étudier les runes", next: "scene17" },
            { text: "Ignorer et avancer", next: "scene17" }
        ]
    },
    "scene17": {
        text: `Au centre du temple, un Diable épineux, une créature démoniaque à l'apparence de reptile, apparaît dans un nuage de fumée. Il se tient droit et t'observe, ses yeux brûlants te fixant intensément. D'une voix caverneuse, il te défie, voulant tester ta maîtrise des sorts et ton courage.`,
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
        text: `La bataille est intense, mais tu parviens à vaincre la créature. Alors qu'elle disparaît en poussière, tu trouves un parchemin de l'agilité qui renforce ta dextérité, ainsi que des notes sur l'art de la prestidigitation, laissées par un ancien mage qui a peut-être lui aussi combattu le Diable épineux.`,
        choices: [
            {
                text: "Prendre les parchemins",
                next: { type: "item", item: ["scrollOfDexterity", "bookArtHeal"], nextScene: "scene19" }
            }
        ]
    },
    "scene19": {
        text: `Alors que tu te prépares à quitter le temple, la voix d'un de tes maîtres de l'académie résonne dans la caverne. Il te retrouve, impressionné par tes exploits et le chemin que tu as parcouru seul. Il te révèle que le symbole est la clef d'un ancien pouvoir, mais que de grands dangers t'attendent. Il te remet une dernière aide avant que vos chemins se séparent.`,
        choices: [
            {
                text: "Accepter l'aide du Maître",
                next: { type: "item", item: ["scrollOfDexterity", "scrollOfIntelligence"], nextScene: "scene20" }
            }
        ]
    },
    "scene20": {
        text: `Après un dernier échange, ton Maître te fait ses adieux. Tu quittes le temple et la caverne, laissant derrière toi les ruines de Valdoria. Le chemin vers Meresnya est long, et la route s'étend devant toi sous un ciel crépusculaire. Le symbole sur ta paume émet une douce chaleur, comme une boussole interne te guidant vers ton destin. Tu t'engages sur la grande route, le cœur rempli d'une nouvelle détermination.`,
        choices: [
            { text: "Continuer le voyage", next: "scene21" }
        ]
    },
    "scene21": {
        text: `Le lendemain, après une nuit de marche, tu arrives à une auberge isolée au carrefour de deux routes. L'auberge "Le Dragon Endormi" est un refuge pour les voyageurs fatigués. À l'intérieur, un vieil homme aux yeux vifs te propose une carte. Il te dit que la route principale est plus sûre mais plus longue, tandis qu'un sentier à travers les Marais de la Lune est plus court, mais rempli de bêtes et de dangers.`,
        choices: [
            { text: "Prendre la route principale (plus sûre, mais plus longue)", next: "scene22" },
            { text: "Prendre le sentier des Marais (plus courte, mais plus dangereuse)", next: "scene23" }
        ]
    },
    "scene22": {
        text: `Tu décides de prendre la route principale, plus longue mais plus sûre. Après une journée de marche paisible, tu arrives sans encombre aux portes de Meresnya. La cité est immense, ses murs de marbre blanc s'élèvent majestueusement, et l'animation de la ville se fait déjà entendre.`,
        choices: [
            { text: "Entrer dans la cité", next: "scene24" }
        ]
    },
    "scene23": {
        text: `Tu t'engages sur le sentier des Marais de la Lune. L'air est lourd et humide, et une brume persistante enveloppe les lieux. Soudain, un bruit de frottement se fait entendre, et une Créature de la Boue, une masse informe de terre et de vase, se dresse devant toi, ses yeux luisants de malice. Elle t'attaque !`,
        choices: [
            {
                text: "Combattre la Créature de la Boue",
                action: {
                    type: 'combat',
                    enemies: [{ type: 'mephiteBoueux', count: 1 }],
                    next: 'scene24'
                }
            }
        ]
    },
    "scene24": {
        text: `Tu te retrouves enfin aux portes de Meresnya. La cité s'étend devant toi, une métropole bouillonnante de vie. Des marchands crient leurs offres, des mages échangent des secrets, et l'architecture grandiose témoigne de la richesse et du savoir qui s'y trouvent. Le symbole sur ta main t'indique que tu es au bon endroit. Ta quête pour percer son mystère peut enfin commencer.`,
        choices: [
            { text: "Chercher un érudit pour t'aider", next: "scene1" }
        ]
    }
};
