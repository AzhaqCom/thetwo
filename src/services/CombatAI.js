/**
 * CombatAI - Système unifié intelligent
 * 
 */

import { EntityAI_Hybrid } from './EntityAI_Hybrid.js';
import { CombatEngine } from './combatEngine.js';
import { SpellServiceUnified } from './SpellServiceUnified.js';

export class CombatAI {
  
  /**
   * POINT D'ENTRÉE PRINCIPAL - Exécute le tour d'une entité
   * @param {Object} entity - L'entité qui joue (ennemi ou compagnon)
   * @param {Object} gameState - État du jeu
   * @param {Function} onMessage - Callback pour les messages
   * @param {Function} onDamage - Callback pour les dégâts 
   * @param {Function} onNextTurn - Callback pour passer au suivant
   */
  static executeEntityTurn(entity, gameState, onMessage, onDamage, onNextTurn) {
    console.log(`🎯 CombatAI UNIFIÉ: Tour de ${entity.name} (${entity.type}) - IA: EntityAI_Hybrid + Sorts: SpellServiceUnified`);

    try {
      // 1. Vérifier que l'entité est vivante
      if (entity.currentHP <= 0) {
        onMessage(`${entity.name} est inconscient et passe son tour.`, 'info');
        setTimeout(() => onNextTurn(), 500);
        return;
      }

      // 2. IA SOPHISTIQUÉE : Utiliser EntityAI_Hybrid pour la décision
      console.log(`🧠 Utilisation de l'IA sophistiquée pour ${entity.name}`);
      const action = EntityAI_Hybrid.getBestAction(entity, gameState);
      
      if (!action) {
        onMessage(`${entity.name} ne trouve rien à faire et passe son tour.`, 'info');
        setTimeout(() => onNextTurn(), 500);
        return;
      }

      console.log(`🎲 Action choisie par l'IA: ${action.type}`, action);

      // 3. EXÉCUTION ROBUSTE : Utiliser notre logique d'exécution testée
      const result = this.executeAction(entity, action, gameState);
      
      // 4. Appliquer les résultats
      this.applyResults(result, onMessage, onDamage);
      
      // 5. Passer au tour suivant (UN SEUL APPEL!)
      setTimeout(() => onNextTurn(), 1000);
      
    } catch (error) {
      console.error(`❌ Erreur dans le tour de ${entity.name}:`, error);
      onMessage(`Erreur dans le tour de ${entity.name}`, 'error');
      setTimeout(() => onNextTurn(), 500);
    }
  }

  /**
   * EXÉCUTEUR D'ACTION UNIFIÉ
   * Prend une action décidée par EntityAI_Hybrid et l'exécute
   */
  static executeAction(entity, action, gameState) {
    console.log(`⚡ CombatAI: Exécution de l'action "${action.type}" pour ${entity.name}`);
    
    switch (action.type) {
      case 'attack':
      case 'melee':
      case 'ranged':
        return this.executeAttack(entity, action, gameState);
        
      case 'spell':
        return this.executeSpell(entity, action, gameState);
        
      case 'protect':
      case 'taunt':
        return this.executeSupportAction(entity, action, gameState);
        
      default:
        console.warn(`Action de type "${action.type}" non reconnue.`);
        return {
          messages: [`Action inconnue: ${action.type}`],
          damage: [],
          healing: []
        };
    }
  }

  /**
   * ATTAQUE - Utilise CombatEngine.resolveAttack (qui existe et fonctionne)
   */
  static executeAttack(entity, action, gameState) {
    const attack = action.attack || action; // EntityAI_Hybrid peut structurer différemment
    const target = action.target;
    
    if (!target) {
      return {
        messages: [`${entity.name} n'a pas de cible valide.`],
        damage: [],
        healing: []
      };
    }

    console.log(`⚔️ ${entity.name} attaque ${target.name} avec ${attack.name}`);

    // Utiliser CombatEngine.resolveAttack qui fonctionne bien
    const attackResult = CombatEngine.resolveAttack(entity, target, attack);
    
    const result = {
      messages: [attackResult.message],
      damage: attackResult.success ? [{
        targetId: target.id || target.name,
        amount: attackResult.damage
      }] : [],
      healing: []
    };

    return result;
  }

  /**
   * SORT - Utilise SpellServiceUnified (système unifié existant et testé)
   */
  static executeSpell(entity, action, gameState) {
    const spell = action.spell;
    const targets = action.targets || [action.target].filter(Boolean);

    if (!spell || targets.length === 0) {
      return {
        messages: [`Le sort ${spell?.name || 'inconnu'} ne peut être lancé sans cible.`],
        damage: [],
        healing: []
      };
    }

    console.log(`🔮 ${entity.name} lance le sort "${spell.name}" sur ${targets.map(t => t.name).join(', ')}`);

    try {
      // UTILISER LE SYSTÈME DE SORTS UNIFIÉ QUI EXISTE ET QUI MARCHE
      const spellService = new SpellServiceUnified({
        combatStore: { combatPositions: gameState.combatPositions }
      });
      
      const spellResult = spellService.castSpell(entity, spell, targets, {
        context: 'combat',
        combatState: gameState
      });

      console.log(`🔍 SpellServiceUnified raw result:`, spellResult);
      console.log(`🔍 healingResults:`, spellResult.healingResults);

      // Mapper le résultat au format attendu
      const result = {
        messages: spellResult.messages || [],
        damage: (spellResult.damageResults || spellResult.damage || []).map(d => ({
          targetId: d.targetId,
          amount: d.damage || d.amount
        })),
        healing: (spellResult.healingResults || spellResult.healing || []).map(h => ({
          targetId: h.targetId,
          amount: h.amount
        }))
      };

      console.log(`🔮 Résultat du sort:`, result);
      return result;

    } catch (error) {
      console.error(`❌ Erreur lors du lancement du sort ${spell.name}:`, error);
      return {
        messages: [`Échec du lancement de ${spell.name}`],
        damage: [],
        healing: []
      };
    }
  }

  /**
   * ACTION DE SUPPORT (protect, taunt, etc.)
   */
  static executeSupportAction(entity, action, gameState) {
    const result = {
      messages: [],
      damage: [],
      healing: []
    };

    switch (action.type) {
      case 'protect':
        if (action.target) {
          result.messages.push(`🛡️ ${entity.name} protège ${action.target.name}`);
          // TODO: Implémenter l'effet de protection si nécessaire
        }
        break;
        
      case 'taunt':
        result.messages.push(`💢 ${entity.name} attire l'attention des ennemis`);
        // TODO: Implémenter l'effet de taunt si nécessaire
        break;
        
      default:
        result.messages.push(`${entity.name} tente une action de support inconnue`);
    }

    return result;
  }

  /**
   * APPLIQUE LES RÉSULTATS - Logique simple et robuste
   */
  static applyResults(result, onMessage, onDamage) {
    // Messages
    if (result.messages) {
      result.messages.forEach(msg => {
        const message = typeof msg === 'string' ? msg : msg.text || msg;
        onMessage(message, 'combat');
      });
    }

    // Dégâts
    if (result.damage) {
      result.damage.forEach(dmg => {
        console.log(`🩸 CombatAI applique ${dmg.amount} dégâts à ${dmg.targetId}`);
        onDamage(dmg.targetId, dmg.amount);
      });
    }

    // Soins (dégâts négatifs)
    if (result.healing) {
      result.healing.forEach(heal => {
        console.log(`💚 CombatAI applique ${heal.amount} soins à ${heal.targetId}`);
        onDamage(heal.targetId, -heal.amount);
      });
    }
  }

  // === MÉTHODES UTILITAIRES (si besoin) ===
  
  static findEntityPosition(entity, gameState) {
    const key = entity.name || entity.id;
    return gameState.combatPositions[key];
  }

  static findTargets(entity, gameState) {
    if (entity.type === 'enemy') {
      // Ennemis ciblent joueur + compagnons
      const targets = [];
      if (gameState.playerCharacter) targets.push(gameState.playerCharacter);
      if (gameState.activeCompanions) targets.push(...gameState.activeCompanions);
      return targets.filter(t => t.currentHP > 0);
    } else {
      // Compagnons ciblent les ennemis
      return (gameState.combatEnemies || []).filter(e => e.currentHP > 0);
    }
  }
}