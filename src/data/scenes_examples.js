/**
 * Scénario: Les Gardiens de la Lame Éternelle
 * Une aventure complète avec héritage familial, mystères planaires et choix moraux
 */

import { SCENE_TYPES } from '../types/story';
import { missingScenesP2 } from './scenes_missing_part2';
import { finalMissingScenes } from './scenes_final_missing';
import { testScenes } from './scene_test';
import aubergisteImage from '../assets/tom-aubergiste.jpg';
import kaelImage from '../assets/kael.png'
import seraphinaImage from '../assets/dame_seraphina.jpg'
import finnImage from '../assets/finn.png'
import zaraImage from '../assets/zara.png'
import seraphinaCorruptedImage from '../assets/seraphina_corrupted.png'
import aldwinImage from '../assets/maitre_aldwin.png'
import ruined_fortress from '../assets/ruined_fortress.jpg'
import underground_tunnels from '../assets/underground_tunnels.jpg'
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
          flags: { arrivedAtVillage: true },
          companions: ["kael"]
        }
      },
      {
        text: "Explorer les environs avant d'entrer au village",
        next: "exploration_perimetres",
        consequences: {
          flags: { exploredPerimeter: true }
        }
      },

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
      portrait: aubergisteImage,
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
      character: "aubergiste_tom",
      location: "Ravenscroft - Taverne"
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
      portrait: kaelImage,
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
        next: "repos_court_avec_kael"  
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
      background: underground_tunnels
    },
    content: {
      text: "Kael t'emmène vers une cave secrète derrière la taverne. Un passage étroit descend dans les profondeurs rocheuses sous le village. L'air y est frais et humide, et des gravures anciennes ornent les murs de pierre."
    },
    hotspots: [
      {
        id: "ancient_carvings",
        coordinates: { x: 585, y: 0, width: 286, height: 500 },
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
      next: "apres_premier_combat"
    },
    content: {
      text: "En sortant des tunnels vers les marais, vous êtes immédiatement attaqués par trois créatures d'ombre qui semblaient vous attendre. Leurs formes vaporeuses ondulent dans la brume nocturne, et leurs yeux rougeoyants fixent vos âmes avec une faim dévorante."
    },
    enemies: [{ type: 'ombre', count: 1 }],
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
          flags: { firstCombatWon: true },

        }
      },
      {
        text: "Retourner au village pour se reposer",
        action: {
          type: "shortRest",
          next: "repos_village"
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
      portrait: seraphinaImage,
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
      portrait: finnImage,
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
      next: "apres_spectres"
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
      background: ruined_fortress
    },
    content: {
      text: "Devant vous s'élèvent les ruines imposantes de ce qui fut autrefois une forteresse majestueuse. Des tours écroulées percent la brume, et une énergie sombre pulse visiblement entre les pierres anciennes. C'était le siège de votre famille."
    },
    hotspots: [
      {
        id: "main_entrance",
        coordinates: { x: 446, y: 202, width: 87, height: 138 },
        text: "Entrer par l'entrée principale",
        action: {
          type: "scene_transition",
          next: "entree_forteresse"
        }
      },
      {
        id: "side_passage",
        coordinates: { x: 60, y: 307, width: 20, height: 60 },
        text: "Chercher un passage latéral",
        // condition: "gameFlags.kaelJoined",
        action: {
          type: "scene_transition",
          next: "passage_secret"
        }
      },
      {
        id: "magical_observation",
        coordinates: { x: 821, y: 210, width: 55, height: 55 },
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
      portrait: zaraImage,
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
      next: "decouverte_lame"
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
      portrait: seraphinaCorruptedImage,
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
      next: "apres_combat_final"
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
      portrait: aldwinImage,
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
  },

  // === SCÈNES MANQUANTES - PROLOGUE ===

  "dialogue_ombre": {
    metadata: {
      type: SCENE_TYPES.DIALOGUE,
      chapter: "prologue",
      tags: ["mystery", "warning"],
      title: "Murmures dans l'Ombre",
      character: "aubergiste_tom"
    },
    content: {
      text: "Tom se penche vers toi, l'air plus sombre qu'avant : 'Cette nuit, j'ai entendu des choses... Des murmures venant des marais. Les ombres bougent différemment depuis ton arrivée. Je ne dis pas que c'est ta faute, mais...' Il s'interrompt en jetant un regard nerveux vers la fenêtre.",
      speaker: "Tom l'Aubergiste",
      mood: "worried"
    },
    choices: [
      {
        text: "Demander plus de détails sur ces murmures",
        next: "dialogue_disparition"
      },
      {
        text: "Partir immédiatement vers le domaine",
        next: "route_domaine",
        consequences: {
          flags: { heardOmenWarning: true }
        }
      }
    ]
  },

  "route_domaine_nuit": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "prologue",
      tags: ["danger", "night"],
      title: "Retour Nocturne Dangereux"
    },
    content: {
      text: "Cette fois, tu prends le sentier vers le manoir dans l'obscurité totale. Les bruits de la forêt sont différents, plus menaçants. Des formes sombres semblent te suivre entre les arbres, et tu entends parfois des murmures dans une langue inconnue. Ton instinct te dit que quelque chose d'hostile rôde dans ces bois."
    },
    choices: [
      {
        text: "Continuer malgré le danger",
        next: "entree_manoir_direct",
        action: {
          type: "skillCheck",
          skill: "courage",
          dc: 14,
          onSuccess: "arrivee_manoir_brave",
          onFailure: "attaque_ombres_route"
        }
      },
      {
        text: "Faire demi-tour prudemment",
        next: "retour_village_trouble"
      }
    ]
  },

  "retour_village_trouble": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "prologue",
      tags: ["retreat", "omen"],
      title: "Retraite Troublante"
    },
    content: {
      text: "Tu fais demi-tour, mais même en retournant vers le village, tu sens une présence malveillante dans ton dos. Les ombres semblent te suivre, et tu entends distinctement des rires étouffés. En arrivant à Ravenscroft, tu remarques que plusieurs maisons ont leurs fenêtres barricadées."
    },
    choices: [
      {
        text: "Retourner à la taverne pour la nuit",
        next: "chambre_repos",
        consequences: {
          flags: { sawDarkOmens: true }
        }
      }
    ]
  },

  "retour_village_infos": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "prologue",
      tags: ["information", "planning"],
      title: "Retour avec des Renseignements"
    },
    content: {
      text: "Tu retournes au village avec les informations précieuses que tu as récoltées sur le manoir. Il est habité par un vieil homme mystérieux, et des protections magiques sont en place. Les villageois pourraient être rassurés d'apprendre que quelqu'un veille encore sur l'ancien domaine familial."
    },
    choices: [
      {
        text: "Partager tes découvertes à la taverne",
        next: "taverne_lanterne",
        consequences: {
          flags: { sharedManorInfo: true }
        }
      },
      {
        text: "Garder les informations et retourner au manoir",
        next: "entree_manoir_informe"
      }
    ]
  },

  // === RENCONTRES AVEC ALDWIN ===

  "rencontre_aldwin_poli": {
    metadata: {
      type: SCENE_TYPES.DIALOGUE,
      chapter: "prologue",
      tags: ["polite", "heritage"],
      title: "Présentation Courtoise",
      character: "maitre_aldwin"
    },
    content: {
      text: "'Bonsoir, je suis {character.name} {character.familyName}. J'ai hérité de ce domaine et je cherche à comprendre l'histoire de ma famille.' Le vieil homme sourit chaleureusement : 'Enfin ! Je suis Maître Aldwin, gardien temporaire de ce lieu. J'attendais le retour d'un descendant depuis des années.'",
      speaker: "Maître Aldwin",
      portrait: aldwinImage,
      mood: "welcoming"
    },
    choices: [
      {
        text: "Demander pourquoi il gardait le manoir",
        next: "aldwin_explication_gardien"
      },
      {
        text: "Questionner sur la famille et la Lame Éternelle",
        next: "aldwin_histoire_famille",
        condition: "gameFlags.knowsAboutBlade"
      },
      {
        text: "Accepter son invitation à entrer",
        next: "interieur_manoir_aldwin"
      }
    ]
  },

  "rencontre_aldwin_mefiant": {
    metadata: {
      type: SCENE_TYPES.DIALOGUE,
      chapter: "prologue",
      tags: ["suspicious", "caution"],
      title: "Confrontation Méfiante",
      character: "maitre_aldwin"
    },
    content: {
      text: "'Qui êtes-vous et que faites-vous dans MON manoir ?' Le vieil homme ne semble pas surpris par ta méfiance. 'Ta méfiance t'honore, jeune {character.familyName}. Oui, je connais ton nom. Je suis Aldwin, et je protège ce lieu depuis la disparition de ton grand-père.'",
      speaker: "Maître Aldwin",
      mood: "understanding"
    },
    choices: [
      {
        text: "Exiger des preuves de ses dires",
        next: "aldwin_preuves",
        action: {
          type: "skillCheck",
          skill: "intuition",
          dc: 12,
          onSuccess: "aldwin_confiance",
          onFailure: "aldwin_resistance"
        }
      },
      {
        text: "S'excuser et se présenter poliment",
        next: "rencontre_aldwin_poli"
      }
    ]
  },

  "rencontre_aldwin_observateur": {
    metadata: {
      type: SCENE_TYPES.DIALOGUE,
      chapter: "prologue",
      tags: ["observant", "impressed"],
      title: "Respect Mutuel",
      character: "maitre_aldwin"
    },
    content: {
      text: "'J'ai remarqué que vous entreteniez des protections magiques autour du domaine. Votre travail est impressionnant.' Aldwin hoche la tête avec respect : 'Peu de gens auraient remarqué ces détails. Tu as l'œil aiguisé de ton grand-père. Entre, nous avons beaucoup à discuter.'",
      speaker: "Maître Aldwin",
      mood: "impressed"
    },
    choices: [
      {
        text: "Suivre Aldwin dans le manoir",
        next: "interieur_manoir_respect",
        consequences: {
          flags: { earnedAldwinRespect: true }
        }
      }
    ]
  },

  "rencontre_aldwin_respectueux": {
    metadata: {
      type: SCENE_TYPES.DIALOGUE,
      chapter: "prologue",
      tags: ["patience", "wisdom"],
      title: "La Patience Récompensée",
      character: "maitre_aldwin"
    },
    content: {
      text: "Tu sors de ta cachette et t'approches calmement. Aldwin te sourit : 'Ta patience et ton respect pour les mystères de ce lieu me plaisent. Tu as observé sans juger, attendu sans imposer. Ces qualités faisaient de ton grand-père un excellent Gardien.'",
      speaker: "Maître Aldwin",
      mood: "wise"
    },
    choices: [
      {
        text: "Exprimer ton honneur de cette comparaison",
        next: "interieur_manoir_honneur",
        consequences: {
          flags: { aldwinHighEsteem: true }
        }
      }
    ]
  },

  "aldwin_vient_chercher": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "prologue",
      tags: ["patient", "mysterious"],
      title: "L'Invitation Inattendue"
    },
    content: {
      text: "Tu restes immobile, attendant de voir ce qui va se passer. Au bout de quelques minutes, tu entends des pas qui s'approchent de ta position. Aldwin apparaît entre les arbres, une lanterne à la main, et te sourit calmement : 'Je pensais bien que tu préférerais attendre. Viens, il est temps de parler.'"
    },
    choices: [
      {
        text: "Suivre Aldwin sans résistance",
        next: "interieur_manoir_confiance",
        consequences: {
          flags: { trustedAldwin: true }
        }
      },
      {
        text: "Rester prudent mais accepter",
        next: "interieur_manoir_aldwin"
      }
    ]
  },

  // === INTÉRIEURS DU MANOIR ===

  "interieur_manoir_aldwin": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "prologue",
      tags: ["manor", "discovery"],
      title: "À l'Intérieur du Manoir"
    },
    content: {
      text: "L'intérieur du manoir est surprenant : bien que l'architecture soit ancienne, tout est impeccablement entretenu. Des livres rares tapissent les murs, et tu remarques plusieurs artefacts magiques disposés avec soin. Aldwin te guide vers un salon confortable où un feu crépite dans la cheminée."
    },
    choices: [
      {
        text: "Demander des explications sur ton héritage",
        next: "aldwin_histoire_famille"
      },
      {
        text: "Questionner sur les événements récents",
        next: "aldwin_explication_gardien",
        condition: "gameFlags.knowsAboutBlade"
      }
    ]
  },

  "interieur_manoir_respect": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "prologue",
      tags: ["respect", "heritage"],
      title: "Un Accueil d'Honneur"
    },
    content: {
      text: "Aldwin te fait visiter le manoir avec fierté, te montrant des portraits de tes ancêtres et des objets ayant appartenu à ta famille. 'Ton grand-père serait fier de voir que tu as hérité de son sens de l'observation. Les Gardiens ont toujours eu cette qualité.'"
    },
    choices: [
      {
        text: "Apprendre l'histoire des Gardiens",
        next: "aldwin_histoire_gardiens",
        consequences: {
          flags: { learnedGuardianHistory: true }
        }
      }
    ]
  },

  "interieur_manoir_honneur": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "prologue",
      tags: ["honor", "legacy"],
      title: "L'Héritage d'Honneur"
    },
    content: {
      text: "Aldwin te mène vers un bureau où repose un portrait de ton grand-père tenant la Lame Éternelle. 'Aldric était un homme remarquable. Sa sagesse et sa patience étaient légendaires. Je vois ces mêmes qualités en toi.'"
    },
    choices: [
      {
        text: "Accepter de reprendre le flambeau familial",
        next: "acceptation_heritage",
        consequences: {
          flags: { acceptedLegacy: true, aldwinHighEsteem: true }
        }
      }
    ]
  },

  "interieur_manoir_confiance": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "prologue",
      tags: ["trust", "alliance"],
      title: "Une Alliance Naturelle"
    },
    content: {
      text: "Aldwin apprécie ta confiance immédiate. Dans son bureau, il sort une carte ancienne et des documents scellés : 'Ton grand-père m'a laissé des instructions précises pour le jour où un héritier reviendrait. Je pense que ce moment est arrivé.'"
    },
    choices: [
      {
        text: "Étudier les documents ensemble",
        next: "revelation_documents",
        consequences: {
          flags: { sawSecretDocuments: true, trustedAldwin: true }
        }
      }
    ]
  },

  // === DIALOGUES AVEC KAEL ===

  "dialogue_kael_mefiance": {
    metadata: {
      type: SCENE_TYPES.DIALOGUE,
      chapter: "prologue",
      tags: ["suspicion", "ranger"],
      title: "Méfiance Justifiée",
      character: "kael_ranger"
    },
    content: {
      text: "'Qui es-tu vraiment ? Et qu'est-ce qui me prouve que tu n'es pas lié à ces créatures ?' Kael garde sa main près de son épée. 'J'ai vu trop d'innocents se révéler être des suppôts des ombres. Ta soudaine apparition ici n'est peut-être pas une coïncidence.'",
      speaker: "Kael le Rôdeur",
      mood: "suspicious"
    },
    choices: [
      {
        text: "Montrer ta lettre d'héritage comme preuve",
        next: "kael_preuve_heritage",
        action: {
          type: "skillCheck",
          skill: "persuasion",
          dc: 13,
          onSuccess: "kael_convaincu",
          onFailure: "kael_reste_mefiant"
        }
      },
      {
        text: "Accepter sa méfiance et proposer un test",
        next: "kael_test"
      },
      {
        text: "Partir sans insister",
        next: "depart_sans_kael",
        consequences: {
          flags: { kaelRejected: true }
        }
      }
    ]
  },

  "kael_test": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "prologue",
      tags: ["test", "proof"],
      title: "Épreuve de Confiance"
    },
    content: {
      text: "'Très bien, si tu veux prouver tes intentions, accompagne-moi. Il y a un groupe d'ombres mineures près du cimetière. Si tu m'aides à les éliminer sans fuir ou me trahir, j'accepterai de t'aider.' Kael semble sérieux dans sa proposition."
    },
    choices: [
      {
        text: "Accepter le test de combat",
        next: "test_combat_kael",
        consequences: {
          flags: { acceptedKaelTest: true }
        }
      },
      {
        text: "Proposer un autre type de preuve",
        next: "kael_preuve_alternative"
      }
    ]
  },

  "kael_trustworthy": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "prologue",
      tags: ["trust", "success"],
      title: "Instinct Confirmé"
    },
    content: {
      text: "Ton instinct te dit que Kael est sincère. Ses cicatrices, sa façon de scruter les ombres, sa connaissance des créatures - tout indique un véritable chasseur d'ombres. 'Je vois que tu as l'œil pour juger les gens', dit-il en remarquant ton regard approbateur."
    },
    choices: [
      {
        text: "Faire confiance et accepter son aide",
        next: "kael_rejoint",
        consequences: {
          flags: { kaelJoined: true, trustInstinct: true }
        }
      }
    ]
  },

  "kael_uncertain": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "prologue",
      tags: ["uncertainty", "doubt"],
      title: "Doutes Persistants"
    },
    content: {
      text: "Quelque chose dans l'attitude de Kael te met mal à l'aise, sans que tu puisses identifier quoi exactement. Peut-être est-ce juste de la prudence naturelle, mais ton instinct te conseille la méfiance."
    },
    choices: [
      {
        text: "Accepter son aide malgré tes doutes",
        next: "kael_rejoint",
        consequences: {
          flags: { kaelJoined: true, hasDoubts: true },
          companions: ["kael"]
        }
      },
      {
        text: "Poliment décliner son aide",
        next: "kael_refuse"
      }
    ]
  },

  "kael_refuse": {
    metadata: {
      type: SCENE_TYPES.DIALOGUE,
      chapter: "prologue",
      tags: ["refusal", "solo"],
      title: "Chemin Solitaire",
      character: "kael_ranger"
    },
    content: {
      text: "'Je vous remercie pour votre proposition, mais je préfère gérer cette situation seul.' Kael hoche la tête avec compréhension : 'Je respecte ton choix. Mais si tu changes d'avis, je chasse ces créatures dans les marais au nord. Fais attention à toi.'",
      speaker: "Kael le Rôdeur",
      mood: "understanding"
    },
    choices: [
      {
        text: "Partir explorer les tunnels seul",
        next: "tunnels_entree_solo",
        consequences: {
          flags: { kaelRefused: true, goingSolo: true }
        }
      },
      {
        text: "Retourner au manoir plutôt",
        next: "route_domaine"
      }
    ]
  },

  "repos_avec_kael": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "prologue",
      tags: ["rest", "preparation"],
      title: "Préparatifs avec Kael"
    },
    content: {
      text: "Kael et toi prenez le temps de vous reposer et de planifier l'exploration. Il partage ses connaissances sur les créatures d'ombre et vous prépare des provisions. 'Les tunnels peuvent être traîtres. Mieux vaut être préparé que désolé.'"
    },
    choices: [
      {
        text: "Explorer les tunnels ensemble",
        next: "tunnels_entree",
        consequences: {
          flags: { preparedWithKael: true }
        }
      }
    ]
  },
 
  "repos_court_avec_kael": {
    metadata: {
      type: SCENE_TYPES.REST_SHORT,    
      title: "Repos avec Kael"
    },
    content: {
      text: "Kael approuve votre décision. 'Sage choix. Prenons quelques minutes pour nous reposer et planifier notre approche.' Vous vous installez confortablement pendant que Kael partage ses  connaissances sur les tunnels."
    },
    next: "tunnels_entree"            
  },

  // === SCÈNES DE MILLHAVEN ===

  "chambre_millhaven": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte2",
      tags: ["rest", "inn"],
      title: "Chambre au Repos du Voyageur"
    },
    content: {
      text: "Tu prends une chambre à l'auberge pour la nuit. La chambre est confortable et bien plus luxueuse que celle de Ravenscroft. Par la fenêtre, tu peux observer l'activité nocturne de Millhaven - une ville qui ne dort jamais vraiment."
    },
    choices: [
      {
        text: "Te reposer pour la nuit",
        next: "reveil_millhaven",
        action: {
          type: "longRest"
        }
      },
      {
        text: "Redescendre au salon pour écouter les conversations",
        next: "observation_salon"
      }
    ]
  },

  "seraphina_echange": {
    metadata: {
      type: SCENE_TYPES.DIALOGUE,
      chapter: "acte2",
      tags: ["negotiation", "information"],
      title: "Négociation avec Dame Seraphina",
      character: "dame_seraphina"
    },
    content: {
      text: "'Mes informations ont une valeur, naturellement. En échange de mes archives, j'aimerais que vous m'emmeniez avec vous quand vous irez récupérer la Lame Éternelle. Mon expertise historique pourrait vous être précieuse.' Ses yeux brillent d'un intérêt particulier.",
      speaker: "Dame Seraphina",
      mood: "calculating"
    },
    choices: [
      {
        text: "Accepter qu'elle vous accompagne",
        next: "seraphina_rejoint",
        consequences: {
          flags: { seraphinaJoined: true, seraphinaHidden: true }
        }
      },
      {
        text: "Refuser et chercher les informations ailleurs",
        next: "refus_seraphina",
        consequences: {
          flags: { seraphinaRefused: true }
        }
      },
      {
        text: "Demander pourquoi elle s'intéresse tant à la lame",
        next: "seraphina_motivations"
      }
    ]
  },

  "observation_reussie": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte2",
      tags: ["observation", "discovery"],
      title: "Détails Révélateurs"
    },
    content: {
      text: "En observant discrètement Dame Seraphina, tu remarques plusieurs détails troublants : elle porte un pendentif avec le même symbole que celui gravé près du manoir, ses parchemins semblent contenir des cartes détaillées de la région, et surtout, elle a une cicatrice étrange sur le poignet qui ressemble à une marque rituelle."
    },
    choices: [
      {
        text: "L'aborder avec ces observations",
        next: "dialogue_seraphina_suspicion",
        consequences: {
          flags: { noticedSeraphinaDetails: true }
        }
      },
      {
        text: "Garder ces informations pour plus tard",
        next: "dialogue_seraphina_intro",
        consequences: {
          flags: { secretObservation: true }
        }
      }
    ]
  },

  "observation_ratee": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte2",
      tags: ["failure", "noticed"],
      title: "Attention Attirée"
    },
    content: {
      text: "Dame Seraphina lève les yeux et te remarque qui l'observes. Elle sourit avec amusement : 'Vous semblez intéressé par mon travail. Approchez-vous donc, ne restez pas là à m'épier depuis l'entrée.' Son ton est amical mais tu sens qu'elle n'a rien raté de ton manège."
    },
    choices: [
      {
        text: "S'approcher et s'excuser",
        next: "dialogue_seraphina_intro",
        consequences: {
          flags: { caughtObserving: true }
        }
      }
    ]
  },

  "repos_millhaven": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte2",
      tags: ["rest", "preparation"],
      title: "Préparatifs à Millhaven"
    },
    content: {
      text: "Votre groupe prend le temps de se reposer et de se préparer avant l'expédition vers les marais. Finn vérifie ses équipements, ajuste ses détecteurs, et prépare des provisions spéciales. 'Les marais sont imprévisibles, mais avec le bon matériel, nous devrions nous en sortir !'"
    },
    choices: [
      {
        text: "Partir bien reposés vers les marais",
        next: "marais_exploration",
        consequences: {
          flags: { wellRested: true }
        }
      }
    ]
  },

  // === SCÈNES AVEC FINN ===

  "finn_inventions": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte2",
      tags: ["gnome", "inventions"],
      title: "Merveilles Mécaniques"
    },
    content: {
      text: "Finn te fait visiter son atelier avec enthousiasme. Des gadgets étranges tapissent les étagères : détecteurs à cristaux, automates de poche, et même ce qui semble être un 'Répulseur d'Énergies Négatives Portable Mark III'. 'Chaque invention résout un problème spécifique !'"
    },
    choices: [
      {
        text: "Demander une démonstration de ses détecteurs",
        next: "finn_detecteur"
      },
      {
        text: "S'intéresser aux applications militaires",
        next: "finn_applications_combat"
      }
    ]
  },

  "finn_demonstration": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte2",
      tags: ["proof", "science"],
      title: "Démonstration Scientifique"
    },
    content: {
      text: "Finn active plusieurs de ses appareils. Ses détecteurs se mettent à bourdonner et affichent des lectures inquiétantes : 'Regardez ces mesures ! L'activité planaire dans cette région est 300% au-dessus de la normale. Et voici...' Il pointe vers les marais : 'Un pic d'activité majeur là-bas !'"
    },
    choices: [
      {
        text: "Impressionné, accepter qu'il vous accompagne",
        next: "finn_rejoint",
        consequences: {
          flags: { finnJoined: true, sawDemonstration: true }
        }
      }
    ]
  },

  "finn_refuse": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte2",
      tags: ["refusal", "disappointment"],
      title: "Opportunité Manquée"
    },
    content: {
      text: "Finn semble déçu mais comprend : 'Je respecte votre décision, mais c'est dommage. Mes détecteurs montrent des anomalies fascinantes dans cette région !' Il retourne à ses expériences en marmonnant sur les 'occasions scientifiques ratées'."
    },
    choices: [
      {
        text: "Partir vers les marais sans lui",
        next: "marais_exploration",
        consequences: {
          flags: { finnRefused: true }
        }
      }
    ]
  },

  // === MARAIS ET FORTERESSE ===

  "chemin_detourne": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte2",
      tags: ["alternate", "safe"],
      title: "Voie de Contournement"
    },
    content: {
      text: "Tu choisis un chemin plus long mais apparemment plus sûr à travers les marais. Cette route vous fait contourner les zones les plus dangereuses, mais vous met à l'abri des rencontres hostiles."
    },
    choices: [
      {
        text: "Continuer prudemment",
        next: "arrivee_forteresse_sure"
      }
    ]
  },

  "chemin_sur": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte2",
      tags: ["success", "safe"],
      title: "Navigation Experte"
    },
    content: {
      text: "Tes compétences de survie te permettent de trouver un passage sûr à travers les marais. Vous évitez les zones dangereuses et arrivez à destination sans incident, conservant vos forces pour les défis à venir."
    },
    choices: [
      {
        text: "Approcher de la forteresse",
        next: "forteresse_ruines",
        consequences: {
          flags: { navigatedSafely: true }
        }
      }
    ]
  },

  "analyse_magique": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte3",
      tags: ["magic", "analysis"],
      title: "Analyse Arcanique"
    },
    content: {
      text: "L'analyse magique révèle des informations troublantes : la forteresse est saturée d'énergies planaires qui forment des motifs complexes. Au centre, une source d'énergie massive pulse comme un cœur. Ces énergies ne sont pas naturelles - quelqu'un les canalise activement.",
      variations: {
        with_finn: "Finn confirme tes observations avec ses instruments : 'Les lectures sont ahurissantes ! Quelqu'un utilise cette forteresse comme amplificateur planaire !'"
      }
    },
    conditions: {
      show_variation: {
        with_finn: "gameFlags.finnJoined"
      }
    },
    choices: [
      {
        text: "Entrer avec ces informations cruciales",
        next: "entree_forteresse",
        consequences: {
          flags: { analyzedMagic: true }
        }
      }
    ]
  },

  "passage_secret": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte3",
      tags: ["stealth", "secret"],
      title: "Entrée Discrète"
    },
    content: {
      text: "Kael repère une brèche dans le mur d'enceinte, camouflée par des lianes. 'Les anciens châteaux ont toujours des passages secrets. Celui-ci mène directement aux caves.' Cette approche vous permettra d'éviter les gardes mais vous ne savez pas ce qui vous attend à l'intérieur."
    },
    choices: [
      {
        text: "Utiliser le passage secret",
        next: "caves_forteresse",
        consequences: {
          flags: { usedSecretPassage: true }
        }
      },
      {
        text: "Changer d'avis et prendre l'entrée principale",
        next: "entree_forteresse"
      }
    ]
  },

  "evaluation_forteresse": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte3",
      tags: ["reconnaissance", "planning"],
      title: "Reconnaissance Tactique"
    },
    content: {
      text: "Vous faites le tour de la forteresse pour évaluer la situation. Plusieurs observations importantes : des lumières bougent dans certaines tours, des traces récentes d'occupation, et surtout, le silence anormal - aucun bruit d'animal ou d'insecte dans un rayon de cent mètres."
    },
    choices: [
      {
        text: "Entrer par l'entrée principale avec un plan",
        next: "entree_forteresse",
        consequences: {
          flags: { plannedEntry: true }
        }
      },
      {
        text: "Chercher une autre entrée",
        next: "passage_secret",
        condition: "gameFlags.kaelJoined"
      }
    ]
  },

  "exploration_salles": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte3",
      tags: ["exploration", "discovery"],
      title: "Salles Abandonnées"
    },
    content: {
      text: "Vous explorez les autres salles de la forteresse avant de vous diriger vers les voix. Vous découvrez des signes d'occupation récente : des lits de fortune, des restes de repas, et surtout, des cartes détaillées de la région avec des annotations en plusieurs langues."
    },
    choices: [
      {
        text: "Examiner les cartes plus attentivement",
        next: "decouverte_cartes",
        consequences: {
          flags: { foundMaps: true }
        }
      },
      {
        text: "Se diriger vers les voix maintenant",
        next: "rencontre_zara"
      }
    ]
  },

  // === SCÈNES FINALES ET COMPLÉMENTS ===

  "repos_village": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte1",
      tags: ["rest", "village"],
      title: "Repos au Village"
    },
    content: {
      text: "Vous retournez au village pour vous reposer après votre premier combat contre les créatures d'ombre. Les villageois vous regardent avec un mélange de respect et d'inquiétude - vous avez prouvé que les ombres peuvent être combattues."
    },
    choices: [
      {
        text: "Partir vers Millhaven le lendemain",
        action: {
          type: "longRest",
          next: "route_millhaven"
        }
      }
    ]
  },

  "preparation_millhaven": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte1",
      tags: ["preparation", "journey"],
      title: "Préparatifs pour Millhaven"
    },
    content: {
      text: "Avant de partir vers les marais, vous décidez de retourner à Millhaven pour vous équiper et rassembler des informations. La ville possède des ressources que le petit village de Ravenscroft ne peut offrir."
    },
    choices: [
      {
        text: "Se rendre à Millhaven",
        next: "millhaven_auberge"
      }
    ]
  },

  "symbole_magique": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte1",
      tags: ["magic", "discovery"],
      title: "Symbole Ancien"
    },
    content: {
      text: "En tant que magicien, tu reconnais ce symbole : c'est une rune de liaison planaire, utilisée pour maintenir ouverts ou fermés les passages entre les mondes. Sa présence ici confirme que ces tunnels sont liés au mystère de la Lame Éternelle.",
      variations: {
        with_finn: "Finn confirme tes observations avec ses détecteurs : 'Ce symbole émet une signature énergétique unique ! Il est encore actif après toutes ces années !'"
      }
    },
    conditions: {
      show_variation: {
        with_finn: "gameFlags.finnJoined"
      }
    },
    choices: [
      {
        text: "Étudier le symbole plus attentivement",
        next: "etude_symbole_approfondie",
        consequences: {
          flags: { understoodPlanarRunes: true }
        }
      },
      {
        text: "Continuer l'exploration",
        next: "chambre_scellee"
      }
    ]
  },

  "histoire_aldric": {
    metadata: {
      type: SCENE_TYPES.DIALOGUE,
      chapter: "acte2",
      tags: ["lore", "family"],
      title: "L'Histoire d'Aldric",
      character: "dame_seraphina"
    },
    content: {
      text: "'Votre grand-père Aldric était un homme tourmenté dans ses dernières années. Il parlait de visions, de murmures venant d'au-delà. Certains pensaient qu'il devenait fou, mais moi je crois qu'il percevait quelque chose que les autres ne pouvaient comprendre.'",
      speaker: "Dame Seraphina",
      mood: "mysterious"
    },
    choices: [
      {
        text: "Demander des détails sur ces visions",
        next: "visions_aldric"
      },
      {
        text: "Questionner sur sa disparition",
        next: "disparition_aldric"
      }
    ]
  },

  "localisation_forteresse": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte2",
      tags: ["location", "quest"],
      title: "Les Terres Englouties"
    },
    content: {
      text: "Dame Seraphina déroule une carte ancienne : 'Les 'terres englouties' font référence aux anciens marais de Sombremont, où se dressait autrefois la forteresse principale de votre famille. C'est là que les énergies planaires sont les plus fortes, et donc l'endroit le plus probable pour cacher la Lame.'"
    },
    choices: [
      {
        text: "Partir immédiatement vers la forteresse",
        next: "marais_exploration",
        consequences: {
          flags: { knowsForteressLocation: true }
        }
      },
      {
        text: "Demander plus d'informations sur la forteresse",
        next: "informations_forteresse"
      }
    ]
  },

  "course_contre_seraphina": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte3",
      tags: ["urgency", "race"],
      title: "Course Contre la Montre"
    },
    content: {
      text: "Réalisant l'urgence de la situation, vous vous précipitez vers la chambre secrète, espérant atteindre la Lame Éternelle avant Seraphina. Mais en arrivant, vous découvrez qu'elle vous attendait déjà, un sourire cruel aux lèvres."
    },
    choices: [
      {
        text: "Confronter Seraphina immédiatement",
        next: "apparition_seraphina",
        consequences: {
          flags: { rushedConfrontation: true }
        }
      }
    ]
  },

  // === COMPLÉMENTS DE RÉACTIONS ET PREUVES ===

  "test_combat_kael": {
    metadata: {
      type: SCENE_TYPES.COMBAT,
      chapter: "prologue",
      tags: ["test", "trust"],
      title: "Épreuve des Ombres",
      next: "apres_test_kael"
    },
    content: {
      text: "Kael vous mène vers le cimetière où trois ombres mineures rôdent entre les tombes. 'Montrez-moi que vous pouvez tenir bon face à ces créatures', dit-il en dégainant son épée."
    },
    enemies: [{ type: 'ombre', count: 1 }],
    enemyPositions: [
      { x: 4, y: 1 },
      { x: 5, y: 3 },
      { x: 6, y: 2 }
    ],
    choices: [
      {
        text: "Prouver ta valeur !",
        action: {
          type: "combat"
        }
      }
    ]
  },

  "apres_test_kael": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "prologue",
      tags: ["trust", "earned"],
      title: "Confiance Gagnée"
    },
    content: {
      text: "Après le combat, Kael hoche la tête avec approbation : 'Vous avez du courage et de la compétence. Je retire mes doutes - vous êtes bien quelqu'un en qui je peux avoir confiance.' Il range son épée et vous tend la main."
    },
    choices: [
      {
        text: "Accepter son alliance",
        next: "kael_rejoint",
        consequences: {
          flags: { kaelJoined: true, earnedTrust: true, provedWorth: true }
        }
      }
    ]
  },

  "tunnels_entree_solo": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte1",
      tags: ["solo", "exploration"],
      title: "Exploration Solitaire"
    },
    content: {
      text: "Sans l'aide de Kael, tu explores seul les tunnels sous le village. L'atmosphère est plus oppressante quand on est seul, et chaque bruit résonne étrangement dans l'obscurité. Tu avances avec prudence, ta seule source de lumière à la main."
    },
    choices: [
      {
        text: "Continuer malgré l'inquiétude",
        next: "decouverte_gravures",
        consequences: {
          flags: { exploredsolo: true }
        }
      },
      {
        text: "Retourner chercher de l'aide",
        next: "taverne_lanterne"
      }
    ]
  },

  "depart_sans_kael": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "prologue",
      tags: ["departure", "solo"],
      title: "Voie Solitaire"
    },
    content: {
      text: "Tu quittes la taverne sans insister auprès de Kael. Parfois, il vaut mieux faire confiance à son instinct. Tu continues ton aventure seul, comptant sur tes propres capacités pour résoudre les mystères de ta famille."
    },
    choices: [
      {
        text: "Explorer les tunnels en solitaire",
        next: "tunnels_entree_solo"
      },
      {
        text: "Se diriger vers le manoir familial",
        next: "route_domaine"
      }
    ]
  }

  // === AJOUT DES SCÈNES DE LA PARTIE 2 ===
  , ...missingScenesP2,

  // === AJOUT DES DERNIÈRES SCÈNES MANQUANTES ===
  ...finalMissingScenes,

  // === SCÈNES DE TEST ===
  ...testScenes
};

export default newScenes;