/**
 * Scénario: Les Gardiens de la Lame Éternelle
 * Une aventure complète avec héritage familial, mystères planaires et choix moraux
 */

import { SCENE_TYPES } from '../types/story';

export const newScenes = {
  // === PROLOGUE : L'HÉRITAGE MAUDIT ===

  "introduction": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "prologue",
      tags: ["intro", "heritage", "mystery"],
      title: "L'Héritage Inattendu",
      location: "Route vers Ravenscroft"
    },
    content: {
      text: "Après des jours de voyage sur des routes poussiéreuses, tu arrives enfin aux Terres de Vethkar. Tu tiens dans ta main une lettre jaunie qui t'informe de ton héritage : un domaine familial dans le village isolé de Ravenscroft. Étrangement, tu n'avais jamais entendu parler de cette branche de ta famille.\nLe paysage devient plus sombre à mesure que tu approches du village. Les arbres semblent tordus, et une brume persistante flotte au-dessus des marais environnants. Au loin, tu aperçois les toits de chaume de Ravenscroft et la lueur vacillante d'une enseigne de taverne.",
      variations: {
        experienced: "Ton expérience d'aventurier te fait immédiatement remarquer que quelque chose cloche dans cette région. L'atmosphère est chargée d'une énergie mystérieuse.",
        mage: "Tes sens magiques détectent une perturbation dans les énergies planaires. Cette région cache quelque chose d'important."
      }
    },
    conditions: {
      show_variation: {
        experienced: "character.level >= 3",
        mage: "character.class === 'Magicien'"
      }
    },
    choices: [
      {
        text: "Se rendre directement à la taverne du village",
        next: "taverne_lanterne",
        consequences: {
          flags: { arrivedAtVillage: true }
        }
      },
      {
        text: "Explorer les environs avant d'entrer au village",
        next: "exploration_perimetres",
        consequences: {
          flags: { exploredPerimeter: true }
        }
      }
    ]
  },

  // === EXPLORATION OPTIONNELLE ===

  "exploration_perimetres": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "prologue",
      tags: ["exploration", "discovery"],
      title: "Signes Inquiétants"
    },
    content: {
      text: "En explorant les alentours du village, tu découvres des traces troublantes : des empruntes étranges dans la boue qui semblent disparaître d'un seul coup, des arbres aux écorces noircies par une force inconnue, et surtout, un silence anormal - pas un oiseau ne chante.\nSur une pierre tombale abandonnée, tu lis un nom familier gravé dans la pierre : 'Gardien Aldric {character.familyName} - Protecteur de la Lame Éternelle'. Le nom te donne des frissons. Qui était cet Aldric ? Et qu'est-ce que la Lame Éternelle ?"
    },
    choices: [
      {
        text: "Se rendre à la taverne avec ces questions en tête",
        next: "taverne_lanterne",
        consequences: {
          flags: { discoveredTombstone: true, arrivedAtVillage: true }
        }
      }
    ]
  },

  // === TAVERNE LA LANTERNE VACILLANTE ===

  "taverne_lanterne": {
    metadata: {
      type: SCENE_TYPES.DIALOGUE,
      chapter: "prologue",
      tags: ["taverne", "social", "information"],
      title: "La Lanterne Vacillante",
      character: "aubergiste_tom",
      location: "Ravenscroft - Taverne"
    },
    content: {
      text: "Tu pousses la porte de la taverne 'La Lanterne Vacillante'. L'atmosphère y est lourde et les rares clients parlent à voix basse. L'aubergiste, un homme robuste aux cranes dégarni et à la barbe fournie, lève les yeux vers toi.",
      speaker: "Tom l'Aubergiste",
      portrait: "src/assets/tom-aubergiste.jpg",
      mood: "wary",
      variations: {
        tombstone: "Ses yeux s'agrandissent légèrement quand tu mentionnes la pierre tombale que tu as trouvée.",
        direct: "Il semble surpris de voir un étranger dans son établissement."
      }
    },
    conditions: {
      show_variation: {
        tombstone: "gameFlags.discoveredTombstone",
        direct: "!gameFlags.discoveredTombstone"
      }
    },
    choices: [
      {
        text: "Demander des informations sur ton héritage familial",
        next: "dialogue_heritage",
        action: {
          type: "scene_transition"
        }
      },
      {
        text: "Poser des questions sur les événements étranges",
        next: "dialogue_creatures",
        condition: "gameFlags.discoveredTombstone"
      },
      {
        text: "Commander une chambre pour la nuit",
        next: "chambre_repos",
        action: {
          type: "scene_transition"
        }
      }
    ]
  },

  "dialogue_heritage": {
    metadata: {
      type: SCENE_TYPES.DIALOGUE,
      chapter: "prologue",
      tags: ["lore", "family"],
      title: "L'Histoire Familiale",
      character: "aubergiste_tom"
    },
    content: {
      text: "Tom se penche vers toi en baissant la voix : 'Alors tu es de la lignée des Gardiens... Je me demandais si quelqu'un finirait par revenir. Ton grand-père Aldric était respecté ici, mais il a disparu il y a vingt ans, la même nuit où...' Il s'interrompt brusquement.",
      speaker: "Tom l'Aubergiste",
      mood: "secretive"
    },
    choices: [
      {
        text: "Insister pour connaître la suite",
        next: "dialogue_disparition",
        action: {
          type: "skillCheck",
          skill: "persuasion",
          dc: 12,
          onSuccess: "dialogue_disparition",
          onFailure: "dialogue_resistance"
        }
      },
      {
        text: "Demander des détails sur le domaine familial",
        next: "dialogue_domaine"
      }
    ]
  },
  "dialogue_creatures": {
    metadata: {
      type: SCENE_TYPES.DIALOGUE,
      chapter: "prologue",
      tags: ["history"],
      title: "Des choses bizarres..",
      character: "aubergiste_tom"
    },
    content: {
      text: "Tom se met a parler tout bas : ' On sait pas trop ce qu'il de passe en ce moment, mais une chose est sûr ce n'est pas normal'",
      speaker: "Tom l'Aubergiste",
      mood: "secretive"
    },
    choices: [
      {
        text: "Insister pour connaître la suite",
        next: "dialogue_disparition",

      },
      {
        text: "Demander des détails sur le domaine familial",
        next: "dialogue_domaine"
      }
    ]

  },
  "dialogue_domaine": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "prologue",
      tags: ["failure", "alternate"],
      title: "l'ancien manoir"
    },
    content: {
      text: "Le Domaine {character.familyName} ?! tu peux pas le louper, il se trouve à l'ancien manoir, au bout du sentier nord. Mais méfie-toi... la nuit tombe bientôt.'"
    },
    choices: [
      {
        text: "Accepter et partir vers le domaine",
        next: "route_domaine",
        consequences: {
          flags: { rejectedByVillagers: true }
        }
      },
      {
        text: "Prendre une chambre et attendre le matin",
        next: "chambre_repos"
      }
    ]
  },
  "chambre_repos": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "prologue",
      tags: ["repos"],
      title: "Réveil l'esprit embrumé"
    },
    content: {
      text: "Tu n'as pas très bien dormis cette nuit. a completer"
    },
    choices: [
      {
        text: "Partir vers le domaine",
        next: "route_domaine",

      },
      {
        text: "Aller parler a l'Aubergiste",
        next: "taverne_lanterne",
      }, {
        text: "Retourner parler a Tom",
        next: "dialogue_ombre",
        condition: "gameFlags.rejectedByVillager"
      }

    ]

  },
  "dialogue_disparition": {
    metadata: {
      type: SCENE_TYPES.DIALOGUE,
      chapter: "prologue",
      tags: ["revelation", "mystery"],
      title: "La Nuit de la Disparition",
      character: "aubergiste_tom"
    },
    content: {
      text: "Tom jette un coup d'œil nerveux autour de lui avant de continuer : 'La nuit où la Lame Éternelle a disparu. Depuis, les ombres bougent toutes seules, les fermes isolées sont attaquées par... des choses qui ne devraient pas exister. Aldric nous protégeait, mais maintenant...' Sa voix se brise.",
      speaker: "Tom l'Aubergiste",
      mood: "fearful"
    },
    choices: [
      {
        text: "Proposer ton aide pour résoudre ce problème",
        next: "rencontre_kael",
        consequences: {
          flags: {
            knowsAboutBlade: true,
            offeredHelp: true,
            earnedTrust: true
          }
        }
      },
      {
        text: "Demander où se trouve ton domaine",
        next: "dialogue_domaine",
        consequences: {
          flags: { knowsAboutBlade: true }
        }
      }
    ]
  },

  "dialogue_resistance": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "prologue",
      tags: ["failure", "alternate"],
      title: "Méfiance"
    },
    content: {
      text: "Tom secoue la tête fermement : 'Non, j'en ai déjà trop dit. Si tu veux vraiment savoir, va voir ton domaine. Il se trouve à l'ancien manoir, au bout du sentier nord. Mais méfie-toi... la nuit tombe bientôt.'"
    },
    choices: [
      {
        text: "Accepter et partir vers le domaine",
        next: "route_domaine",
        consequences: {
          flags: { rejectedByVillagers: true }
        }
      },
      {
        text: "Prendre une chambre et attendre le matin",
        next: "chambre_repos"
      }
    ]
  },

  "route_domaine": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "prologue",
      tags: ["exploration", "mystery", "heritage"],
      title: "Le Sentier vers le Domaine",
      location: "Sentier du Manoir Abandonné"
    },
    content: {
      text: "Tu quittes la taverne sous les regards inquiets des villageois. Le sentier nord serpente à travers une forêt de plus en plus dense, et la brume nocturne commence à s'élever du sol humide.\nAprès une marche de trente minutes, tu aperçois au loin les silhouettes imposantes d'un ancien manoir. Ses tours se dressent contre le ciel crépusculaire, et une faible lueur vacille à l'une des fenêtres. Étrangement, le domaine semble en bien meilleur état que les histoires du village ne le laissaient entendre.",
      variations: {
        mage: "Tes sens magiques détectent une puissante aura protectrice autour du manoir. Des runes de protection, bien qu'anciennes, semblent encore actives.",
        experienced: "Ton expérience t'alerte : ce manoir est trop bien préservé pour être vraiment abandonné. Quelqu'un - ou quelque chose - l'entretient."
      }
    },
    conditions: {
      show_variation: {
        mage: "character.class === 'Magicien'",
        experienced: "character.level >= 3"
      }
    },
    choices: [
      {
        text: "Approcher directement du manoir",
        next: "entree_manoir_direct"
      },
      {
        text: "Faire le tour pour observer depuis les bois",
        next: "observation_manoir"
      },
      {
        text: "Retourner au village, c'est trop risqué la nuit",
        next: "retour_village_nuit"
      }
    ]
  },

  "entree_manoir_direct": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "prologue",
      tags: ["bold", "heritage", "meeting"],
      title: "L'Approche Directe",
      location: "Devant le Manoir {character.familyName}"
    },
    content: {
      text: "Tu marches droit vers l'entrée principale. À mesure que tu t'approches, tu remarques que les jardins, bien qu'envahis, montrent des signes d'entretien récent. Quelqu'un a taillé certaines haies et désherbé les allées.\n\nArrivé devant la porte massive en chêne, tu découvres une plaque de bronze gravée : 'Domaine {character.familyName} - Gardiens de la Lame Éternelle depuis 847'. Avant même que tu ne frappes, la porte s'ouvre sur un vieil homme à la longue barbe blanche."
    },
    choices: [
      {
        text: "Se présenter poliment",
        next: "rencontre_aldwin_poli"
      },
      {
        text: "Demander qui il est avec méfiance",
        next: "rencontre_aldwin_mefiant"
      }
    ]
  },

  "observation_manoir": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "prologue",
      tags: ["stealth", "observation", "discovery"],
      title: "Observation Prudente",
      location: "Lisière de la Forêt"
    },
    content: {
      text: "Tu contournes le manoir en restant dans l'ombre des arbres. Tes observations révèlent plusieurs détails troublants : des traces de pas récentes dans la terre meuble, des fenêtres qui brillent d'une lumière douce mais constante, et surtout, une silhouette qui passe devant l'une des fenêtres - celle d'un vieil homme en robe.\n\nTu remarques aussi d'étranges symboles gravés dans l'écorce de certains arbres entourant la propriété. Ils ressemblent aux motifs que tu as vus sur ta lettre d'héritage."
    },
    choices: [
      {
        text: "Approcher maintenant que tu en sais plus",
        next: "entree_manoir_informe"
      },
      {
        text: "Attendre et observer plus longtemps",
        next: "observation_prolongee"
      },
      {
        text: "Retourner au village avec ces informations",
        next: "retour_village_infos"
      }
    ]
  },

  "retour_village_nuit": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "prologue",
      tags: ["caution", "retreat"],
      title: "Retraite Prudente",
      location: "Retour vers Ravenscroft"
    },
    content: {
      text: "La prudence l'emporte sur la curiosité. Tu rebrousses chemin vers le village, mais le trajet de retour te semble différent. Les bruits de la forêt ont changé, et tu as l'impression d'être observé.\n\nEn arrivant à Ravenscroft, tu constates que la plupart des maisons ont leurs volets fermés et que seule la taverne montre encore de la lumière. Un villageois t'aperçoit et secoue la tête d'un air désapprobateur."
    },
    choices: [
      {
        text: "Retourner à la taverne pour la nuit",
        next: "chambre_repos"
      },
      {
        text: "Repartir vers le manoir immédiatement",
        next: "route_domaine_nuit"
      }
    ]
  },

  "entree_manoir_informe": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "prologue",
      tags: ["informed", "heritage", "meeting"],
      title: "Approche Éclairée",
      location: "Devant le Manoir {character.familyName}"
    },
    content: {
      text: "Fort de tes observations, tu t'approches du manoir avec plus d'assurance. Tu remarques maintenant des détails qui t'avaient échappé : les runes de protection gravées dans le linteau, la propreté inhabituelle des vitres, et surtout, l'absence totale de toiles d'araignées ou de signes d'abandon.\n\nAvant même d'atteindre la porte, celle-ci s'ouvre et le vieil homme que tu as aperçu apparaît. Il te sourit calmement, comme s'il t'attendait depuis longtemps.",
      variations: {
        mage: "Tes sens magiques confirment ce que tu soupçonnais : cet homme rayonne d'une puissante aura arcanique. C'est un mage accompli."
      }
    },
    conditions: {
      show_variation: {
        mage: "character.class === 'Magicien'"
      }
    },
    choices: [
      {
        text: "Mentionner tes observations",
        next: "rencontre_aldwin_observateur"
      },
      {
        text: "Se présenter simplement",
        next: "rencontre_aldwin_poli"
      }
    ]
  },

  "observation_prolongee": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "prologue",
      tags: ["patience", "discovery", "revelation"],
      title: "Vigile Nocturne",
      location: "Lisière de la Forêt"
    },
    content: {
      text: "Tu t'installes confortablement contre un gros chêne et observes patiemment. Ta patience est récompensée : au bout d'une heure, tu vois le vieil homme sortir du manoir avec une lanterne. Il fait le tour de la propriété en murmurant ce qui semble être des incantations.\n\nTu remarques qu'à chaque point qu'il visite, les runes gravées dans les arbres s'illuminent brièvement d'une lumière dorée. Il entretient des protections magiques ! Quand il rentre, il jette un regard direct vers ta cachette et hoche la tête, comme s'il savait que tu étais là.",
      variations: {
        mage: "Tu reconnais les incantations : il s'agit de sorts de protection et de purification de très haut niveau. Cet homme est un mage extrêmement puissant."
      }
    },
    conditions: {
      show_variation: {
        mage: "character.class === 'Magicien'"
      }
    },
    choices: [
      {
        text: "Sortir de ta cachette et t'approcher",
        next: "rencontre_aldwin_respectueux"
      },
      {
        text: "Attendre qu'il vienne te chercher",
        next: "aldwin_vient_chercher"
      },
      {
        text: "Partir discrètement, c'est trop dangereux",
        next: "retour_village_trouble"
      }
    ]
  },

  // === RENCONTRE DU PREMIER COMPAGNON ===

  "rencontre_kael": {
    metadata: {
      type: SCENE_TYPES.DIALOGUE,
      chapter: "prologue",
      tags: ["companion", "recruitment"],
      title: "L'Étranger Encapuchonné",
      character: "kael_ranger"
    },
    content: {
      text: "Alors que Tom termine son récit, un homme encapuchonné assis dans un coin sombre se lève et s'approche. Ses mouvements sont fluides et silencieux. En repoussant sa capuche, il révèle les traits fins d'un elfe sombre aux yeux verts perçants.",
      speaker: "Kael le Rôdeur",
      portrait: "src/assets/kael.png",
      mood: "serious"
    },
    choices: [
      {
        text: "Écouter ce qu'il a à dire",
        next: "dialogue_kael_proposition"
      },
      {
        text: "Rester méfiant et demander qui il est",
        next: "dialogue_kael_mefiance"
      }
    ]
  },

  "dialogue_kael_proposition": {
    metadata: {
      type: SCENE_TYPES.DIALOGUE,
      chapter: "prologue",
      tags: ["companion", "alliance"],
      title: "Une Alliance Nécessaire",
      character: "kael_ranger"
    },
    content: {
      text: "'Je m'appelle Kael. Je traque ces créatures d'ombre depuis des mois. Elles ne se contentent plus d'attaquer les fermes isolées - elles se rassemblent, s'organisent. Si tu es vraiment de la lignée des Gardiens, j'ai besoin de ton aide. Et toi du mien.'",
      speaker: "Kael le Rôdeur",
      mood: "determined"
    },
    choices: [
      {
        text: "Accepter son aide",
        next: "kael_rejoint",
        consequences: {
          flags: { kaelJoined: true },
          companions: ["kael"]
        }
      },
      {
        text: "Refuser poliment",
        next: "kael_refuse",
        consequences: {
          flags: { kaelRefused: true }
        }
      },
      {
        text: "Demander des preuves de ses compétences",
        next: "kael_test",
        action: {
          type: "skillCheck",
          skill: "intuition",
          dc: 10,
          onSuccess: "kael_trustworthy",
          onFailure: "kael_uncertain"
        }
      }
    ]
  },

  "kael_rejoint": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "prologue",
      tags: ["companion", "success"],
      title: "Alliance Formée"
    },
    content: {
      text: "Kael hoche la tête avec satisfaction. 'Bien. J'ai repéré des tunnels sous le village qui mènent vers les anciennes fondations. C'est probablement là que se trouvent les réponses que tu cherches. Mais d'abord, nous devons nous préparer.'"
    },
    choices: [
      {
        text: "Explorer les tunnels immédiatement",
        next: "tunnels_entree",
        consequences: {
          flags: { exploringWithKael: true }
        }
      },
      {
        text: "Prendre du repos avant l'exploration",
        next: "repos_avec_kael",
        action: {
          type: "shortRest"
        }
      }
    ]
  },

  // === EXPLORATION DES TUNNELS ===

  "tunnels_entree": {
    metadata: {
      type: SCENE_TYPES.INTERACTIVE,
      chapter: "acte1",
      tags: ["exploration", "underground"],
      title: "Les Tunnels Oubliés",
      background: "/src/assets/underground_tunnels.jpg"
    },
    content: {
      text: "Kael t'emmène vers une cave secrète derrière la taverne. Un passage étroit descend dans les profondeurs rocheuses sous le village. L'air y est frais et humide, et des gravures anciennes ornent les murs de pierre."
    },
    hotspots: [
      {
        id: "ancient_carvings",
        coordinates: { x:585, y: 0, width: 286, height: 500 },
        text: "Examiner les gravures anciennes",
        action: {
          type: "scene_transition",
          next: "decouverte_gravures"
        }
      },
      {
        id: "deeper_passage",
        coordinates: { x: 336, y: 220, width: 100, height: 180 },
        text: "Continuer vers les profondeurs",
        action: {
          type: "scene_transition",
          next: "chambre_scellee"
        }
      },
      {
        id: "strange_symbol",
        coordinates: { x: 106, y: 115, width: 100, height: 250 },
        text: "Étudier ce symbole étrange",
        condition: "character.class === 'Magicien'",
        action: {
          type: "scene_transition",
          next: "symbole_magique"
        }
      }
    ],
    choices: [
      {
        text: "Remonter à la surface",
        next: "taverne_lanterne"
      }
    ]
  },

  "decouverte_gravures": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte1",
      tags: ["lore", "discovery"],
      title: "Les Fresques du Passé"
    },
    content: {
      text: "Les gravures racontent une histoire ancienne : des guerriers tenant une épée lumineuse face à une faille sombre d'où sortent des créatures d'ombre. La légende sous la fresque mentionne 'la Lame Éternelle, Verrou des Mondes, Gardienne de la Porte des Murmures'.",
      variations: {
        with_kael: "Kael examine les gravures avec attention. 'Alors c'est vrai... Cette épée n'était pas juste une arme, c'était un verrou dimensionnel.'"
      }
    },
    conditions: {
      show_variation: {
        with_kael: "gameFlags.kaelJoined"
      }
    },
    choices: [
      {
        text: "Continuer l'exploration des tunnels",
        next: "chambre_scellee",
        consequences: {
          flags: { understoodHistory: true }
        }
      }
    ]
  },

  "chambre_scellee": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte1",
      tags: ["discovery", "mystery"],
      title: "La Chambre Secrète"
    },
    content: {
      text: "Au bout du tunnel, vous découvrez une large chambre circulaire. Au centre, un piédestal vide où brillent encore des runes magiques. Sur les murs, des inscriptions en langue ancienne. Un passage secret mène vers les marais.",
      variations: {
        mage_bonus: "Tes connaissances magiques te permettent de déchiffrer partiellement les runes : 'Là où la lumière ne peut atteindre, dans le cœur des terres englouties.'"
      }
    },
    conditions: {
      show_variation: {
        mage_bonus: "character.class === 'Magicien'"
      }
    },
    choices: [
      {
        text: "Suivre le passage vers les marais",
        next: "premier_combat_ombres",
        consequences: {
          flags: { foundSecretPassage: true }
        }
      },
      {
        text: "Retourner au village pour se préparer",
        next: "preparation_millhaven"
      }
    ]
  },

  // === PREMIER COMBAT ===

  "premier_combat_ombres": {
    metadata: {
      type: SCENE_TYPES.COMBAT,
      chapter: "acte1",
      tags: ["combat", "ombres"],
      title: "Attaque des Ombres Affamées",
      nextScene: "apres_premier_combat"
    },
    content: {
      text: "En sortant des tunnels vers les marais, vous êtes immédiatement attaqués par trois créatures d'ombre qui semblaient vous attendre. Leurs formes vaporeuses ondulent dans la brume nocturne, et leurs yeux rougeoyants fixent vos âmes avec une faim dévorante."
    },
    enemies: [{ type: 'ombre', count: 2 }],
    enemyPositions: [
      { x: 7, y: 0 },
      { x: 7, y: 1 }
    ],
    choices: [
      {
        text: "Engager le combat !",
        action: {
          type: "combat"
        }
      }
    ]
  },

  "apres_premier_combat": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte1",
      tags: ["aftermath", "discovery"],
      title: "Premières Révélations"
    },
    content: {
      text: "Après avoir repoussé les ombres, vous remarquez qu'elles se dissipent en murmurant des mots dans une langue inconnue. Kael examine les restes : 'Ces créatures ne sont pas naturelles. Elles viennent d'ailleurs, et quelque chose les guide.'",
      variations: {
        solo: "Tu examines seul les restes des créatures. Elles semblaient chercher quelque chose... ou quelqu'un.",
        with_kael: "Kael semble préoccupé par la façon dont ces créatures vous ont attendu. 'Elles savaient que nous viendrions. Nous sommes peut-être suivis.'"
      }
    },
    conditions: {
      show_variation: {
        solo: "!gameFlags.kaelJoined",
        with_kael: "gameFlags.kaelJoined"
      }
    },
    choices: [
      {
        text: "Se diriger vers la ville de Millhaven",
        next: "route_millhaven",
        consequences: {
          flags: { firstCombatWon: true }
        }
      },
      {
        text: "Retourner au village pour se reposer",
        next: "repos_village",
        action: {
          type: "shortRest"
        }
      }
    ]
  },

  // === ROUTE VERS MILLHAVEN ===

  "route_millhaven": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte2",
      tags: ["voyage", "transition"],
      title: "La Route vers Millhaven"
    },
    content: {
      text: "La route vers Millhaven serpente à travers les marais pendant deux jours. Cette ville plus importante possède des archives historiques qui pourraient contenir des informations sur ta famille et la Lame Éternelle. En chemin, vous croisez des marchands nerveux qui parlent de 'loups étranges' dans la région."
    },
    choices: [
      {
        text: "Arriver à Millhaven",
        next: "millhaven_auberge"
      }
    ]
  },

  // === MILLHAVEN - AUBERGE DU REPOS DU VOYAGEUR ===

  "millhaven_auberge": {
    metadata: {
      type: SCENE_TYPES.DIALOGUE,
      chapter: "acte2",
      tags: ["auberge", "information"],
      title: "Le Repos du Voyageur",
      character: "dame_seraphina",
      location: "Millhaven - Auberge"
    },
    content: {
      text: "L'auberge 'Le Repos du Voyageur' est bien plus raffinée que la taverne de Ravenscroft. Dans le salon principal, une femme noble aux cheveux châtains consulte des parchemins anciens. Elle lève les yeux quand vous entrez.",
      speaker: "Dame Seraphina",
      portrait: "dame_seraphina",
      mood: "curious"
    },
    choices: [
      {
        text: "Approcher et vous présenter",
        next: "dialogue_seraphina_intro"
      },
      {
        text: "Demander une chambre d'abord",
        next: "chambre_millhaven"
      },
      {
        text: "Observer discrètement",
        next: "observation_seraphina",
        action: {
          type: "skillCheck",
          skill: "perception",
          dc: 12,
          onSuccess: "observation_reussie",
          onFailure: "observation_ratee"
        }
      }
    ]
  },

  "dialogue_seraphina_intro": {
    metadata: {
      type: SCENE_TYPES.DIALOGUE,
      chapter: "acte2",
      tags: ["noble", "information"],
      title: "Rencontre avec Dame Seraphina",
      character: "dame_seraphina"
    },
    content: {
      text: "'Comme c'est intéressant... Vous portez le nom des anciens Gardiens, n'est-ce pas ? Je suis Dame Seraphina de Valdris. Je possède dans mes archives des documents historiques sur votre lignée. Peut-être pourrions-nous nous entraider ?'",
      speaker: "Dame Seraphina",
      mood: "friendly"
    },
    choices: [
      {
        text: "Accepter son aide avec reconnaissance",
        next: "seraphina_aide",
        consequences: {
          flags: { metSeraphina: true, seraphinaFriendly: true }
        }
      },
      {
        text: "Demander ce qu'elle veut en échange",
        next: "seraphina_echange",
        consequences: {
          flags: { metSeraphina: true, seraphinaCautious: true }
        }
      }
    ]
  },

  "seraphina_aide": {
    metadata: {
      type: SCENE_TYPES.DIALOGUE,
      chapter: "acte2",
      tags: ["revelation", "lore"],
      title: "Les Archives Secrètes",
      character: "dame_seraphina"
    },
    content: {
      text: "'Vos ancêtres étaient les gardiens d'un artefact appelé la Lame Éternelle. Selon mes documents, votre grand-père Aldric l'a cachée quelque part avant de disparaître. Il a laissé un indice : 'là où la lumière ne peut atteindre, dans le cœur des terres englouties.''",
      speaker: "Dame Seraphina",
      mood: "helpful"
    },
    choices: [
      {
        text: "Demander plus de détails sur Aldric",
        next: "histoire_aldric"
      },
      {
        text: "Demander où se trouvent ces 'terres englouties'",
        next: "localisation_forteresse",
        consequences: {
          flags: { knowsForteressLocation: true }
        }
      }
    ]
  },

  // === RENCONTRE DU DEUXIÈME COMPAGNON ===

  "rencontre_finn": {
    metadata: {
      type: SCENE_TYPES.DIALOGUE,
      chapter: "acte2",
      tags: ["companion", "gnome"],
      title: "L'Inventeur Excentrique",
      character: "finn_inventeur"
    },
    content: {
      text: "Dans l'atelier adjacent à l'auberge, vous entendez des bruits métalliques et des étincelles. Un gnome aux cheveux hirsutes sort la tête d'un assemblage d'engrenages complexe. 'Oh ! Des visiteurs ! Parfait, j'ai justement besoin de testeurs pour mon Détecteur d'Énergies Planaires Mark VII !'",
      speaker: "Finn l'Inventeur",
      portrait: "finn_gnome",
      mood: "excited"
    },
    choices: [
      {
        text: "Montrer de l'intérêt pour ses inventions",
        next: "finn_inventions"
      },
      {
        text: "Lui parler de vos problèmes avec les créatures d'ombre",
        next: "finn_detecteur",
        consequences: {
          flags: { finnIntrigued: true }
        }
      },
      {
        text: "Poliment décliner et partir",
        next: "finn_refuse"
      }
    ]
  },

  "finn_detecteur": {
    metadata: {
      type: SCENE_TYPES.DIALOGUE,
      chapter: "acte2",
      tags: ["gnome", "science"],
      title: "Détection Planaire",
      character: "finn_inventeur"
    },
    content: {
      text: "'Des créatures d'ombre ? Fascinant ! Mon détecteur indique effectivement des anomalies planaires dans cette région. Si vous me permettez de vous accompagner pour étudier ces phénomènes, je pourrais vous aider avec mes inventions !'",
      speaker: "Finn l'Inventeur",
      mood: "scientific"
    },
    choices: [
      {
        text: "Accepter qu'il se joigne à vous",
        next: "finn_rejoint",
        consequences: {
          flags: { finnJoined: true },
          companions: ["finn"]
        }
      },
      {
        text: "Demander une démonstration de ses capacités",
        next: "finn_demonstration"
      }
    ]
  },

  "finn_rejoint": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte2",
      tags: ["companion", "equipment"],
      title: "Un Nouvel Allié"
    },
    content: {
      text: "Finn rassemble rapidement son équipement : détecteurs étranges, fioles brillantes et gadgets mécaniques divers. 'Excellent ! Avec mon matériel, nous pourrons localiser les perturbations planaires et peut-être même prédire les apparitions de créatures !'"
    },
    choices: [
      {
        text: "Partir vers les marais pour chercher la forteresse",
        next: "marais_exploration",
        consequences: {
          flags: { teamFormed: true }
        }
      },
      {
        text: "Se reposer avant l'expédition",
        next: "repos_millhaven",
        action: {
          type: "longRest"
        }
      }
    ]
  },

  // === EXPLORATION DES MARAIS ===

  "marais_exploration": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte2",
      tags: ["marais", "danger"],
      title: "Dans les Marais Maudits"
    },
    content: {
      text: "Les marais s'étendent à perte de vue, ponctués d'îlots rocheux et de brumes épaisses. Le détecteur de Finn s'affole de plus en plus à mesure que vous progressez vers le cœur de la région. L'air devient plus froid et des murmures étranges portent dans le vent."
    },
    choices: [
      {
        text: "Suivre les indications du détecteur",
        next: "spectres_marais",
        consequences: {
          flags: { followedDetector: true }
        }
      },
      {
        text: "Chercher un chemin plus sûr",
        next: "chemin_detourne",
        action: {
          type: "skillCheck",
          skill: "survie",
          dc: 14,
          onSuccess: "chemin_sur",
          onFailure: "spectres_marais"
        }
      }
    ]
  },

  // === DEUXIÈME COMBAT ===

  "spectres_marais": {
    metadata: {
      type: SCENE_TYPES.COMBAT,
      chapter: "acte2",
      tags: ["combat", "spectres"],
      title: "Spectres des Marais",
      nextScene: "apres_spectres"
    },
    content: {
      text: "Des formes translucides émergent de la brume : des spectres de voyageurs perdus dans les marais. Contrairement aux ombres précédentes, ces créatures sont plus organisées et semblent communiquer entre elles dans un langage sifflant."
    },
    enemies: [{ type: 'spectre_marais', count: 4 }],
    enemyPositions: [
      { x: 3, y: 1 },
      { x: 4, y: 4 },
      { x: 6, y: 2 },
      { x: 7, y: 5 }
    ],
    choices: [
      {
        text: "Combattre les spectres !",
        action: {
          type: "combat"
        }
      }
    ]
  },

  "apres_spectres": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte2",
      tags: ["aftermath", "discovery"],
      title: "Révélations Spectrales"
    },
    content: {
      text: "Avant de se dissiper, l'un des spectres murmure : 'Elle... elle contrôle... la Dame... cherche... la Lame...' Finn examine ses instruments : 'Les perturbations planaires viennent définitivement d'une structure au nord-ouest. Et ces créatures... elles étaient dirigées !'"
    },
    choices: [
      {
        text: "Se diriger vers la source des perturbations",
        next: "forteresse_ruines",
        consequences: {
          flags: { heardSpectreWarning: true }
        }
      }
    ]
  },

  // === DÉCOUVERTE DE LA FORTERESSE ===

  "forteresse_ruines": {
    metadata: {
      type: SCENE_TYPES.INTERACTIVE,
      chapter: "acte3",
      tags: ["forteresse", "exploration"],
      title: "Les Ruines de Sombremont",
      background: "ruined_fortress"
    },
    content: {
      text: "Devant vous s'élèvent les ruines imposantes de ce qui fut autrefois une forteresse majestueuse. Des tours écroulées percent la brume, et une énergie sombre pulse visiblement entre les pierres anciennes. C'était le siège de votre famille."
    },
    hotspots: [
      {
        id: "main_entrance",
        coordinates: { x: 160, y: 200, width: 120, height: 100 },
        text: "Entrer par l'entrée principale",
        action: {
          type: "scene_transition",
          next: "entree_forteresse"
        }
      },
      {
        id: "side_passage",
        coordinates: { x: 50, y: 150, width: 80, height: 60 },
        text: "Chercher un passage latéral",
        condition: "gameFlags.kaelJoined",
        action: {
          type: "scene_transition",
          next: "passage_secret"
        }
      },
      {
        id: "magical_observation",
        coordinates: { x: 300, y: 80, width: 100, height: 100 },
        text: "Analyser les énergies magiques",
        condition: "character.class === 'Magicien' || gameFlags.finnJoined",
        action: {
          type: "scene_transition",
          next: "analyse_magique"
        }
      }
    ],
    choices: [
      {
        text: "Faire le tour pour évaluer la situation",
        next: "evaluation_forteresse"
      }
    ]
  },

  "entree_forteresse": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte3",
      tags: ["exploration", "tension"],
      title: "Dans les Ruines"
    },
    content: {
      text: "L'intérieur de la forteresse est dans un état de désolation contrôlée. Certaines parties semblent avoir été récemment habitées. Des symboles étranges sont peints sur les murs, et vous entendez des voix provenant des profondeurs. Quelqu'un d'autre est ici."
    },
    choices: [
      {
        text: "Avancer discrètement vers les voix",
        next: "rencontre_zara",
        action: {
          type: "skillCheck",
          skill: "discretion",
          dc: 13,
          onSuccess: "approche_discrete",
          onFailure: "approche_bruyante"
        }
      },
      {
        text: "Explorer les autres salles d'abord",
        next: "exploration_salles"
      }
    ]
  },

  // === RENCONTRE DU TROISIÈME COMPAGNON ===

  "rencontre_zara": {
    metadata: {
      type: SCENE_TYPES.DIALOGUE,
      chapter: "acte3",
      tags: ["companion", "sorcière"],
      title: "La Sorcière Prisonnière",
      character: "zara_sorciere"
    },
    content: {
      text: "Dans une salle circulaire, vous découvrez une femme aux cheveux noirs enfermée dans un cercle de runes brillantes. Elle lève les yeux vers vous avec un mélange de soulagement et de méfiance. 'Enfin quelqu'un ! J'étudie les anomalies planaires ici depuis des mois, mais ce piège magique m'a capturée !'",
      speaker: "Zara la Sorcière",
      portrait: "zara_sorciere",
      mood: "desperate"
    },
    choices: [
      {
        text: "Essayer de briser le cercle magique",
        next: "liberation_zara",
        action: {
          type: "skillCheck",
          skill: "arcane",
          dc: 15,
          onSuccess: "zara_liberee",
          onFailure: "liberation_ratee"
        }
      },
      {
        text: "Demander qui l'a piégée avant d'agir",
        next: "zara_explication"
      },
      {
        text: "Rester méfiant - cela pourrait être un piège",
        next: "zara_mefiance"
      }
    ]
  },

  "zara_liberee": {
    metadata: {
      type: SCENE_TYPES.DIALOGUE,
      chapter: "acte3",
      tags: ["liberation", "revelation"],
      title: "Une Nouvelle Alliée",
      character: "zara_sorciere"
    },
    content: {
      text: "Le cercle se brise dans un flash de lumière. Zara se masse les poignets en souriant : 'Merci ! Je commençais à désespérer. Je dois vous avertir : Dame Seraphina n'est pas celle qu'elle prétend être. Elle contrôle activement l'ouverture de la Porte des Murmures !'",
      speaker: "Zara la Sorcière",
      mood: "grateful"
    },
    choices: [
      {
        text: "Demander des explications sur Seraphina",
        next: "zara_revelation_seraphina",
        consequences: {
          flags: { zaraJoined: true, knowsSeraphinaTruth: true },
          companions: ["zara"]
        }
      },
      {
        text: "Proposer qu'elle se joigne à votre groupe",
        next: "zara_alliance",
        consequences: {
          flags: { zaraJoined: true },
          companions: ["zara"]
        }
      }
    ]
  },

  "zara_revelation_seraphina": {
    metadata: {
      type: SCENE_TYPES.DIALOGUE,
      chapter: "acte3",
      tags: ["revelation", "betrayal"],
      title: "La Véritable Nature de Seraphina",
      character: "zara_sorciere"
    },
    content: {
      text: "'Seraphina n'est pas juste une noble curieuse. Elle descend d'une lignée rivale qui fut dépossédée du titre de Gardien il y a des siècles. Elle ne veut pas détruire la Porte des Murmures - elle veut la contrôler pour invoquer une armée d'ombres et conquérir les royaumes !'",
      speaker: "Zara la Sorcière",
      mood: "urgent"
    },
    choices: [
      {
        text: "Partir immédiatement pour l'arrêter",
        next: "course_contre_seraphina",
        consequences: {
          flags: { rushedToConfrontation: true }
        }
      },
      {
        text: "Chercher d'abord la Lame Éternelle",
        next: "recherche_lame",
        consequences: {
          flags: { soughtBladeFirst: true }
        }
      }
    ]
  },

  // === TROISIÈME COMBAT - GARDIENS CORROMPUS ===

  "recherche_lame": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte3",
      tags: ["exploration", "discovery"],
      title: "La Chambre Secrète"
    },
    content: {
      text: "Zara vous guide vers la chambre secrète au cœur de la forteresse. Mais devant l'entrée, d'anciens gardiens corrompus par l'énergie planaire montent la garde. Leurs armures anciennes brillent d'une lumière malsaine, et leurs yeux ne reflètent plus aucune humanité."
    },
    choices: [
      {
        text: "Engager le combat contre les gardiens",
        next: "combat_gardiens_corrompus"
      },
      {
        text: "Essayer de les raisonner",
        next: "tentative_negociation",
        action: {
          type: "skillCheck",
          skill: "persuasion",
          dc: 18,
          onSuccess: "gardiens_pacifies",
          onFailure: "combat_gardiens_corrompus"
        }
      }
    ]
  },

  "combat_gardiens_corrompus": {
    metadata: {
      type: SCENE_TYPES.COMBAT,
      chapter: "acte3",
      tags: ["combat", "gardiens"],
      title: "Gardiens Corrompus",
      nextScene: "decouverte_lame"
    },
    content: {
      text: "Les gardiens corrompus attaquent sans merci ! Ces anciens protecteurs de votre lignée ont été transformés en créatures hybrides, mi-humaines mi-ombres. Leur corruption leur donne une force surnaturelle, mais aussi une vulnérabilité à la lumière pure."
    },
    enemies: [{ type: 'gardien_corrompu', count: 3 }],
    enemyPositions: [
      { x: 4, y: 2 },
      { x: 5, y: 4 },
      { x: 6, y: 1 }
    ],
    choices: [
      {
        text: "Libérer les gardiens de leur corruption !",
        action: {
          type: "combat"
        }
      }
    ]
  },

  // === DÉCOUVERTE DE LA LAME ÉTERNELLE ===

  "decouverte_lame": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte3",
      tags: ["discovery", "artifact"],
      title: "La Lame Éternelle"
    },
    content: {
      text: "Dans la chambre secrète, sur un autel de cristal noir, repose enfin la Lame Éternelle. L'épée pulse d'une lumière argentée qui semble repousser naturellement les ombres. Mais au moment où vous vous en approchez, des applaudissements lents résonnent derrière vous."
    },
    choices: [
      {
        text: "Se retourner prudemment",
        next: "apparition_seraphina"
      },
      {
        text: "Saisir rapidement la lame",
        next: "saisie_lame_rapide",
        action: {
          type: "skillCheck",
          skill: "dexterite",
          dc: 16,
          onSuccess: "lame_saisie",
          onFailure: "apparition_seraphina"
        }
      }
    ]
  },

  // === ACTE IV : LA TRAHISON ===

  "apparition_seraphina": {
    metadata: {
      type: SCENE_TYPES.DIALOGUE,
      chapter: "acte4",
      tags: ["betrayal", "revelation"],
      title: "La Véritable Seraphina",
      character: "seraphina_enemy"
    },
    content: {
      text: "Dame Seraphina entre dans la chambre, accompagnée de mercenaires en armure noire. Mais quelque chose a changé en elle - ses yeux brillent d'une lueur malsaine et des ombres dansent autour de sa silhouette. 'Merci de m'avoir menée jusqu'ici, descendant des usurpateurs !'",
      speaker: "Dame Seraphina",
      portrait: "seraphina_corrupted",
      mood: "hostile"
    },
    choices: [
      {
        text: "Demander des explications",
        next: "seraphina_revelation"
      },
      {
        text: "Préparer immédiatement le combat",
        next: "preparation_combat_final",
        consequences: {
          flags: { preparedForFinalBattle: true }
        }
      }
    ]
  },

  "seraphina_revelation": {
    metadata: {
      type: SCENE_TYPES.DIALOGUE,
      chapter: "acte4",
      tags: ["villain", "motivation"],
      title: "L'Héritage Volé",
      character: "seraphina_enemy"
    },
    content: {
      text: "'Ma famille était les vrais Gardiens avant que les vôtres ne nous dépossèdent par la ruse ! Pendant des siècles, nous avons planifié notre retour. Je ne veux pas détruire la Porte des Murmures - je veux l'ouvrir complètement et commander une armée d'ombres pour reprendre ce qui nous revient de droit !'",
      speaker: "Dame Seraphina",
      mood: "vengeful"
    },
    choices: [
      {
        text: "Essayer de la raisonner",
        next: "tentative_redemption",
        action: {
          type: "skillCheck",
          skill: "persuasion",
          dc: 20,
          onSuccess: "seraphina_hesitate",
          onFailure: "combat_seraphina"
        }
      },
      {
        text: "La défier au combat",
        next: "combat_seraphina"
      }
    ]
  },

  // === COMBAT FINAL ===

  "combat_seraphina": {
    metadata: {
      type: SCENE_TYPES.COMBAT,
      chapter: "acte4",
      tags: ["boss", "final"],
      title: "Seraphina la Corrompue",
      nextScene: "apres_combat_final"
    },
    content: {
      text: "Seraphina se transforme sous vos yeux, l'énergie planaire la corrompant en une créature mi-humaine mi-ombre. Ses mercenaires attaquent tandis qu'elle invoque des sorts puissants. C'est le combat le plus difficile que vous ayez jamais affronté !"
    },
    enemies: [
      { type: 'seraphina_boss', count: 1 },
      { type: 'mercenaire_ombre', count: 2 }
    ],
    enemyPositions: [
      { x: 4, y: 3 },  // Seraphina au centre
      { x: 2, y: 1 },  // Mercenaire 1
      { x: 6, y: 5 }   // Mercenaire 2
    ],
    choices: [
      {
        text: "Combattre pour sauver le monde !",
        action: {
          type: "combat"
        }
      }
    ]
  },

  "apres_combat_final": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte4",
      tags: ["aftermath", "choice"],
      title: "Le Dernier Acte de Seraphina"
    },
    content: {
      text: "Seraphina s'effondre, mortellement blessée, mais utilise ses dernières forces pour lancer un sort de destruction sur la Porte des Murmures. La faille planaire commence à se fissurer dangereusement. Vous devez agir vite !",
      variations: {
        with_allies: "Vos compagnons vous regardent avec confiance : 'Nous te suivrons, quel que soit ton choix !'",
        solo: "Seul face à ce choix crucial, tu sens le poids de la responsabilité sur tes épaules."
      }
    },
    conditions: {
      show_variation: {
        with_allies: "gameFlags.kaelJoined || gameFlags.finnJoined || gameFlags.zaraJoined",
        solo: "!gameFlags.kaelJoined && !gameFlags.finnJoined && !gameFlags.zaraJoined"
      }
    },
    choices: [
      {
        text: "Détruire la Lame Éternelle pour fermer la porte à jamais",
        next: "fin_destruction_lame",
        consequences: {
          flags: { destroyedBlade: true, porteClosed: true }
        }
      },
      {
        text: "Devenir le nouveau Gardien et garder la lame",
        next: "fin_nouveau_gardien",
        consequences: {
          flags: { becameGuardian: true, keptBlade: true }
        }
      },
      {
        text: "Essayer de purifier la porte au lieu de la fermer",
        next: "tentative_purification",
        condition: "character.class === 'Magicien' || gameFlags.zaraJoined",
        action: {
          type: "skillCheck",
          skill: "arcane",
          dc: 18,
          onSuccess: "fin_purification_reussie",
          onFailure: "fin_purification_ratee"
        }
      }
    ]
  },

  // === ÉPILOGUE - DIFFÉRENTES FINS ===

  "fin_destruction_lame": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "epilogue",
      tags: ["ending", "sacrifice"],
      title: "Le Sacrifice Héroïque"
    },
    content: {
      text: "Tu lèves la Lame Éternelle et, d'un geste décisif, la brises contre l'autel de cristal. L'explosion de lumière pure scelle définitivement la Porte des Murmures, mais l'artefact légendaire est perdu à jamais. Les villages environnants sont sauvés, mais tu portes le poids d'avoir détruit un héritage millénaire.",
      variations: {
        with_team: "Tes compagnons approuvent ton choix courageux. Ensemble, vous avez sauvé la région au prix d'un sacrifice immense."
      }
    },
    conditions: {
      show_variation: {
        with_team: "gameFlags.kaelJoined || gameFlags.finnJoined || gameFlags.zaraJoined"
      }
    },
    choices: [
      {
        text: "Retourner à Ravenscroft pour annoncer la nouvelle",
        next: "epilogue_retour_village"
      }
    ]
  },

  "fin_nouveau_gardien": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "epilogue",
      tags: ["ending", "responsibility"],
      title: "L'Héritage Assumé"
    },
    content: {
      text: "Tu saisis fermement la Lame Éternelle et canalises son pouvoir pour stabiliser la Porte des Murmures. Tu deviens le nouveau Gardien, assumant la responsabilité de surveiller cette région à vie. C'est un fardeau lourd, mais tu préserves à la fois la paix et l'héritage de ta famille."
    },
    choices: [
      {
        text: "Accepter ton nouveau rôle avec honneur",
        next: "epilogue_gardien"
      }
    ]
  },

  "fin_purification_reussie": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "epilogue",
      tags: ["ending", "redemption"],
      title: "La Voie de la Rédemption"
    },
    content: {
      text: "Grâce à tes connaissances magiques ou à l'aide de Zara, tu réussis l'impossible : purifier la Porte des Murmures au lieu de la fermer. La faille devient un passage contrôlé qui pourrait même être bénéfique dans le futur. Tu as trouvé une troisième voie que personne n'avait envisagée."
    },
    choices: [
      {
        text: "Étudier cette nouvelle découverte",
        next: "epilogue_chercheur"
      }
    ]
  },

  // === ÉPILOGUE FINAL ===

  "epilogue_retour_village": {
    metadata: {
      type: SCENE_TYPES.DIALOGUE,
      chapter: "epilogue",
      tags: ["conclusion", "sage"],
      title: "Le Sage Aldwin",
      character: "maitre_aldwin",
      location: "Ravenscroft - Taverne"
    },
    content: {
      text: "De retour à la taverne de Ravenscroft, vous rencontrez un vieil homme aux robes d'érudit qui vous attendait. 'Je suis Maître Aldwin, archiviste royal. J'ai entendu parler de vos exploits. Ce que vous avez accompli ici n'est que le début - il existe d'autres Portes dans le monde, d'autres sites où d'anciens Gardiens ont disparu.'",
      speaker: "Maître Aldwin",
      portrait: "maitre_aldwin",
      mood: "wise"
    },
    choices: [
      {
        text: "Accepter de former un nouvel Ordre des Gardiens",
        next: "formation_nouvel_ordre",
        consequences: {
          flags: { formedNewOrder: true }
        }
      },
      {
        text: "Demander du temps pour réfléchir",
        next: "reflexion_finale"
      },
      {
        text: "Refuser - tu en as assez fait",
        next: "retraite_heroique"
      }
    ]
  },

  "formation_nouvel_ordre": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "epilogue",
      tags: ["new_beginning", "hope"],
      title: "Un Nouvel Espoir"
    },
    content: {
      text: "Maître Aldwin sourit et déroule une carte ancienne marquée d'emplacements mystérieux à travers le continent. 'Parfait. Avec vos compagnons et la sagesse que vous avez acquise, nous pouvons créer un nouvel Ordre des Gardiens. Le monde a besoin de protecteurs comme vous.'",
      variations: {
        blade_destroyed: "Même sans la Lame Éternelle, votre expérience et votre détermination seront des atouts précieux.",
        became_guardian: "En tant que Gardien de la Lame Éternelle, vous serez le pilier de ce nouvel ordre.",
        purified_gate: "Votre découverte de la purification des portes révolutionne notre approche de ces sites."
      }
    },
    conditions: {
      show_variation: {
        blade_destroyed: "gameFlags.destroyedBlade",
        became_guardian: "gameFlags.becameGuardian",
        purified_gate: "gameFlags.purifiedGate"
      }
    },
    choices: [
      {
        text: "Commencer cette nouvelle aventure",
        next: "fin_ouverture_monde",
        consequences: {
          flags: { readyForSequal: true }
        }
      }
    ]
  },

  "fin_ouverture_monde": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "epilogue",
      tags: ["ending", "future"],
      title: "De Nouveaux Horizons"
    },
    content: {
      text: "Votre groupe se prépare pour un périple à travers le continent. Selon vos choix et vos compagnons, vous avez différents outils à votre disposition, mais une mission commune : localiser et protéger les autres sites planaires. L'aventure de Vethkar n'était que le premier chapitre d'une épopée bien plus vaste.\n*** FIN DU CHAPITRE 1 : LES GARDIENS DE LA LAME ÉTERNELLE ***\nVos choix et vos compagnons façonneront la suite de votre destinée..."
    },
    choices: [
      {
        text: "Continuer l'aventure... (À suivre)",
        next: "introduction", // Retour au début pour une nouvelle partie
        consequences: {
          flags: { completedFirstChapter: true }
        }
      }
    ]
  }
};

export default newScenes;