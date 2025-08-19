/**
 * SpellService Unifié - Orchestrateur principal pour tous les types de lanceurs
 * Remplace l'ancien SpellService avec une architecture cohérente
 */

import { SpellEngine } from './SpellEngine.js';
import { SpellCaster } from './SpellCaster.js';
import { spells } from '../data/spells.js';

/**
 * Service unifié pour la gestion des sorts
 * Compatible avec joueur, compagnons, ennemis et PNJ
 */
export class SpellServiceUnified {
  
  constructor(gameStores = {}) {
    this.characterStore = gameStores.characterStore;
    this.combatStore = gameStores.combatStore;
    this.gameStore = gameStores.gameStore;
  }

  /**
   * Lance un sort de manière unifiée pour n'importe quel type de lanceur
   * @param {Object} caster - Le lanceur (joueur/compagnon/ennemi)
   * @param {Object|string} spell - Le sort (objet ou nom)
   * @param {Array} targets - Les cibles
   * @param {Object} options - Options de lancement
   * @returns {Object} Résultat du lancement
   */
  castSpell(caster, spell, targets = [], options = {}) {
    // 1. Préparer le lanceur et le sort
    const spellCaster = new SpellCaster(caster, options.context || 'combat');
    const spellData = this.getSpellData(spell);
    
    if (!spellData) {
      return {
        success: false,
        messages: [`Sort non trouvé: ${typeof spell === 'string' ? spell : spell.name}`],
        effects: []
      };
    }

    // 2. Validation de base
    if (!spellCaster.canCast()) {
      return {
        success: false,
        messages: [`${caster.name} ne peut pas lancer de sorts`],
        effects: []
      };
    }

    // 3. Valider et filtrer les cibles
    const validTargets = this.validateAndFilterTargets(spellData, spellCaster, targets, options);
    
    if (validTargets.length === 0 && spellData.targetType !== 'self') {
      return {
        success: false,
        messages: [`Aucune cible valide pour ${spellData.name}`],
        effects: []
      };
    }

    // 4. Lancer le sort
    const castResult = spellCaster.castSpell(spellData, validTargets, options);
    
    if (!castResult.success) {
      return castResult;
    }

    // 5. Traiter les résultats selon le contexte
    this.processSpellResults(castResult, options.context);

    return castResult;
  }

  /**
   * Obtient les données d'un sort par nom ou objet
   * @param {Object|string} spell - Le sort
   * @returns {Object|null} Données du sort
   */
  getSpellData(spell) {
    if (typeof spell === 'object' && spell.name) {
      return spell; // Déjà un objet sort
    }
    
    if (typeof spell === 'string') {
      // Recherche par nom exact
      if (spells[spell]) {
        return { id: spell, ...spells[spell] };
      }
      
      // Recherche par nom dans les valeurs
      const spellEntry = Object.entries(spells).find(([key, spellData]) => 
        spellData.name === spell || spellData.name?.toLowerCase() === spell.toLowerCase()
      );
      
      if (spellEntry) {
        return { id: spellEntry[0], ...spellEntry[1] };
      }
    }
    
    return null;
  }

  /**
   * Valide et filtre les cibles selon le sort
   * @param {Object} spell - Le sort
   * @param {SpellCaster} caster - Le lanceur
   * @param {Array} targets - Cibles proposées
   * @param {Object} options - Options
   * @returns {Array} Cibles valides
   */
  validateAndFilterTargets(spell, caster, targets, options = {}) {
    const context = {
      positions: options.positions || this.combatStore?.combatPositions,
      combat: options.context === 'combat'
    };

    // Valider la portée et le type de cible
    const validTargets = SpellEngine.validateSpellTargets(
      spell, 
      caster.entity, 
      targets, 
      context
    );
    console.log(`Cibles valides pour ${spell.name}:`, validTargets.map(t => t.name));
    // Résoudre la zone d'effet si applicable
    if (spell.areaOfEffect || spell.isAreaEffect) {
      const origin = options.origin || caster.entity;
      return SpellEngine.resolveAreaOfEffect(spell, origin, validTargets, context);
    }

    return validTargets;
  }

  /**
   * Traite les résultats d'un sort selon le contexte
   * @param {Object} castResult - Résultat du sort
   * @param {string} context - Contexte (combat/exploration/etc.)
   */
  processSpellResults(castResult, context = 'combat') {
    switch (context) {
      case 'combat':
        this.processCombatSpellResults(castResult);
        break;
      
      case 'exploration':
        this.processExplorationSpellResults(castResult);
        break;
      
      case 'social':
        this.processSocialSpellResults(castResult);
        break;
        
      default:
        // Traitement générique
        break;
    }
  }

  /**
   * Traite les résultats de sorts en combat
   * @param {Object} castResult - Résultat du sort
   */
  processCombatSpellResults(castResult) {
    if (!this.combatStore) return;

    // Appliquer les dégâts
    castResult.damageResults.forEach(dmg => {
      if (dmg.targetId === 'player') {
        this.combatStore.dealDamageToPlayer?.(dmg.damage);
      } else if (dmg.targetId) {
        this.combatStore.dealDamageToCompanionById?.(dmg.targetId, dmg.damage);
      }
    });

    // Appliquer les soins
    castResult.healingResults.forEach(heal => {
      if (heal.targetId === 'player') {
        this.combatStore.healPlayer?.(heal.amount);
      } else if (heal.targetId) {
        this.combatStore.healCompanionById?.(heal.targetId, heal.amount);
      }
    });

    // Appliquer les effets
    castResult.effects.forEach(effect => {
      this.combatStore.applyEffect?.(effect);
    });
  }

  /**
   * Traite les résultats de sorts en exploration
   * @param {Object} castResult - Résultat du sort
   */
  processExplorationSpellResults(castResult) {
    if (!this.gameStore) return;

    // Traiter les effets d'exploration (lumière, détection, etc.)
    castResult.effects.forEach(effect => {
      switch (effect.type) {
        case 'light':
          this.gameStore.setEnvironmentFlag?.('lighting', 30);
          break;
        
        case 'detect_magic':
          this.gameStore.setEnvironmentFlag?.('showMagicAuras', true);
          break;
        
        case 'comprehend_languages':
          this.gameStore.setEnvironmentFlag?.('translateText', true);
          break;
      }
    });
  }

  /**
   * Traite les résultats de sorts sociaux
   * @param {Object} castResult - Résultat du sort
   */
  processSocialSpellResults(castResult) {
    // TODO: Implémenter effets sociaux (charme, suggestion, etc.)
  }

  /**
   * Vérifie si un lanceur peut lancer un sort spécifique
   * @param {Object} caster - Le lanceur
   * @param {Object|string} spell - Le sort
   * @param {number} atLevel - Niveau de lancement optionnel
   * @returns {boolean} Vrai si peut lancer
   */
  canCastSpell(caster, spell, atLevel = null) {
    const spellCaster = new SpellCaster(caster);
    const spellData = this.getSpellData(spell);
    
    if (!spellData) return false;
    
    return spellCaster.canCastSpell(spellData, atLevel);
  }

  /**
   * Obtient tous les sorts disponibles pour un lanceur
   * @param {Object} caster - Le lanceur
   * @returns {Array} Liste des sorts disponibles
   */
  getAvailableSpells(caster) {
    const spellCaster = new SpellCaster(caster);
    return spellCaster.getAvailableSpells();
  }

  /**
   * Obtient les emplacements de sorts disponibles
   * @param {Object} caster - Le lanceur
   * @returns {Object} Emplacements disponibles
   */
  getAvailableSpellSlots(caster) {
    const spellCaster = new SpellCaster(caster);
    return spellCaster.getAvailableSpellSlots();
  }

  /**
   * Calcule les statistiques de sort pour un lanceur
   * @param {Object} caster - Le lanceur
   * @returns {Object} Statistiques (DC, bonus attaque, etc.)
   */
  getSpellcastingStats(caster) {
    const spellCaster = new SpellCaster(caster);
    
    if (!spellCaster.canCast()) {
      return null;
    }

    return {
      ability: spellCaster.getSpellcastingAbility(),
      modifier: spellCaster.getSpellcastingModifier(),
      attackBonus: spellCaster.getSpellAttackBonus(),
      saveDC: spellCaster.getSpellSaveDC(),
      proficiencyBonus: spellCaster.getProficiencyBonus()
    };
  }

  /**
   * MÉTHODES DE COMPATIBILITÉ AVEC L'ANCIEN SYSTÈME
   * À supprimer une fois la migration terminée
   */

  /**
   * @deprecated Utiliser castSpell à la place
   */
  static castSpell(character, spell, targets = [], options = {}) {
    console.warn('SpellService.castSpell est déprécié, utiliser SpellServiceUnified');
    const service = new SpellServiceUnified();
    return service.castSpell(character, spell, targets, options);
  }

  /**
   * @deprecated Utiliser canCastSpell à la place
   */
  static validateSpellcast(character, spell) {
    console.warn('SpellService.validateSpellcast est déprécié');
    const service = new SpellServiceUnified();
    const canCast = service.canCastSpell(character, spell);
    return {
      success: canCast,
      message: canCast ? '' : 'Ne peut pas lancer ce sort'
    };
  }
}