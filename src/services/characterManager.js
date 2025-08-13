/**
 * Character Manager Service - Pure business logic for character management
 */

import { getModifier, rollDie } from '../utils/calculations'
import { levels } from '../data/levels'

export class CharacterManager {
  /**
   * Calculates proficiency bonus for a character level
   * @param {number} level - Character level
   * @returns {number} Proficiency bonus
   */
  static getProficiencyBonus(level) {
    return Math.ceil(level / 4) + 1
  }

  /**
   * Calculates spell save DC for a character
   * @param {Object} character - The character
   * @returns {number} Spell save DC
   */
  static getSpellSaveDC(character) {
    if (!character.spellcasting) return 8

    const spellcastingAbility = this.getSpellcastingAbility(character)
    const abilityModifier = getModifier(character.stats[spellcastingAbility])
    const proficiencyBonus = this.getProficiencyBonus(character.level)

    return 8 + abilityModifier + proficiencyBonus
  }

  /**
   * Gets the spellcasting ability for a character class
   * @param {Object} character - The character
   * @returns {string} The ability name
   */
  static getSpellcastingAbility(character) {
    if (!character.spellcasting) return 'intelligence'

    return character.spellcasting.ability || (() => {
      switch (character.class) {
        case 'Magicien': return 'intelligence'
        case 'Clerc': return 'sagesse'
        case 'Barde': return 'charisme'
        case 'Rôdeur':
        case 'Paladin': return 'sagesse'
        case 'Sorcier':
        case 'Occultiste': return 'charisme'
        default: return 'intelligence'
      }
    })()
  }

  /**
   * Calculates attack bonus for a character with specific action
   * @param {Object} character - The character
   * @param {Object} action - The action being performed
   * @returns {number} Attack bonus
   */
  static getAttackBonus(character, action) {
    const proficiencyBonus = this.getProficiencyBonus(character.level)

    switch (action.actionType) {
      case 'spell':
        const spellcastingAbility = this.getSpellcastingAbility(character)
        return getModifier(character.stats[spellcastingAbility]) + proficiencyBonus

      case 'weapon':
        let statToUse = action.stat || 'force'

        // Handle finesse weapons
        if (action.properties?.includes('finesse')) {
          const forceBonus = getModifier(character.stats.force)
          const dexBonus = getModifier(character.stats.dexterite)
          statToUse = dexBonus > forceBonus ? 'dexterite' : 'force'
        }

        const isProficient = this.isWeaponProficient(character, action)
        const profBonus = isProficient ? proficiencyBonus : 0

        return getModifier(character.stats[statToUse]) + profBonus

      default:
        return 0
    }
  }

  /**
   * Checks if character is proficient with a weapon
   * @param {Object} character - The character
   * @param {Object} weapon - The weapon
   * @returns {boolean} True if proficient
   */
  static isWeaponProficient(character, weapon) {
    if (!character.weaponProficiencies) return false

    // Check specific weapon proficiency
    if (character.weaponProficiencies.includes(weapon.id)) return true

    // Check category proficiency
    const isSimple = ['dagger', 'club', 'quarterstaff', 'lightCrossbow', 'shortbow'].includes(weapon.id)
    
    if (isSimple && character.weaponProficiencies.includes('simple')) return true
    if (!isSimple && character.weaponProficiencies.includes('martial')) return true

    return false
  }

  /**
   * Processes character level up
   * @param {Object} character - The character to level up
   * @returns {Object} Updated character with level changes
   */
  static levelUp(character) {
    const newLevel = character.level + 1
    const levelData = levels[character.class]?.[newLevel]
    
    if (!levelData) return character

    // Calculate HP gain
    const hitDie = this.getHitDie(character.class)
    const conModifier = getModifier(character.stats.constitution)
    const hpGain = Math.max(1, rollDie(hitDie) + conModifier)

    const updatedCharacter = {
      ...character,
      level: newLevel,
      maxHP: character.maxHP + hpGain,
      currentHP: character.currentHP + hpGain,
      experience: 0, // Reset XP after leveling
      proficiencyBonus: this.getProficiencyBonus(newLevel),
      
      // Update spell slots if spellcaster
      ...(character.spellcasting && {
        spellcasting: {
          ...character.spellcasting,
          slotsTotal: { ...levelData.spellSlots },
          slotsRemaining: { ...levelData.spellSlots }
        }
      })
    }

    // Add new features from level data
    if (levelData.features) {
      updatedCharacter.features = [...(character.features || []), ...levelData.features]
    }

    return updatedCharacter
  }

  /**
   * Gets hit die size for a class
   * @param {string} characterClass - The character class
   * @returns {number} Hit die size
   */
  static getHitDie(characterClass) {
    const hitDice = {
      'Guerrier': 10,
      'Magicien': 6,
      'Roublard': 8,
      'Clerc': 8,
      'Rôdeur': 10,
      'Paladin': 10
    }
    return hitDice[characterClass] || 8
  }

  /**
   * Processes short rest for a character
   * @param {Object} character - The character
   * @param {number} hitDieSpent - Number of hit dice to spend
   * @returns {Object} Updated character after short rest
   */
  static shortRest(character, hitDieSpent = 0) {
    if (hitDieSpent <= 0) return character

    const hitDie = this.getHitDie(character.class)
    const conModifier = getModifier(character.stats.constitution)
    
    let healing = 0
    const availableHitDice = character.hitDice || Math.floor(character.level / 2)
    const actualSpent = Math.min(hitDieSpent, availableHitDice)

    for (let i = 0; i < actualSpent; i++) {
      healing += Math.max(1, rollDie(hitDie) + conModifier)
    }

    return {
      ...character,
      currentHP: Math.min(character.maxHP, character.currentHP + healing),
      hitDice: availableHitDice - actualSpent
    }
  }

  /**
   * Processes long rest for a character
   * @param {Object} character - The character
   * @returns {Object} Updated character after long rest
   */
  static longRest(character) {
    const updatedCharacter = {
      ...character,
      currentHP: character.maxHP,
      hitDice: character.level, // Recover all hit dice
    }

    // Restore spell slots if spellcaster
    if (character.spellcasting) {
      updatedCharacter.spellcasting = {
        ...character.spellcasting,
        slotsRemaining: { ...character.spellcasting.slotsTotal }
      }
    }

    return updatedCharacter
  }

  /**
   * Applies damage to a character
   * @param {Object} character - The character
   * @param {number} damage - Damage amount
   * @returns {Object} Updated character
   */
  static takeDamage(character, damage) {
    return {
      ...character,
      currentHP: Math.max(0, character.currentHP - damage)
    }
  }

  /**
   * Applies healing to a character
   * @param {Object} character - The character  
   * @param {number} healing - Healing amount
   * @returns {Object} Updated character
   */
  static heal(character, healing) {
    return {
      ...character,
      currentHP: Math.min(character.maxHP, character.currentHP + healing)
    }
  }

  /**
   * Consumes a spell slot
   * @param {Object} character - The character
   * @param {number} spellLevel - Level of spell slot to consume
   * @returns {Object} Updated character
   */
  static consumeSpellSlot(character, spellLevel) {
    if (!character.spellcasting || spellLevel <= 0) return character

    const remaining = character.spellcasting.slotsRemaining[spellLevel] || 0
    if (remaining <= 0) return character

    return {
      ...character,
      spellcasting: {
        ...character.spellcasting,
        slotsRemaining: {
          ...character.spellcasting.slotsRemaining,
          [spellLevel]: remaining - 1
        }
      }
    }
  }

  /**
   * Adds experience to a character
   * @param {Object} character - The character
   * @param {number} xp - Experience points to add
   * @returns {Object} Updated character (may include level up)
   */
  static addExperience(character, xp) {
    const currentXP = character.currentXP || character.experience || 0
    const newXP = currentXP + xp
    const xpToNext = this.getXPToNextLevel(character.level)
    
    if (newXP >= xpToNext) {
      return this.levelUp({ ...character, currentXP: newXP })
    }
    
    return { ...character, currentXP: newXP }
  }

  /**
   * Gets XP total required to reach a level
   * @param {number} level - The target level
   * @returns {number} Total XP required to reach that level
   */
  static getXPForLevel(level) {
    const xpTable = [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000]
    return xpTable[level - 1] || 0
  }

  /**
   * Gets XP required for next level
   * @param {number} currentLevel - Current character level
   * @returns {number} XP required for next level
   */
  static getXPToNextLevel(currentLevel) {
    return this.getXPForLevel(currentLevel + 1)
  }
}