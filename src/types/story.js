/**
 * Types et interfaces pour le système de scènes narratives
 */

// Types de base pour les scènes
export const SCENE_TYPES = {
  TEXT: 'text',
  DIALOGUE: 'dialogue', 
  INTERACTIVE: 'interactive_scene',
  MERCHANT: 'merchant',
  COMBAT: 'combat',
  REST_LONG: 'rest_long',
  REST_SHORT: 'rest_short',
  REST_CHOICE: 'rest_choice'  // Nouveau : Choix entre repos court/long
};

// Types d'actions possibles
export const ACTION_TYPES = {
  SCENE_TRANSITION: 'scene_transition',
  COMBAT: 'combat',
  SHORT_REST: 'shortRest', 
  LONG_REST: 'longRest',
  ITEM_GAIN: 'item',
  ALLY_JOIN: 'ally',
  SKILL_CHECK: 'skillCheck',
  SHOP_OPEN: 'openShop',
  SHOP_SELL: 'openSellInterface',
  FLAG_SET: 'setFlag',
  REPUTATION_CHANGE: 'changeReputation'
};

/**
 * Structure d'une scène de base
 */
export const BaseSceneSchema = {
  metadata: {
    type: 'string', // SCENE_TYPES
    chapter: 'string', 
    tags: 'array',
    title: 'string',
    character: 'string', // Pour dialogues
    location: 'string',
    background: 'string', // Pour scènes interactives
    shop_type: 'string' // Pour marchands
  },
  content: {
    text: 'string',
    speaker: 'string', // Pour dialogues
    portrait: 'string', // Pour dialogues
    description: 'string', // Description additionelle
    variations: {
      // key: condition_name, value: text_variant
    }
  },
  conditions: {
    show_if: 'string', // Condition pour afficher la scène
    show_variation: {
      // key: variation_name, value: condition_string
    }
  },
  choices: [
    {
      text: 'string',
      next: 'string', // Scene ID
      condition: 'string', // Condition pour afficher le choix
      action: {
        type: 'string', // ACTION_TYPES
        // Propriétés spécifiques selon le type
      },
      consequences: {
        flags: 'object', // Flags à modifier
        reputation: 'number', // Changement de réputation
        items: 'array', // Items à ajouter
        companions: 'array' // Compagnons à ajouter
      }
    }
  ],
  effects: {
    on_enter: 'function', // Fonction exécutée à l'entrée
    on_exit: 'function' // Fonction exécutée à la sortie
  }
};

/**
 * Structure pour scènes interactives
 */
export const InteractiveSceneSchema = {
  ...BaseSceneSchema,
  metadata: {
    ...BaseSceneSchema.metadata,
    type: 'interactive_scene',
    background: 'string', // Image de fond
    hotspots: true
  },
  hotspots: [
    {
      id: 'string',
      coordinates: {
        x: 'number',
        y: 'number', 
        width: 'number',
        height: 'number'
      },
      text: 'string', // Texte au survol
      condition: 'string', // Condition pour afficher
      action: {
        type: 'string',
        next: 'string',
        message: 'string'
      }
    }
  ]
};

/**
 * Structure pour dialogues
 */
export const DialogueSceneSchema = {
  ...BaseSceneSchema,
  metadata: {
    ...BaseSceneSchema.metadata,
    type: 'dialogue',
    character: 'string' // ID du PNJ
  },
  content: {
    ...BaseSceneSchema.content,
    speaker: 'string', // Nom du PNJ
    portrait: 'string', // Image du PNJ
    mood: 'string' // humeur du PNJ (friendly, neutral, hostile)
  }
};

/**
 * Structure pour marchands
 */
export const MerchantSceneSchema = {
  ...DialogueSceneSchema,
  metadata: {
    ...DialogueSceneSchema.metadata,
    type: 'merchant',
    shop_type: 'string' // Type de boutique
  },
  shop: {
    currency: 'string', // Type de monnaie
    reputation_discount: {
      threshold: 'number', // Seuil de réputation
      discount: 'number' // Multiplicateur de prix (0.9 = -10%)
    },
    inventory: [
      {
        id: 'string', // ID de l'item
        price: 'number',
        stock: 'number', // -1 pour stock illimité
        condition: 'string', // Condition pour être disponible
        description: 'string' // Description spéciale
      }
    ],
    special_offers: [
      {
        condition: 'string',
        message: 'string',
        reward: {
          type: 'string', // 'item', 'gold', 'discount'
          item: 'string',
          amount: 'number'
        }
      }
    ]
  }
};

/**
 * Structure des variables de jeu
 */
export const GameFlagsSchema = {
  // Flags booléens
  hasSymbol: false,
  tyrionMet: false,
  manuscriptRead: false,
  bridgeSecretFound: false,
  
  // Variables numériques
  reputation: 0,
  gold: 0,
  
  // Listes
  companions: [],
  completedQuests: [],
  visitedLocations: [],
  
  // Relations avec PNJ
  npcRelations: {
    // npcId: reputation_value (-100 à 100)
  },
  
  // Historique des choix importants
  majorChoices: []
};

/**
 * Interface pour les conditions
 */
export const ConditionTypes = {
  // Variables de jeu
  FLAG: 'gameFlags.{flagName}',
  REPUTATION: 'gameFlags.reputation >= {value}',
  NPC_RELATION: 'gameFlags.npcRelations.{npcId} >= {value}',
  
  // Stats de personnage
  LEVEL: 'character.level >= {value}',
  CLASS: 'character.class === "{className}"',
  STAT: 'character.stats.{statName} >= {value}',
  
  // Inventaire
  HAS_ITEM: 'character.inventory.includes("{itemId}")',
  HAS_GOLD: 'character.gold >= {amount}',
  
  // Compagnons
  HAS_COMPANION: 'gameFlags.companions.includes("{companionId}")',
  
  // Combinaisons logiques
  AND: '{condition1} && {condition2}',
  OR: '{condition1} || {condition2}',
  NOT: '!{condition}'
};

/**
 * Helpers de validation
 */
export const SceneValidators = {
  isValidSceneType: (type) => Object.values(SCENE_TYPES).includes(type),
  isValidActionType: (type) => Object.values(ACTION_TYPES).includes(type),
  
  validateScene: (scene) => {
    const errors = [];
    
    if (!scene.metadata?.type) {
      errors.push('Scene must have a type');
    }
    
    if (!scene.content?.text) {
      errors.push('Scene must have text content');
    }
    
    if (!scene.choices || !Array.isArray(scene.choices)) {
      errors.push('Scene must have choices array');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

export default {
  SCENE_TYPES,
  ACTION_TYPES,
  BaseSceneSchema,
  InteractiveSceneSchema,
  DialogueSceneSchema,
  MerchantSceneSchema,
  GameFlagsSchema,
  ConditionTypes,
  SceneValidators
};