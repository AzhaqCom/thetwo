/**
 * Dernières scènes manquantes pour compléter l'arbre narratif
 */

import { SCENE_TYPES } from '../types/story';

export const finalMissingScenes = {
  // === SCÈNES ALDWIN MANQUANTES ===

  "acceptation_heritage": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "prologue",
      tags: ["heritage", "acceptance"],
      title: "Acceptation de l'Héritage"
    },
    content: {
      text: "Tu acceptes solennellement de reprendre le flambeau familial. Aldwin sourit avec satisfaction : 'Excellent. Il est temps que tu apprennes tout sur ton héritage. La route sera difficile, mais tu n'es plus seul.'"
    },
    choices: [
      {
        text: "Demander à apprendre immédiatement",
        next: "aldwin_histoire_gardiens",
        consequences: {
          flags: { acceptedLegacy: true, readyToLearn: true }
        }
      }
    ]
  },

  "aldwin_explication_gardien": {
    metadata: {
      type: SCENE_TYPES.DIALOGUE,
      chapter: "prologue",
      tags: ["explanation", "guardian"],
      title: "Le Rôle du Gardien",
      character: "maitre_aldwin"
    },
    content: {
      text: "'Un Gardien n'est pas qu'un protecteur de relique. Il maintient l'équilibre entre notre monde et les autres plans d'existence. La Lame Éternelle n'est qu'un outil - le vrai pouvoir réside dans la volonté et la sagesse du porteur.'",
      speaker: "Maître Aldwin",
      mood: "wise"
    },
    choices: [
      {
        text: "Comprendre les responsabilités",
        next: "responsabilites_gardien"
      },
      {
        text: "Demander des détails sur les plans d'existence",
        next: "cours_plans_existence"
      }
    ]
  },

  "aldwin_histoire_famille": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "prologue", 
      tags: ["family", "history"],
      title: "L'Histoire de la Lignée"
    },
    content: {
      text: "Aldwin te raconte l'histoire de ta famille : 'Les tiens gardent ce domaine depuis huit siècles. Chaque génération a produit au moins un Gardien. Ton grand-père Aldric était le dernier d'une longue lignée de héros. Et maintenant, c'est ton tour.'"
    },
    choices: [
      {
        text: "Apprendre sur les précédents Gardiens",
        next: "aldwin_histoire_gardiens"
      },
      {
        text: "Se concentrer sur Aldric",
        next: "histoire_aldric_aldwin"
      }
    ]
  },

  "aldwin_histoire_gardiens": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "prologue",
      tags: ["lore", "guardians"],
      title: "L'Ordre des Gardiens"
    },
    content: {
      text: "Aldwin déroule un parchemin ancien montrant l'arbre généalogique de ta famille : 'Chaque Gardien avait ses propres défis. Certains ont affronté des invasions planaires, d'autres ont découvert de nouveaux sites à protéger. Ta destinée sera unique, mais tu portes leur héritage.'"
    },
    choices: [
      {
        text: "Accepter cet héritage avec fierté",
        next: "serment_gardien",
        consequences: {
          flags: { proudOfHeritage: true, learnedGuardianHistory: true }
        }
      }
    ]
  },

  "aldwin_preuves": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "prologue",
      tags: ["proof", "verification"],
      title: "Preuves de Légitimité"
    },
    content: {
      text: "Aldwin sort plusieurs objets personnels de ton grand-père : sa bague avec le sceau familial, des lettres écrites de sa main, et même un portrait de lui tenant la Lame Éternelle. 'Ces preuves suffisent-elles à dissiper tes doutes ?'"
    },
    choices: [
      {
        text: "Être convaincu par les preuves",
        next: "aldwin_confiance"
      },
      {
        text: "Garder une réserve prudente",
        next: "aldwin_resistance"
      }
    ]
  },

  "aldwin_confiance": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "prologue",
      tags: ["trust", "alliance"],
      title: "Confiance Établie"
    },
    content: {
      text: "Les preuves sont irréfutables et l'attitude d'Aldwin inspire confiance. Tu décides de lui faire confiance et d'accepter son aide pour comprendre ton héritage familial."
    },
    choices: [
      {
        text: "Apprendre l'histoire complète",
        next: "aldwin_histoire_gardiens",
        consequences: {
          flags: { trustsAldwin: true }
        }
      }
    ]
  },

  "aldwin_resistance": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "prologue",
      tags: ["resistance", "caution"],
      title: "Réserve Maintenue"
    },
    content: {
      text: "Malgré les preuves, tu maintiens une certaine réserve. Aldwin semble comprendre : 'Ta prudence t'honore. Un bon Gardien ne fait jamais confiance aveuglément. Prends le temps dont tu as besoin.'"
    },
    choices: [
      {
        text: "Demander à repartir pour réfléchir",
        next: "retour_village_reflexion"
      },
      {
        text: "Rester mais garder ses distances",
        next: "cohabitation_prudente"
      }
    ]
  },

  // === SCÈNES SERAPHINA MANQUANTES ===

  "dialogue_seraphina_suspicion": {
    metadata: {
      type: SCENE_TYPES.DIALOGUE,
      chapter: "acte2",
      tags: ["suspicion", "confrontation"],
      title: "Soupçons Exprimés",
      character: "dame_seraphina"
    },
    content: {
      text: "'J'ai remarqué certains détails troublants... votre pendentif, vos cartes...' Dame Seraphina ne semble pas surprise : 'Vous êtes très observateur. Oui, j'ai un intérêt personnel dans cette affaire. Ma famille a aussi une histoire avec la Lame Éternelle.'",
      speaker: "Dame Seraphina",
      mood: "defensive"
    },
    choices: [
      {
        text: "Demander des explications",
        next: "seraphina_verite_partielle"
      },
      {
        text: "Rester sur ses gardes",
        next: "seraphina_mefiance_mutuelle"
      }
    ]
  },

  "seraphina_motivations": {
    metadata: {
      type: SCENE_TYPES.DIALOGUE,
      chapter: "acte2",
      tags: ["motivation", "hidden"],
      title: "Motivations Cachées",
      character: "dame_seraphina"
    },
    content: {
      text: "'Pourquoi cette fascination pour la Lame Éternelle ?' Seraphina hésite un moment : 'Disons que ma famille a... des comptes à régler avec l'histoire. Certaines injustices doivent être réparées.'",
      speaker: "Dame Seraphina",
      mood: "evasive"
    },
    choices: [
      {
        text: "Insister pour plus de détails",
        next: "seraphina_verite_partielle"
      },
      {
        text: "Accepter son aide malgré les mystères",
        next: "seraphina_aide"
      }
    ]
  },

  "seraphina_rejoint": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte2",
      tags: ["companion", "hidden"],
      title: "Une Alliée Mystérieuse"
    },
    content: {
      text: "Dame Seraphina se joint à votre groupe avec ses propres préparatifs mystérieux. Elle semble connaître parfaitement la route vers les marais et possède des équipements inhabituels pour une simple noble. Ses véritables intentions restent énigmatiques."
    },
    choices: [
      {
        text: "Partir vers les marais avec elle",
        next: "marais_exploration",
        consequences: {
          flags: { seraphinaJoined: true, seraphinaHidden: true }
        }
      }
    ]
  },

  "refus_seraphina": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte2",
      tags: ["refusal", "independence"],
      title: "Refus Diplomatique"
    },
    content: {
      text: "Tu déclines poliment l'offre de Dame Seraphina. Ses yeux brillent d'une lueur étrange un instant, mais elle maintient son sourire courtois : 'Comme vous voudrez. J'espère que vous trouverez ce que vous cherchez.' Il y a quelque chose d'inquiétant dans son ton."
    },
    choices: [
      {
        text: "Partir vers les marais sans elle",
        next: "marais_exploration",
        consequences: {
          flags: { seraphinaRefused: true, seraphinaHostile: true }
        }
      }
    ]
  },

  // === SCÈNES DE DÉTAILS MANQUANTES ===

  "visions_aldric": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte2",
      tags: ["visions", "mystery"],
      title: "Les Visions d'Aldric"
    },
    content: {
      text: "'Il parlait de murmures dans les murs, d'ombres qui bougeaient toutes seules, de voix l'appelant depuis l'au-delà. Vers la fin, il ne dormait plus, hanté par des cauchemars qu'il ne pouvait décrire.' Les derniers jours de ton grand-père semblent avoir été terrifiants."
    },
    choices: [
      {
        text: "Demander plus de détails",
        next: "details_visions_aldric"
      },
      {
        text: "Changer de sujet - c'est troublant",
        next: "localisation_forteresse"
      }
    ]
  },

  "disparition_aldric": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte2",
      tags: ["disappearance", "mystery"],
      title: "La Nuit de la Disparition"
    },
    content: {
      text: "'Il est parti une nuit d'orage, emportant seulement la Lame Éternelle. On a retrouvé ses traces qui menaient vers les marais, puis plus rien. Certains disent qu'il s'est sacrifié pour fermer une brèche planaire. D'autres pensent qu'il a été consumé par sa propre quête.'"
    },
    choices: [
      {
        text: "Demander où ont été vues ses dernières traces",
        next: "localisation_forteresse"
      }
    ]
  },

  "informations_forteresse": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte2",
      tags: ["information", "fortress"],
      title: "Détails sur Sombremont"
    },
    content: {
      text: "'La forteresse de Sombremont était le cœur du pouvoir de votre famille. Construite sur un nexus planaire naturel, elle amplifiait les capacités des Gardiens. Mais depuis sa chute, l'endroit est devenu instable et dangereux.'"
    },
    choices: [
      {
        text: "Partir maintenant avec ces informations",
        next: "marais_exploration",
        consequences: {
          flags: { knowsForteressHistory: true }
        }
      }
    ]
  },

  // === SCÈNES TECHNIQUES MANQUANTES ===

  "arrivee_forteresse_sure": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte3",
      tags: ["arrival", "safe"],
      title: "Arrivée Sécurisée"
    },
    content: {
      text: "Votre route prudente à travers les marais vous mène sains et saufs à la forteresse. Vous arrivez bien reposés et prêts à affronter les défis qui vous attendent dans les ruines de Sombremont."
    },
    choices: [
      {
        text: "Approcher de la forteresse",
        next: "forteresse_ruines"
      }
    ]
  },

  "caves_forteresse": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte3",
      tags: ["underground", "secret"],
      title: "Caves Secrètes"
    },
    content: {
      text: "Le passage secret vous mène dans les anciennes caves de la forteresse. L'air est stagnant et chargé d'énergie magique. Des runes de protection anciennes brillent faiblement sur les murs, mais certaines semblent défaillantes."
    },
    choices: [
      {
        text: "Explorer les caves prudemment",
        next: "exploration_caves"
      },
      {
        text: "Monter directement vers les étages supérieurs",
        next: "entree_forteresse"
      }
    ]
  },

  "decouverte_cartes": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte3",
      tags: ["discovery", "intelligence"],
      title: "Cartes Révélatrices"
    },
    content: {
      text: "Les cartes sont annotées en plusieurs langues et montrent des points d'intérêt dans toute la région. Plus troublant encore, elles marquent l'emplacement exact de sites planaires à travers le continent. Quelqu'un planifie quelque chose de grande envergure."
    },
    choices: [
      {
        text: "Emporter les cartes comme preuves",
        next: "rencontre_zara",
        consequences: {
          flags: { foundMaps: true, evidenceGathered: true }
        }
      }
    ]
  },

  // === AUTRES SCÈNES VARIÉES ===

  "observation_salon": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte2",
      tags: ["observation", "inn"],
      title: "Écoute au Salon"
    },
    content: {
      text: "Au salon de l'auberge, tu écoutes les conversations des autres clients. Les marchands parlent de routes dangereuses, les voyageurs mentionnent des phénomènes étranges dans les marais. Ces informations pourraient être utiles."
    },
    choices: [
      {
        text: "Retourner te coucher avec ces informations",
        next: "reveil_millhaven",
        action: {
          type: "longRest"
        },
        consequences: {
          flags: { gatheredIntelligence: true }
        }
      }
    ]
  },

  "reveil_millhaven": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte2",
      tags: ["morning", "preparation"],
      title: "Réveil à Millhaven"
    },
    content: {
      text: "Tu te réveilles reposé dans ta chambre d'auberge. La lumière du matin filtre par la fenêtre et l'activité de Millhaven commence déjà. Il est temps de continuer ton aventure."
    },
    choices: [
      {
        text: "Descendre rejoindre tes compagnons",
        next: "reunion_equipe_millhaven"
      },
      {
        text: "Aller parler à Dame Seraphina",
        next: "dialogue_seraphina_intro"
      }
    ]
  },

  "kael_preuve_heritage": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "prologue",
      tags: ["proof", "heritage"],
      title: "Lettre d'Héritage"
    },
    content: {
      text: "Tu montres à Kael la lettre officielle qui t'a amené ici. Il l'examine attentivement, vérifie le sceau et hoche la tête : 'Cette lettre semble authentique. Soit tu es vraiment l'héritier, soit tu es un faussaire très doué.'"
    },
    choices: [
      {
        text: "Insister sur ton authenticité",
        next: "kael_convaincu",
        action: {
          type: "skillCheck",
          skill: "persuasion",
          dc: 13,
          onSuccess: "kael_convaincu",
          onFailure: "kael_reste_mefiant"
        }
      }
    ]
  },

  "kael_convaincu": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "prologue",
      tags: ["trust", "acceptance"],
      title: "Confiance Accordée"
    },
    content: {
      text: "Kael semble convaincu par tes arguments et tes preuves : 'Très bien, je vous fais confiance. Si vous êtes vraiment de la lignée des Gardiens, alors nous avons peut-être une chance de résoudre ce problème.'"
    },
    choices: [
      {
        text: "Accepter son aide avec gratitude",
        next: "kael_rejoint",
        consequences: {
          flags: { kaelJoined: true, provedHeritage: true }
        }
      }
    ]
  },

  "kael_reste_mefiant": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "prologue",
      tags: ["suspicion", "doubt"],
      title: "Doutes Persistants"
    },
    content: {
      text: "Malgré tes efforts, Kael garde ses réserves : 'Les preuves peuvent être falsifiées, et j'ai vu trop de mensonges dans cette région. Prouvez-moi votre valeur par des actes, pas par des paroles.'"
    },
    choices: [
      {
        text: "Accepter de prouver ta valeur",
        next: "kael_test"
      },
      {
        text: "Partir sans insister davantage",
        next: "depart_sans_kael"
      }
    ]
  },

  "kael_preuve_alternative": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "prologue",
      tags: ["alternative", "proof"],
      title: "Autre Forme de Preuve"
    },
    content: {
      text: "'Je propose autre chose que le combat. Laissez-moi vous montrer mes connaissances sur les créatures d'ombre ou mes compétences magiques.' Kael réfléchit : 'Intéressant. Montrez-moi ce que vous savez sur ces créatures.'"
    },
    choices: [
      {
        text: "Démontrer tes connaissances",
        next: "demonstration_connaissances",
        action: {
          type: "skillCheck",
          skill: "arcane",
          dc: 14,
          onSuccess: "kael_impressionne",
          onFailure: "kael_decu"
        }
      }
    ]
  },

  "finn_applications_combat": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte2",
      tags: ["gnome", "combat"],
      title: "Inventions de Combat"
    },
    content: {
      text: "Finn te montre ses créations orientées combat : 'J'ai des projectiles à énergie concentrée, des boucliers temporaires, et même un disrupteur planaire expérimental ! Bien sûr, ils ne sont pas tous... complètement testés.'"
    },
    choices: [
      {
        text: "Être impressionné par son arsenal",
        next: "finn_rejoint",
        consequences: {
          flags: { finnJoined: true, sawCombatGear: true }
        }
      },
      {
        text: "S'inquiéter des équipements non testés",
        next: "finn_prudence"
      }
    ]
  },

  "etude_symbole_approfondie": {
    metadata: {
      type: SCENE_TYPES.TEXT,
      chapter: "acte1",
      tags: ["study", "magic"],
      title: "Étude Arcanique Approfondie"
    },
    content: {
      text: "Ton étude approfondie du symbole révèle des détails fascinants : il s'agit d'un verrou planaire à plusieurs niveaux, conçu pour se renforcer au fil du temps. Mais il montre des signes d'affaiblissement récent."
    },
    choices: [
      {
        text: "Continuer l'exploration avec ces connaissances",
        next: "chambre_scellee",
        consequences: {
          flags: { understoodPlanarRunes: true, expertKnowledge: true }
        }
      }
    ]
  }
};

export default finalMissingScenes;