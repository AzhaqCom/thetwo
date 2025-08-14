/**
 * Combat Engine Service - Pure business logic for combat mechanics
 */

import { rollDice, rollD20WithModifier, calculateDistance } from '../utils/calculations'
import { isValidGridPosition, isPositionOccupied, isTargetInRange } from '../utils/validation'
import { GRID_WIDTH, GRID_HEIGHT, ENTITY_TYPES } from '../utils/constants'

export class CombatEngine {
  /**
   * Calculates damage from an attack
   * @param {Object} attack - Attack object with damage dice and bonuses
   * @returns {Object} Object containing damage amount and message
   */
  static calculateDamage(attack) {
    let totalDamage = rollDice(attack.damageDice) + (attack.damageBonus || 0)
    let message = `${totalDamage} dégâts ${attack.damageType}`

    if (attack.secondaryDamageDice) {
      const secondaryDamage = rollDice(attack.secondaryDamageDice) + (attack.secondaryDamageBonus || 0)
      totalDamage += secondaryDamage
      message += ` + ${secondaryDamage} dégâts ${attack.secondaryDamageType} (${totalDamage}dmg)`
    }

    return { damage: totalDamage, message }
  }

  /**
   * Gets valid targets within range for an attack
   * @param {Object} attacker - The attacking entity
   * @param {Object} attackerPos - Attacker's position
   * @param {Object} action - Action being performed
   * @param {Object} combatState - Current combat state
   * @returns {Array} Array of valid targets
   */
  static getTargetsInRange(attacker, attackerPos, action, combatState) {
    const { playerCharacter, companionCharacter, combatEnemies, combatPositions } = combatState
    const targets = []

    if (!attackerPos) return targets

    const maxRange = isTargetInRange.getActionRange ? isTargetInRange.getActionRange(action) : (action.range || 1)

    // Check player as target (if attacker is enemy)
    if (attacker.type === ENTITY_TYPES.ENEMY && playerCharacter?.currentHP > 0 && combatPositions.player) {
      const distance = calculateDistance(attackerPos, combatPositions.player)
      if (distance <= maxRange) {
        targets.push({
          ...playerCharacter,
          type: ENTITY_TYPES.PLAYER,
          position: combatPositions.player
        })
      }
    }

    // Check companion as target (if attacker is enemy)  
    if (attacker.type === ENTITY_TYPES.ENEMY && companionCharacter?.currentHP > 0 && combatPositions.companion) {
      const distance = calculateDistance(attackerPos, combatPositions.companion)
      if (distance <= maxRange) {
        targets.push({
          ...companionCharacter,
          type: ENTITY_TYPES.COMPANION,
          position: combatPositions.companion
        })
      }
    }

    // Check enemies as targets (if attacker is player/companion)
    if ([ENTITY_TYPES.PLAYER, ENTITY_TYPES.COMPANION].includes(attacker.type)) {
      combatEnemies.forEach(enemy => {
        if (enemy.currentHP > 0) {
          const enemyPos = combatPositions[enemy.name]
          if (enemyPos) {
            const distance = calculateDistance(attackerPos, enemyPos)
            if (distance <= maxRange) {
              targets.push({
                ...enemy,
                type: ENTITY_TYPES.ENEMY,
                position: enemyPos
              })
            }
          }
        }
      })
    }

    return targets
  }

  /**
   * Calculates the best movement position for an entity
   * @param {Object} entity - The entity to move
   * @param {Object} currentPos - Current position
   * @param {Object} combatState - Combat state
   * @returns {Object|null} New position or null if no movement needed
   */
  static calculateOptimalMovement(entity, currentPos, combatState) {
    if (!currentPos || entity.currentHP <= 0) return null

    const targets = this.findPotentialTargets(entity, combatState)
    if (targets.length === 0) return null

    // Find closest target
    const closestTarget = targets.reduce((closest, target) => {
      const distance = calculateDistance(currentPos, target.position)
      return !closest || distance < closest.distance 
        ? { target, distance }
        : closest
    }, null)

    if (!closestTarget) return null

    const idealDistance = this.getIdealDistance(entity)

    // If already at ideal distance or closer, don't move
    if (closestTarget.distance <= idealDistance) return null

    // Find best position within movement range
    const maxMovement = entity.movement || 6
    let bestPosition = null
    let bestScore = -1

    for (let dx = -maxMovement; dx <= maxMovement; dx++) {
      for (let dy = -maxMovement; dy <= maxMovement; dy++) {
        const manhattanDistance = Math.abs(dx) + Math.abs(dy)
        if (manhattanDistance === 0 || manhattanDistance > maxMovement) continue

        const newPos = { x: currentPos.x + dx, y: currentPos.y + dy }

        if (!isValidGridPosition(newPos.x, newPos.y)) continue
        if (isPositionOccupied(newPos.x, newPos.y, combatState.combatPositions, combatState.combatEnemies, entity.name)) continue

        const distanceToTarget = calculateDistance(newPos, closestTarget.target.position)
        const distanceFromIdeal = Math.abs(distanceToTarget - idealDistance)
        const score = 100 - distanceFromIdeal - manhattanDistance * 0.1

        if (score > bestScore) {
          bestScore = score
          bestPosition = newPos
        }
      }
    }

    return bestPosition
  }

  /**
   * Finds potential targets for an entity
   * @param {Object} entity - The entity
   * @param {Object} combatState - Combat state
   * @returns {Array} Array of potential targets with positions
   */
  static findPotentialTargets(entity, combatState) {
    const { playerCharacter, companionCharacter, combatEnemies, combatPositions, activeCompanions = [] } = combatState
    const targets = []

    if (entity.type === ENTITY_TYPES.ENEMY) {
      // Enemies target player and companions
      if (playerCharacter?.currentHP > 0 && combatPositions.player) {
        targets.push({ entity: playerCharacter, position: combatPositions.player })
      }
      
      // Ajouter tous les compagnons actifs (nouveau système)
      if (activeCompanions && activeCompanions.length > 0) {
        activeCompanions.forEach(companion => {
          if (companion && companion.currentHP > 0) {
            const companionId = companion.id || companion.name.toLowerCase()
            const companionPos = combatPositions[companionId]
            if (companionPos) {
              targets.push({ entity: companion, position: companionPos })
            }
          }
        })
      }
      
      // Compatibilité avec l'ancien système
      if (companionCharacter?.currentHP > 0 && combatPositions.companion) {
        targets.push({ entity: companionCharacter, position: combatPositions.companion })
      }
    } else {
      // Player/Companion target enemies
      combatEnemies.forEach(enemy => {
        if (enemy.currentHP > 0 && combatPositions[enemy.name]) {
          targets.push({ entity: enemy, position: combatPositions[enemy.name] })
        }
      })
    }

    return targets
  }

  /**
   * Determines ideal attack distance for an entity
   * @param {Object} entity - The entity
   * @returns {number} Ideal distance in grid squares
   */
  static getIdealDistance(entity) {
    if (!entity.attacks) return 1

    const hasRangedAttack = entity.attacks.some(attack => 
      attack.type === 'ranged' || (attack.range && attack.range > 1)
    )
    const hasMeleeAttack = entity.attacks.some(attack =>
      attack.type === 'melee' || !attack.range || attack.range <= 1
    )

    if (hasMeleeAttack && !hasRangedAttack) {
      return 1 // Get adjacent for melee
    } else if (hasRangedAttack && !hasMeleeAttack) {
      const rangedAttack = entity.attacks.find(attack => attack.type === 'ranged')
      return Math.min(4, rangedAttack?.range || 4) // Stay at range
    } else {
      return 1 // Mixed, prefer melee range
    }
  }

  /**
   * Calculates Area of Effect squares
   * @param {Object} center - Center position {x, y}
   * @param {Object} aoeType - AoE configuration
   * @returns {Array} Array of affected positions
   */
  static calculateAoESquares(center, aoeType) {
    const squares = []
    
    if (!center || !aoeType) return squares

    switch (aoeType.shape) {
      case 'sphere':
      case 'circle':
        const radius = aoeType.size || 1
        for (let x = center.x - radius; x <= center.x + radius; x++) {
          for (let y = center.y - radius; y <= center.y + radius; y++) {
            if (isValidGridPosition(x, y)) {
              const distance = calculateDistance(center, { x, y })
              if (distance <= radius) {
                squares.push({ x, y })
              }
            }
          }
        }
        break

      case 'cone':
        // Simplified cone - triangle shape
        const coneSize = aoeType.size || 2
        for (let i = 1; i <= coneSize; i++) {
          for (let offset = -i; offset <= i; offset++) {
            const x = center.x + i
            const y = center.y + offset
            if (isValidGridPosition(x, y)) {
              squares.push({ x, y })
            }
          }
        }
        break

      case 'line':
        const lineLength = aoeType.size || 3
        for (let i = 1; i <= lineLength; i++) {
          const x = center.x + i
          const y = center.y
          if (isValidGridPosition(x, y)) {
            squares.push({ x, y })
          }
        }
        break

      default:
        squares.push(center)
    }

    return squares
  }

  /**
   * Finds the best target for an entity based on distance and priorities
   * @param {Object} attacker - The attacking entity
   * @param {Object} attackerPos - Attacker's current position
   * @param {Object} combatState - Current combat state
   * @returns {Object|null} Best target or null
   */
  static findBestTarget(attacker, attackerPos, combatState) {
    const { playerCharacter, companionCharacter, combatPositions, activeCompanions = [] } = combatState
    
    if (!attackerPos) {
      console.warn(`⚠️ Pas de position pour ${attacker.name}`)
      return null
    }

    const potentialTargets = []

    // Pour les ennemis : cibler joueur et compagnon
    if (attacker.type === ENTITY_TYPES.ENEMY) {
      // Ajouter le joueur si vivant
      if (playerCharacter && playerCharacter.currentHP > 0 && combatPositions.player) {
        potentialTargets.push({
          type: ENTITY_TYPES.PLAYER,
          name: playerCharacter.name,
          character: playerCharacter,
          position: combatPositions.player
        })
      }

      // Ajouter tous les compagnons actifs (nouveau système multi-compagnons)
      if (activeCompanions && activeCompanions.length > 0) {
        activeCompanions.forEach(companion => {
          if (companion && companion.currentHP > 0) {
            const companionId = companion.id || companion.name.toLowerCase()
            const companionPos = combatPositions[companionId]
            if (companionPos) {
              potentialTargets.push({
                type: ENTITY_TYPES.COMPANION,
                name: companion.name,
                character: companion,
                position: companionPos
              })
            }
          }
        })
      }
      
      // Compatibilité avec l'ancien système
      if (companionCharacter && companionCharacter.currentHP > 0 && combatPositions.companion) {
        potentialTargets.push({
          type: ENTITY_TYPES.COMPANION,
          name: companionCharacter.name,
          character: companionCharacter,
          position: combatPositions.companion
        })
      }
    }
    
    // Pour le compagnon : cibler les ennemis
    else if (attacker.type === ENTITY_TYPES.COMPANION || attacker.type === 'companion') {
      // Ajouter tous les ennemis vivants
      if (combatState.combatEnemies) {
        combatState.combatEnemies.forEach(enemy => {
          if (enemy.currentHP > 0 && combatPositions[enemy.name]) {
            potentialTargets.push({
              type: ENTITY_TYPES.ENEMY,
              name: enemy.name,
              character: enemy,
              position: combatPositions[enemy.name]
            })
          }
        })
      }
    }

    if (potentialTargets.length === 0) {
      console.log(`🎯 ${attacker.name}: Aucune cible vivante trouvée`)
      return null
    }

    // Trouver la cible la plus proche (priorité stricte à la distance)
    let bestTarget = null
    let shortestDistance = Infinity

    console.log(`🎯 ${attacker.name} à (${attackerPos.x}, ${attackerPos.y}) évalue les cibles:`)
    console.log(`   📍 Positions disponibles:`, Object.keys(combatPositions).map(key => `${key}: (${combatPositions[key]?.x}, ${combatPositions[key]?.y})`).join(', '))
    
    potentialTargets.forEach(target => {
      const distance = calculateDistance(attackerPos, target.position)
      console.log(`   - ${target.name} (${target.type}) à (${target.position.x}, ${target.position.y}) - distance: ${distance}`)
      
      // Prioriser strictement la distance
      if (distance < shortestDistance) {
        shortestDistance = distance
        bestTarget = target
        console.log(`     ✅ Nouvelle cible la plus proche: ${target.name} à distance ${distance}`)
      } else if (distance === shortestDistance && target.type === ENTITY_TYPES.PLAYER) {
        // En cas d'égalité exacte, préférer le joueur
        bestTarget = target
        console.log(`     ↔️ Même distance ${distance}, priorité au joueur: ${target.name}`)
      }
    })

    if (bestTarget) {
      bestTarget.distance = shortestDistance
      console.log(`🏹 ${attacker.name} choisit: ${bestTarget.name} (${bestTarget.type}) à distance ${shortestDistance}`)
    }

    return bestTarget
  }

  /**
   * Validates movement to ensure position is valid and not occupied
   * @param {Object} entity - The entity trying to move
   * @param {Object} currentPos - Current position
   * @param {Object} targetPos - Target position
   * @param {Object} combatState - Combat state
   * @returns {boolean} Whether movement is valid
   */
  static validateMovement(entity, currentPos, targetPos, combatState) {
    // Vérifier que la position cible est dans la grille
    if (!isValidGridPosition(targetPos.x, targetPos.y)) {
      console.warn(`❌ Position invalide pour ${entity.name}: (${targetPos.x}, ${targetPos.y})`)
      return false
    }

    // Vérifier que la position n'est pas occupée
    const { combatPositions, combatEnemies } = combatState
    const isOccupied = isPositionOccupied(
      targetPos.x, 
      targetPos.y, 
      combatPositions, 
      combatEnemies,
      entity.name // Exclure l'entité elle-même
    )

    if (isOccupied) {
      console.warn(`❌ Position occupée pour ${entity.name}: (${targetPos.x}, ${targetPos.y})`)
      return false
    }

    // Vérifier la portée de mouvement
    const distance = calculateDistance(currentPos, targetPos)
    const maxMovement = entity.movement || 6
    
    if (distance > maxMovement) {
      console.warn(`❌ Mouvement trop loin pour ${entity.name}: ${distance} > ${maxMovement}`)
      return false
    }

    return true
  }
}