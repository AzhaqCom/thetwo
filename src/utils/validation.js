/**
 * Validation utilities for game mechanics
 */

import { GRID_WIDTH, GRID_HEIGHT } from './constants'

/**
 * Validates that a position is within grid bounds
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {boolean} True if position is valid
 */
export const isValidGridPosition = (x, y) => {
  return x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT
}

/**
 * Checks if a position is occupied by any character
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {Object} positions - All character positions
 * @param {Array} entities - Array of entities (enemies, companions)
 * @param {string} excludeEntity - Entity name to exclude from check
 * @returns {boolean} True if position is occupied
 */
export const isPositionOccupied = (x, y, positions, entities = [], excludeEntity = null) => {
  // Check fixed positions (player)
  if (positions.player && positions.player.x === x && positions.player.y === y) {
    return true
  }

  // Check all companion positions (nouveau système multi-compagnons)
  for (const posKey in positions) {
    if (posKey !== 'player' && posKey !== excludeEntity && !posKey.endsWith('StartPos')) {
      const pos = positions[posKey]
      if (pos && pos.x === x && pos.y === y) {
        return true
      }
    }
  }

  // Check entities (only living ones block movement)
  for (const entity of entities) {
    if (entity.name !== excludeEntity && entity.currentHP > 0) {
      const entityPos = positions[entity.name]
      if (entityPos && entityPos.x === x && entityPos.y === y) {
        return true
      }
    }
  }

  return false
}

/**
 * Validates if a character can cast a spell
 * @param {Object} character - The character
 * @param {Object} spell - The spell to cast
 * @returns {Object} Validation result with success and message
 */
export const validateSpellcast = (character, spell) => {
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
 * Validates if a target is in range of an action
 * @param {Object} attackerPos - Attacker position
 * @param {Object} targetPos - Target position
 * @param {Object} action - The action being performed
 * @returns {boolean} True if target is in range
 */
export const isTargetInRange = (attackerPos, targetPos, action) => {
  if (!attackerPos || !targetPos) return false
  
  const distance = Math.abs(attackerPos.x - targetPos.x) + Math.abs(attackerPos.y - targetPos.y)
  const maxRange = getActionRange(action)
  
  return distance <= maxRange
}

/**
 * Gets the range of an action in grid squares
 * @param {Object} action - The action
 * @returns {number} Range in grid squares
 */
export const getActionRange = (action) => {
  if (action.actionType === 'spell') {
    if (typeof action.range === 'string') {
      if (action.range.includes('mètres')) {
        const meters = parseInt(action.range)
        return Math.floor(meters / 1.5) // 1.5m = 1 square
      }
      if (action.range === 'Toucher') return 1
      return 12 // Default ranged
    }
    return action.range || 12
  }

  if (action.actionType === 'weapon') {
    if (action.category === 'melee') {
      return action.range?.melee || 1
    } else if (action.category === 'ranged') {
      const rangeStr = action.range?.ranged || '80/320'
      const shortRange = parseInt(rangeStr.split('/')[0])
      return Math.floor(shortRange / 5) // Convert feet to squares
    }
    return 1
  }

  return 1
}