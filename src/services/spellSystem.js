/**
 * Spell System Service - Pure business logic for spell mechanics
 */

import { rollDice } from '../utils/calculations'
import { CharacterManager } from './characterManager'

export class SpellSystem {
  /**
   * Processes spell casting for a character
   * @param {Object} character - The character casting the spell
   * @param {Object} spell - The spell being cast
   * @param {Array} targets - Target entities
   * @param {Object} options - Additional casting options
   * @returns {Object} Spell casting result
   */
  static castSpell(character, spell, targets = [], options = {}) {
    const result = {
      success: false,
      character: character,
      messages: [],
      effects: []
    }

    // Validate spell casting
    const validation = this.validateSpellcast(character, spell)
    if (!validation.success) {
      result.messages.push(validation.message)
      return result
    }

    // Consume spell slot (cantrips don't consume slots)
    if (spell.level > 0) {
      result.character = CharacterManager.consumeSpellSlot(character, spell.level)
    }

    // Process spell effects
    const spellEffects = this.processSpellEffects(spell, targets, character, options)
    result.effects = spellEffects.effects
    result.messages = [...result.messages, ...spellEffects.messages]
    result.success = true

    return result
  }

  /**
   * Validates if a character can cast a spell
   * @param {Object} character - The character
   * @param {Object} spell - The spell
   * @returns {Object} Validation result
   */
  static validateSpellcast(character, spell) {
    if (!character.spellcasting) {
      return { success: false, message: "Ce personnage ne peut pas lancer de sorts" }
    }

    // Check if spell is known/prepared
    const knownSpells = [
      ...(character.spellcasting.cantrips || []),
      ...(character.spellcasting.preparedSpells || [])
    ]

    if (!knownSpells.includes(spell.id)) {
      return { success: false, message: "Sort non préparé" }
    }

    // Check spell slot availability (cantrips don't require slots)
    if (spell.level > 0) {
      const availableSlots = character.spellcasting.slotsRemaining[spell.level] || 0
      if (availableSlots <= 0) {
        return { success: false, message: "Aucun emplacement de sort disponible" }
      }
    }

    return { success: true }
  }

  /**
   * Processes the effects of a spell
   * @param {Object} spell - The spell
   * @param {Array} targets - Target entities
   * @param {Object} caster - The spell caster
   * @param {Object} options - Casting options
   * @returns {Object} Effects and messages
   */
  static processSpellEffects(spell, targets, caster, options = {}) {
    const result = {
      effects: [],
      messages: []
    }

    // Handle damage spells
    if (spell.damage) {
      const damageEffect = this.processDamageSpell(spell, targets, caster, options)
      result.effects.push(...damageEffect.effects)
      result.messages.push(...damageEffect.messages)
    }

    // Handle healing spells
    if (spell.healing) {
      const healingEffect = this.processHealingSpell(spell, targets, caster, options)
      result.effects.push(...healingEffect.effects)
      result.messages.push(...healingEffect.messages)
    }

    // Handle utility spells
    if (spell.effects) {
      const utilityEffect = this.processUtilitySpell(spell, targets, caster, options)
      result.effects.push(...utilityEffect.effects)
      result.messages.push(...utilityEffect.messages)
    }

    return result
  }

  /**
   * Processes damage-dealing spells
   * @param {Object} spell - The spell
   * @param {Array} targets - Target entities
   * @param {Object} caster - The caster
   * @param {Object} options - Options
   * @returns {Object} Damage effects and messages
   */
  static processDamageSpell(spell, targets, caster, options) {
    const result = { effects: [], messages: [] }

    targets.forEach(target => {
      let damage = rollDice(spell.damage.dice) + (spell.damage.bonus || 0)
      
      // Apply spell level scaling
      if (options.spellLevel && options.spellLevel > spell.level) {
        const extraLevels = options.spellLevel - spell.level
        if (spell.damage.scaling) {
          const extraDamage = rollDice(spell.damage.scaling) * extraLevels
          damage += extraDamage
        }
      }

      result.effects.push({
        type: 'damage',
        target: target,
        amount: damage,
        damageType: spell.damage.type
      })

      result.messages.push(
        `${target.name} subit ${damage} dégâts ${spell.damage.type} de ${spell.name}`
      )
    })

    return result
  }

  /**
   * Processes healing spells
   * @param {Object} spell - The spell
   * @param {Array} targets - Target entities
   * @param {Object} caster - The caster
   * @param {Object} options - Options
   * @returns {Object} Healing effects and messages
   */
  static processHealingSpell(spell, targets, caster, options) {
    const result = { effects: [], messages: [] }

    targets.forEach(target => {
      let healing = rollDice(spell.healing.dice) + (spell.healing.bonus || 0)
      
      // Apply spell level scaling
      if (options.spellLevel && options.spellLevel > spell.level) {
        const extraLevels = options.spellLevel - spell.level
        if (spell.healing.scaling) {
          const extraHealing = rollDice(spell.healing.scaling) * extraLevels
          healing += extraHealing
        }
      }

      result.effects.push({
        type: 'healing',
        target: target,
        amount: healing
      })

      result.messages.push(
        `${target.name} récupère ${healing} points de vie grâce à ${spell.name}`
      )
    })

    return result
  }

  /**
   * Processes utility/buff spells
   * @param {Object} spell - The spell
   * @param {Array} targets - Target entities
   * @param {Object} caster - The caster
   * @param {Object} options - Options
   * @returns {Object} Utility effects and messages
   */
  static processUtilitySpell(spell, targets, caster, options) {
    const result = { effects: [], messages: [] }

    spell.effects.forEach(effect => {
      switch (effect.type) {
        case 'ac_bonus':
          targets.forEach(target => {
            result.effects.push({
              type: 'ac_modifier',
              target: target,
              modifier: effect.value,
              duration: spell.duration
            })
            result.messages.push(
              `${target.name} gagne +${effect.value} CA grâce à ${spell.name}`
            )
          })
          break

        case 'advantage':
          targets.forEach(target => {
            result.effects.push({
              type: 'advantage',
              target: target,
              category: effect.category,
              duration: spell.duration
            })
            result.messages.push(
              `${target.name} a l'avantage sur ${effect.category} grâce à ${spell.name}`
            )
          })
          break

        case 'condition':
          targets.forEach(target => {
            result.effects.push({
              type: 'condition',
              target: target,
              condition: effect.condition,
              duration: spell.duration
            })
            result.messages.push(
              `${target.name} est affecté par ${effect.condition} (${spell.name})`
            )
          })
          break

        default:
          console.warn(`Unknown spell effect type: ${effect.type}`)
      }
    })

    return result
  }

  /**
   * Gets available spell slots for a character
   * @param {Object} character - The character
   * @returns {Object} Available spell slots by level
   */
  static getAvailableSpellSlots(character) {
    if (!character.spellcasting) return {}
    
    return character.spellcasting.slotsRemaining || {}
  }

  /**
   * Gets prepared spells for a character
   * @param {Object} character - The character
   * @returns {Array} Array of prepared spell names
   */
  static getPreparedSpells(character) {
    if (!character.spellcasting) return []
    
    return [
      ...(character.spellcasting.cantrips || []),
      ...(character.spellcasting.preparedSpells || [])
    ]
  }

  /**
   * Calculates maximum prepared spells for a character
   * @param {Object} character - The character
   * @returns {number} Maximum number of spells that can be prepared
   */
  static getMaxPreparedSpells(character) {
    if (!character.spellcasting) return 0

    const spellcastingAbility = CharacterManager.getSpellcastingAbility(character)
    const abilityModifier = Math.max(1, getModifier(character.stats[spellcastingAbility]))
    
    return character.level + abilityModifier
  }

  /**
   * Prepares a spell for a character
   * @param {Object} character - The character
   * @param {string} spellName - Name of spell to prepare
   * @returns {Object} Updated character or null if can't prepare
   */
  static prepareSpell(character, spellName) {
    if (!character.spellcasting) return null

    const currentPrepared = character.spellcasting.preparedSpells || []
    const maxPrepared = this.getMaxPreparedSpells(character)

    // Check if already prepared
    if (currentPrepared.includes(spellName)) return character

    // Check if at capacity
    if (currentPrepared.length >= maxPrepared) return null

    return {
      ...character,
      spellcasting: {
        ...character.spellcasting,
        preparedSpells: [...currentPrepared, spellName]
      }
    }
  }

  /**
   * Unprepares a spell for a character
   * @param {Object} character - The character
   * @param {string} spellName - Name of spell to unprepare
   * @returns {Object} Updated character
   */
  static unprepareSpell(character, spellName) {
    if (!character.spellcasting) return character

    const currentPrepared = character.spellcasting.preparedSpells || []
    
    return {
      ...character,
      spellcasting: {
        ...character.spellcasting,
        preparedSpells: currentPrepared.filter(spell => spell !== spellName)
      }
    }
  }
}