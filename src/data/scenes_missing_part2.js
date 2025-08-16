/**
 * Scènes manquantes - Partie 2
 * Combats, libérations et fins alternatives
 */

import { SCENE_TYPES } from '../types/story';

export const missingScenesP2 = {
  // === COMBATS ET APPROCHES ===

  "approche_discrete": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte3",
      tags: ["stealth", "success"],
      title: "Approche Silencieuse"
    },
    content: {
      text: "Tu t'approches discrètement des voix. Tes pas silencieux te permettent d'entendre clairement la conversation : une femme semble prisonnière d'un cercle magique et supplie pour de l'aide. Elle mentionne Dame Seraphina et une 'trahison'."
    },
    choices: [
    
      {
        text: "Révéler ta présence pour l'aider",
        next: "rencontre_zara",
        consequences: {
          flags: { approachedQuietly: true }
        }
      },
      {
        text: "Écouter plus longtemps",
        next: "ecoute_prolongee_zara"
      }
    ]
  },

  "approche_bruyante": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte3",
      tags: ["stealth", "failure"],
      title: "Pas Maladroit"
    },
    content: {
      text: "Un bruit de pierre qui roule trahit ta présence. Les voix s'arrêtent immédiatement : 'Qui va là ? Si vous pouvez m'entendre, je vous en prie, aidez-moi ! Je suis prisonnière ici !' Il n'y a plus de surprise possible."
    },
    choices: [
      {
        text: "Entrer directement dans la salle",
        next: "rencontre_zara",
        consequences: {
          flags: { alertedZara: true }
        }
      }
    ]
  },

  // === LIBÉRATION DE ZARA ===

  "liberation_zara": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte3",
      tags: ["puzzle", "magic"],
      title: "Cercle de Captivité"
    },
    content: {
      text: "Tu examines le cercle magique qui emprisonne Zara. Les runes sont complexes, mais tu identifies le point faible : un cristal central qui alimente le sort. Briser le cristal devrait libérer la prisonnière."
    },
    choices: [
      {
        text: "Briser le cristal avec prudence",
        next: "zara_liberee",
        action: {
          type: "skillCheck",
          skill: "arcane",
          dc: 15,
          onSuccess: "zara_liberee",
          onFailure: "liberation_ratee"
        }
      },
      {
        text: "Chercher une autre méthode",
        next: "methode_alternative_liberation"
      }
    ]
  },

  "liberation_ratee": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte3",
      tags: ["failure", "backlash"],
      title: "Magie Instable"
    },
    content: {
      text: "Ton intervention provoque une instabilité magique ! Le cercle pulse violemment et Zara crie de douleur. Heureusement, après quelques secondes terrifiantes, le sort finit par se briser, mais l'expérience a été éprouvante pour vous deux."
    },
    choices: [
      {
        text: "Vérifier que Zara va bien",
        next: "zara_liberee",
        consequences: {
          flags: { liberationDifficile: true }
        }
      }
    ]
  },

  "zara_explication": {
    metadata: {
      type: SCENE_TYPES.DIALOGUE,
      chapter: "acte3",
      tags: ["explanation", "caution"],
      title: "Révélations Prudentes",
      character: "zara_sorciere"
    },
    content: {
      text: "'Je suis Zara, une érudite en phénomènes planaires. J'étudiais les anomalies de cette région quand j'ai découvert que Dame Seraphina manipulait activement les énergies. Quand j'ai essayé de partir pour alerter les autorités, elle m'a piégée ici.'",
      speaker: "Zara la Sorcière",
      mood: "cautious"
    },
    choices: [
      {
        text: "Lui faire confiance et la libérer",
        next: "liberation_zara"
      },
      {
        text: "Demander plus de preuves",
        next: "zara_preuves",
        action: {
          type: "skillCheck",
          skill: "intuition",
          dc: 14,
          onSuccess: "zara_convaincante",
          onFailure: "zara_suspicion"
        }
      }
    ]
  },

  "zara_mefiance": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte3",
      tags: ["suspicion", "careful"],
      title: "Prudence Justifiée"
    },
    content: {
      text: "Ta méfiance est compréhensible. Dans cette région, les apparences sont souvent trompeuses. Tu décides d'observer Zara plus attentivement : ses vêtements d'érudite semblent authentiques, ses connaissances magiques paraissent réelles, et surtout, elle semble vraiment souffrir dans ce cercle."
    },
    choices: [
      {
        text: "Décider de lui faire confiance",
        next: "liberation_zara"
      },
      {
        text: "Partir sans la libérer",
        next: "abandon_zara",
        consequences: {
          flags: { abandonedZara: true }
        }
      }
    ]
  },

  "zara_alliance": {
    metadata: {
      type: SCENE_TYPES.DIALOGUE,
      chapter: "acte3",
      tags: ["alliance", "team"],
      title: "Formation de l'Alliance",
      character: "zara_sorciere"
    },
    content: {
      text: "'Si vous cherchez la Lame Éternelle, nous avons un ennemi commun en Seraphina. Mes connaissances sur les énergies planaires pourraient vous être précieuses. Acceptez-vous que je me joigne à vous ?'",
      speaker: "Zara la Sorcière",
      mood: "hopeful"
    },
    choices: [
      {
        text: "Accepter son aide avec plaisir",
        next: "team_complete",
        consequences: {
          flags: { zaraJoined: true, teamComplete: true },
          companions: ["zara"]
        }
      },
      {
        text: "Accepter mais rester prudent",
        next: "alliance_prudente",
        consequences: {
          flags: { zaraJoined: true, cautious: true },
          companions: ["zara"]
        }
      }
    ]
  },

  // === DÉFIS DE COMBAT ALTERNATIFS ===

  "gardiens_pacifies": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte3",
      tags: ["diplomacy", "success"],
      title: "Voix de la Raison"
    },
    content: {
      text: "Tes paroles atteignent quelque chose de profondément enfoui dans les gardiens corrompus. Leurs yeux rougeoyants vacillent, et lentement, ils baissent leurs armes. 'Maître... descendant...' murmure l'un d'eux avant qu'ils ne s'effondrent, enfin libérés de leur corruption."
    },
    choices: [
      {
        text: "Honorer leur sacrifice et continuer",
        next: "decouverte_lame",
        consequences: {
          flags: { savedGuardians: true, peacefulResolution: true }
        }
      }
    ]
  },

  "tentative_negociation": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte3",
      tags: ["diplomacy", "attempt"],
      title: "Appel à l'Humanité"
    },
    content: {
      text: "'Vous étiez les gardiens de ma famille ! Souvenez-vous de votre honneur, de votre serment !' Tu tends la main vers eux, espérant réveiller leur humanité perdue. Les créatures hésitent un instant, comme si tes paroles réveillaient de lointains souvenirs."
    },
    choices: [
      {
        text: "Continuer à faire appel à leur humanité",
        next: "gardiens_pacifies",
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

  // === RÉCUPÉRATION DE LA LAME ===

  "saisie_lame_rapide": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte3",
      tags: ["action", "blade"],
      title: "Réflexes Éclairs"
    },
    content: {
      text: "D'un mouvement rapide, tu saisis la Lame Éternelle ! Elle pulse d'une énergie chaude et réconfortante entre tes mains. Mais les applaudissements continuent derrière toi..."
    },
    choices: [
      {
        text: "Te retourner, lame en main",
        next: "apparition_seraphina",
        consequences: {
          flags: { hasBladeEarly: true }
        }
      }
    ]
  },

  "lame_saisie": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte3",
      tags: ["success", "heritage"],
      title: "L'Héritage Reclamé"
    },
    content: {
      text: "Tes réflexes te permettent de saisir la Lame Éternelle avant que Seraphina ne puisse réagir. L'épée semble reconnaître ton sang - elle pulse d'une lumière dorée et tu sens immédiatement son pouvoir couler en toi. Tu es le véritable héritier."
    },
    choices: [
      {
        text: "Faire face à Seraphina, lame au poing",
        next: "confrontation_avec_lame",
        consequences: {
          flags: { hasBladeEarly: true, bladeRecognizedHeir: true }
        }
      }
    ]
  },

  // === BOSS FIGHT ALTERNATIFS ===

  "preparation_combat_final": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte4",
      tags: ["preparation", "tactical"],
      title: "Préparatifs de Bataille"
    },
    content: {
      text: "Sans perdre de temps en discussions, tu prépares tes défenses et positionnes tes compagnons. Cette initiative te donne l'avantage : Seraphina semble surprise par ta rapidité de réaction.",
      variations: {
        team_advantage: "Tes compagnons comprennent immédiatement et se positionnent strategiquement autour de la salle."
      }
    },
    conditions: {
      show_variation: {
        team_advantage: "gameFlags.kaelJoined || gameFlags.finnJoined || gameFlags.zaraJoined"
      }
    },
    choices: [
      {
        text: "Attaquer en premier !",
        next: "combat_seraphina",
        consequences: {
          flags: { preparedForFinalBattle: true, combatAdvantage: true }
        }
      }
    ]
  },

  "seraphina_hesitate": {
    metadata: {
      type: SCENE_TYPES.DIALOGUE,
      chapter: "acte4",
      tags: ["redemption", "hesitation"],
      title: "Moment d'Hésitation",
      character: "seraphina_enemy"
    },
    content: {
      text: "Tes paroles semblent toucher quelque chose en Seraphina. Ses yeux brillants vacillent un instant : 'Tu... tu ne comprends pas. Des siècles d'humiliation... ma famille déshonorée...' Mais l'énergie sombre autour d'elle pulse plus fort, comme si elle luttait contre elle-même.",
      speaker: "Dame Seraphina",
      mood: "conflicted"
    },
    choices: [
      {
        text: "Insister sur la rédemption",
        next: "redemption_seraphina",
        action: {
          type: "skillCheck",
          skill: "persuasion",
          dc: 22,
          onSuccess: "seraphina_redeemed",
          onFailure: "combat_seraphina"
        }
      },
      {
        text: "Profiter de son hésitation pour attaquer",
        next: "combat_seraphina",
        consequences: {
          flags: { betrayedHesitation: true }
        }
      }
    ]
  },

  // === FINS ALTERNATIVES ===

  "tentative_purification": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte4",
      tags: ["magic", "alternative"],
      title: "La Troisième Voie"
    },
    content: {
      text: "Au lieu de détruire ou de garder la lame, tu tentes quelque chose d'inédit : utiliser tes connaissances magiques pour purifier la Porte des Murmures elle-même. C'est un défi énorme et dangereux.",
      variations: {
        zara_help: "Zara joint ses efforts aux tiens : 'C'est fou... mais cela pourrait marcher ! Essayons !'"
      }
    },
    conditions: {
      show_variation: {
        zara_help: "gameFlags.zaraJoined"
      }
    },
    choices: [
      {
        text: "Canaliser le pouvoir de purification",
        next: "fin_purification_reussie",
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

  "fin_purification_ratee": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "epilogue",
      tags: ["ending", "failure"],
      title: "Purification Incomplète"
    },
    content: {
      text: "Malgré tes efforts héroïques, la purification échoue partiellement. La Porte des Murmures est stabilisée mais non purifiée, créant une situation précaire. Tu devras surveiller ce site en permanence, devenant de facto le nouveau Gardien par nécessité plutôt que par choix."
    },
    choices: [
      {
        text: "Accepter cette responsabilité",
        next: "epilogue_gardien_force",
        consequences: {
          flags: { forcedGuardianship: true }
        }
      }
    ]
  },

  // === ÉPILOGUES SPÉCIALISÉS ===

  "epilogue_gardien": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "epilogue",
      tags: ["ending", "responsibility"],
      title: "Le Nouveau Gardien"
    },
    content: {
      text: "Tu t'installes dans l'ancien manoir familial, prenant officiellement le titre de Gardien de la Lame Éternelle. Aldwin devient ton mentor, t'enseignant les secrets ancestraux. Bien que confiné à cette région, tu sens que ton rôle a un sens profond."
    },
    choices: [
      {
        text: "Embrasser pleinement ton nouveau rôle",
        next: "epilogue_retour_village"
      }
    ]
  },

  "epilogue_chercheur": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "epilogue",
      tags: ["ending", "discovery"],
      title: "Chercheur de Mystères"
    },
    content: {
      text: "Ta découverte de la purification des Portes révolutionne la compréhension des phénomènes planaires. Tu deviens un érudit reconnu, consultant pour d'autres sites mystérieux à travers le continent. Ton innovation ouvre de nouvelles possibilités."
    },
    choices: [
      {
        text: "Continuer tes recherches",
        next: "formation_nouvel_ordre"
      }
    ]
  },

  "reflexion_finale": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "epilogue",
      tags: ["contemplation", "choice"],
      title: "Temps de Réflexion"
    },
    content: {
      text: "'J'ai besoin de temps pour réfléchir à tout ce qui s'est passé. Cette aventure m'a beaucoup appris sur moi-même et ma famille.' Maître Aldwin hoche la tête avec compréhension : 'Sage décision. Les grandes responsabilités ne doivent pas être acceptées à la légère. Je resterai ici si vous changez d'avis.'"
    },
    choices: [
      {
        text: "Prendre une année de réflexion",
        next: "fin_reflexion_prolongee"
      },
      {
        text: "Finalement accepter après mûre réflexion",
        next: "formation_nouvel_ordre"
      }
    ]
  },

  "retraite_heroique": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "epilogue",
      tags: ["ending", "retirement"],
      title: "La Retraite du Héros"
    },
    content: {
      text: "'J'ai fait ma part. D'autres peuvent reprendre le flambeau.' Maître Aldwin semble déçu mais respecte ton choix : 'Tu as sauvé cette région, nul ne peut te reprocher de vouloir une vie paisible. Ton héritage parlera pour toi.'"
    },
    choices: [
      {
        text: "Retourner à ta vie d'avant",
        next: "fin_vie_paisible"
      },
      {
        text: "Rester dans la région mais sans responsabilités",
        next: "fin_resident_local"
      }
    ]
  },

  "team_complete": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte3",
      tags: ["team", "complete"],
      title: "L'Équipe Réunie"
    },
    content: {
      text: "Avec Zara qui se joint à votre groupe, votre équipe est maintenant complète. Kael apporte son expertise de chasseur, Finn ses inventions ingénieuses, et Zara ses connaissances des énergies planaires. Ensemble, vous formez une alliance redoutable pour affronter les défis à venir.",
      variations: {
        without_kael: "Avec Zara, Finn et toi, vous formez une équipe équilibrée entre science et magie.",
        without_finn: "Avec Zara et Kael, vous combinez expertise martiale et connaissances arcaniques.",
        solo_plus_zara: "Avec Zara à tes côtés, tu as maintenant une alliée experte en phénomènes planaires."
      }
    },
    conditions: {
      show_variation: {
        without_kael: "!gameFlags.kaelJoined && gameFlags.finnJoined",
        without_finn: "gameFlags.kaelJoined && !gameFlags.finnJoined",
        solo_plus_zara: "!gameFlags.kaelJoined && !gameFlags.finnJoined"
      }
    },
    choices: [
      {
        text: "Partir ensemble vers la chambre secrète",
        next: "recherche_lame",
        consequences: {
          flags: { teamComplete: true, zaraJoined: true }
        }
      },
      {
        text: "Prendre le temps de planifier ensemble",
        next: "planification_equipe"
      }
    ]
  },

  "alliance_prudente": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte3",
      tags: ["alliance", "caution"],
      title: "Alliance Prudente"
    },
    content: {
      text: "Tu acceptes l'aide de Zara tout en gardant une certaine réserve. Après tout, dans cette situation, il vaut mieux rester vigilant. Zara semble comprendre ta prudence : 'Sage précaution. La confiance se gagne avec le temps.'"
    },
    choices: [
      {
        text: "Avancer ensemble vers la lame",
        next: "recherche_lame",
        consequences: {
          flags: { zaraJoined: true, cautious: true }
        }
      }
    ]
  }
};

export default missingScenesP2;