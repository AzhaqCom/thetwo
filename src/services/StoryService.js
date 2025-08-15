import { SCENE_TYPES, ACTION_TYPES, SceneValidators } from '../types/story';

/**
 * Service gérant toute la logique narrative du jeu
 */
export class StoryService {
  
  /**
   * Évalue une condition string en utilisant l'état du jeu
   */
  static evaluateCondition(condition, gameState) {
    if (!condition) return true;
    if (typeof condition !== 'string') return Boolean(condition);
    
    try {
      // Créer un contexte sécurisé pour l'évaluation
      const context = {
        gameFlags: gameState.flags || {},
        character: gameState.character || {},
        inventory: gameState.character?.inventory || [],
        companions: gameState.flags?.companions || []
      };
      
      // Remplacer les références dans la condition
      let evaluatedCondition = condition;
      
      // Helpers pour les conditions courantes
      const helpers = {
        hasItem: (itemId) => context.inventory.some(item => item.id === itemId),
        hasCompanion: (companionId) => context.companions.includes(companionId),
        hasFlag: (flagName) => Boolean(context.gameFlags[flagName]),
        getRelation: (npcId) => context.gameFlags.npcRelations?.[npcId] || 0
      };
      
      // Évaluation sécurisée
      const func = new Function(
        'gameFlags', 'character', 'inventory', 'companions', 'hasItem', 'hasCompanion', 'hasFlag', 'getRelation',
        `return ${evaluatedCondition}`
      );
      
      return func(
        context.gameFlags,
        context.character, 
        context.inventory,
        context.companions,
        helpers.hasItem,
        helpers.hasCompanion,
        helpers.hasFlag,
        helpers.getRelation
      );
    } catch (error) {
      console.warn(`Erreur d'évaluation de condition: ${condition}`, error);
      return false;
    }
  }

  /**
   * Obtient le texte approprié pour une scène selon l'état du jeu
   */
  static getSceneText(scene, gameState) {
    // Commencer par le texte principal
    let finalText = scene.content?.text || '';
    
    // Ajouter les variations applicables
    if (scene.content?.variations) {
      const applicableVariations = [];
      
      // Vérifier les variations dans l'ordre de priorité
      for (const [variationKey, text] of Object.entries(scene.content.variations)) {
        if (variationKey === 'default') continue;
        
        // Vérifier si la condition de variation est remplie
        const condition = scene.conditions?.show_variation?.[variationKey];
        
        if (condition && this.evaluateCondition(condition, gameState)) {
          applicableVariations.push(text);
        }
      }
      
      // Ajouter les variations au texte principal
      if (applicableVariations.length > 0) {
        finalText += '\n' + applicableVariations.join('\n');
      }
    }
    
    return this.interpolateText(finalText, gameState);
  }

  /**
   * Interpole les variables dans le texte (ex: {playerName}, {character.familyName})
   */
  static interpolateText(text, gameState) {
    if (!text || typeof text !== 'string') return text;
    
    return text.replace(/\{([^}]+)\}/g, (match, variable) => {
      // Gérer les variables avec notation par points (ex: character.familyName)
      if (variable.includes('.')) {
        const parts = variable.split('.');
        let value = gameState;
        
        for (const part of parts) {
          value = value?.[part];
          if (value === undefined) break;
        }
        
        return value !== undefined ? value : match;
      }
      
      // Variables simples (compatibilité avec l'ancien système)
      switch (variable) {
        case 'playerName':
          return gameState.character?.name || 'Aventurier';
        case 'playerClass':
          return gameState.character?.class || 'Aventurier';
        case 'gold':
          return gameState.character?.gold || 0;
        default:
          return gameState.flags?.[variable] || match;
      }
    });
  }

  /**
   * Filtre les choix disponibles selon les conditions
   */
  static getAvailableChoices(scene, gameState) {
    if (!scene.choices) return [];
    
    return scene.choices.filter(choice => {
      if (!choice.condition) return true;
      return this.evaluateCondition(choice.condition, gameState);
    });
  }

  /**
   * Filtre les hotspots disponibles pour les scènes interactives
   */
  static getAvailableHotspots(scene, gameState) {
    if (!scene.hotspots) return [];
    
    return scene.hotspots.filter(hotspot => {
      if (!hotspot.condition) return true;
      return this.evaluateCondition(hotspot.condition, gameState);
    });
  }

  /**
   * Rend une scène interactive avec les hotspots filtrés
   */
  static renderInteractiveScene(scene, gameState) {
    const availableHotspots = this.getAvailableHotspots(scene, gameState);
    
    return {
      ...scene,
      hotspots: availableHotspots,
      content: {
        ...scene.content,
        text: this.getSceneText(scene, gameState)
      }
    };
  }

  /**
   * Traite les actions de boutique pour les marchands
   */
  static processShopAction(action, gameState, merchantScene) {
    const { character, flags } = gameState;
    const shop = merchantScene.shop;
    
    switch (action.type) {
      case 'purchase':
        return this.handlePurchase(action.itemId, character, shop, flags);
      case 'sell':
        return this.handleSell(action.itemId, character, shop);
      default:
        return { success: false, message: 'Action non supportée' };
    }
  }

  /**
   * Gère l'achat d'un objet
   */
  static handlePurchase(itemId, character, shop, flags) {
    const item = shop.inventory.find(i => i.id === itemId);
    if (!item) {
      return { success: false, message: 'Objet non trouvé' };
    }

    if (item.stock !== -1 && item.stock <= 0) {
      return { success: false, message: 'Objet en rupture de stock' };
    }

    // Calculer le prix avec réductions éventuelles
    let finalPrice = item.price;
    if (shop.reputation_discount && flags.reputation >= shop.reputation_discount.threshold) {
      finalPrice = Math.floor(finalPrice * shop.reputation_discount.discount);
    }

    if (character.gold < finalPrice) {
      return { success: false, message: 'Pas assez d\'or' };
    }

    return {
      success: true,
      message: `Vous achetez ${item.name || itemId} pour ${finalPrice} or`,
      effects: {
        gold: -finalPrice,
        items: [itemId],
        shopStock: item.stock !== -1 ? { [itemId]: item.stock - 1 } : null
      }
    };
  }

  /**
   * Gère la vente d'un objet
   */
  static handleSell(itemId, character, shop) {
    const playerItem = character.inventory?.find(item => item.id === itemId);
    if (!playerItem) {
      return { success: false, message: 'Vous ne possédez pas cet objet' };
    }

    // Prix de vente = 50% du prix d'achat par défaut
    const sellPrice = Math.floor((playerItem.value || 0) * 0.5);

    return {
      success: true,
      message: `Vous vendez ${playerItem.name || itemId} pour ${sellPrice} or`,
      effects: {
        gold: sellPrice,
        removeItems: [itemId]
      }
    };
  }

  /**
   * Applique les conséquences d'un choix
   */
  static applyConsequences(consequences, gameState) {
    if (!consequences) return {};

    const effects = {};

    // Flags à modifier
    if (consequences.flags) {
      effects.flags = { ...consequences.flags };
    }

    // Changement de réputation
    if (typeof consequences.reputation === 'number') {
      effects.reputation = consequences.reputation;
    }

    // Items à ajouter
    if (consequences.items && Array.isArray(consequences.items)) {
      effects.items = consequences.items;
    }

    // Compagnons à ajouter
    if (consequences.companions && Array.isArray(consequences.companions)) {
      effects.companions = consequences.companions;
    }

    return effects;
  }

  /**
   * Obtient le speaker et le portrait pour les dialogues
   */
  static getDialogueData(scene, gameState) {
    const speaker = scene.content?.speaker || 'Inconnu';
    const portrait = scene.content?.portrait || null;
    const mood = scene.content?.mood || 'neutral';

    return {
      speaker,
      portrait,
      mood,
      text: this.getSceneText(scene, gameState)
    };
  }

  /**
   * Vérifie si une scène doit être affichée
   */
  static shouldShowScene(scene, gameState) {
    if (!scene.conditions?.show_if) return true;
    return this.evaluateCondition(scene.conditions.show_if, gameState);
  }

  /**
   * Exécute les effets d'entrée d'une scène
   */
  static executeSceneEffects(scene, gameState, effectType = 'on_enter') {
    const effect = scene.effects?.[effectType];
    if (!effect || typeof effect !== 'function') return null;

    try {
      return effect(gameState);
    } catch (error) {
      console.warn(`Erreur lors de l'exécution de l'effet ${effectType}:`, error);
      return null;
    }
  }

  /**
   * Valide une scène avant utilisation
   */
  static validateScene(scene) {
    return SceneValidators.validateScene(scene);
  }

  /**
   * Obtient des informations de debug sur une scène
   */
  static getSceneDebugInfo(scene, gameState) {
    const validation = this.validateScene(scene);
    const availableChoices = this.getAvailableChoices(scene, gameState);
    const shouldShow = this.shouldShowScene(scene, gameState);
    
    return {
      isValid: validation.isValid,
      errors: validation.errors,
      type: scene.metadata?.type || 'unknown',
      shouldShow,
      choicesCount: scene.choices?.length || 0,
      availableChoicesCount: availableChoices.length,
      hasVariations: Boolean(scene.content?.variations),
      hasConditions: Boolean(scene.conditions)
    };
  }

  /**
   * Méthode helper pour obtenir la scène suivante
   */
  static getNextScene(choice, gameState) {
    // Si le choix a une action, on traite d'abord l'action
    if (choice.action) {
      const actionResult = this.processAction(choice.action, gameState);
      if (actionResult?.nextScene) {
        return actionResult.nextScene;
      }
    }

    // Sinon on utilise le 'next' du choix
    if (typeof choice.next === 'string') {
      return choice.next;
    }

    if (typeof choice.next === 'object' && choice.next.nextScene) {
      return choice.next.nextScene;
    }

    return null;
  }

  /**
   * Traite une action générique
   */
  static processAction(action, gameState) {
    switch (action.type) {
      case ACTION_TYPES.SCENE_TRANSITION:
        return { nextScene: action.nextScene };
      
      case ACTION_TYPES.SKILL_CHECK:
        return this.processSkillCheck(action, gameState);
      
      case ACTION_TYPES.SHOP_OPEN:
        return { openShop: true };
      
      default:
        return null;
    }
  }

  /**
   * Traite un skill check
   */
  static processSkillCheck(action, gameState) {
    // Cette logique devrait être intégrée avec le système existant
    // Pour l'instant, on retourne juste les scènes de résultat
    return {
      onSuccess: action.onSuccess,
      onPartialSuccess: action.onPartialSuccess,
      onFailure: action.onFailure
    };
  }
}

export default StoryService;