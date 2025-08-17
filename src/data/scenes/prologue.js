/**
 * Scènes du Prologue - Nouveau format unifié
 * Première partie de l'aventure : Arrivée à Ravenscroft et découverte de l'héritage
 */

import { SCENE_TYPES } from '../../types/story';

export const prologueScenes = {
  "introduction": {
    id: "introduction",
    type: SCENE_TYPES.TEXT,

    content: {
      title: "L'Héritage Inattendu",
      text: "Après des jours de voyage sur des routes poussiéreuses, tu arrives enfin aux Terres de Vethkar. Tu tiens dans ta main une lettre jaunie qui t'informe de ton héritage : un domaine familial dans le village isolé de Ravenscroft. Étrangement, tu n'avais jamais entendu parler de cette branche de ta famille.\n\nLe paysage devient plus sombre à mesure que tu approches du village. Les arbres semblent tordus, et une brume persistante flotte au-dessus des marais environnants. Au loin, tu aperçois les toits de chaume de Ravenscroft et la lueur vacillante d'une enseigne de taverne.",
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
        text: "🧪 ZONE DE TEST - Tester toutes les fonctionnalités",
        next: "test_start"
      },
      {
        text: "Test Combat",
        next: "test_combat",
        consequences: {
          experience: 25,
          flags: { exploredPerimeter: true }
        }
      },
      {
        text: "Se rendre directement à la taverne du village",
        next: "taverne_lanterne",
        consequences: {
          flags: { arrivedAtVillage: true },
          visitLocation: "ravenscroft_village"
        }
      },
      {
        text: "Explorer les environs avant d'entrer au village",
        next: "exploration_perimetres",
        consequences: {
          experience: 25,
          flags: { exploredPerimeter: true }
        }
      }
    ],

    metadata: {
      chapter: "prologue",
      location: "Route vers Ravenscroft",
      tags: ["intro", "heritage", "mystery"]
    }
  },

};

export default prologueScenes;