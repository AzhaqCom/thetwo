import { calculateDistance, getModifier } from '../utils/calculations'
import { spells } from '../data/spells'
import { CombatEngine } from './combatEngine'
import { SpellService } from './SpellService'
import { getAIProfile, calculateActionPriority } from '../data/aiProfiles'

/**
 * Optimized Entity AI - Intelligent combat decision making
 * Uses enriched data from enemies.js, spells.js and aiProfiles.js
 */
export class EntityAI_Optimized {
  
  /**
   * Main entry point: determines the best action for any entity
   * Now uses tactical data and AI profiles for intelligent decisions
   */
  static getBestAction(entity, gameState) {
    if (!entity || !entity.role) {
      console.warn('Entity has no role, falling back to basic attack')
      return this.fallbackAction(entity, gameState)
    }
    
    const aiProfile = getAIProfile(entity)
    const availableActions = this.getAvailableActions(entity, gameState)
    
    if (availableActions.length === 0) {
      return null
    }
    
    // Score all available actions using AI profile and tactical data
    const scoredActions = availableActions.map(action => ({
      action,
      score: this.calculateActionScore(action, entity, gameState, aiProfile)
    }))
    
    // Sort by score and return best action
    scoredActions.sort((a, b) => b.score - a.score)
    
    const bestAction = scoredActions[0]
    console.log(`🧠 ${entity.name} (${entity.role}) chose ${bestAction.action.name} (score: ${bestAction.score})`)
    
    return bestAction.action
  }

  /**
   * Gets all available actions for an entity
   */
  static getAvailableActions(entity, gameState) {
    const actions = []
    
    // Add available attacks
    if (entity.attacks) {
      entity.attacks.forEach(attack => {
        actions.push({
          ...attack,
          actionType: 'attack',
          entity: entity
        })
      })
    }
    
    // Add available spells
    const availableSpells = this.getAvailableSpells(entity)
    availableSpells.forEach(spell => {
      actions.push({
        ...spell,
        actionType: 'spell',
        entity: entity
      })
    })
    
    // Add movement actions if beneficial
    const movementAction = this.evaluateMovement(entity, gameState)
    if (movementAction) {
      actions.push(movementAction)
    }
    
    return actions
  }

  /**
   * Calculates comprehensive score for an action using AI profiles and tactical data
   */
  static calculateActionScore(action, entity, gameState, aiProfile) {
    let score = 0
    
    // Base score from AI profile
    score += calculateActionPriority(entity, action, gameState)
    
    // Tactical modifiers from action data
    if (action.aiWeight) {
      score += action.aiWeight
    }
    
    // Target-based scoring
    const targets = this.findTargetsForAction(action, entity, gameState)
    if (targets.length > 0) {
      score += this.scoreTargets(targets, action, entity, aiProfile)
    } else {
      score -= 100 // No valid targets = very bad
    }
    
    // Health-based modifiers
    score += this.getHealthModifiers(entity, action)
    
    // Situational bonuses from action data
    score += this.getSituationalBonuses(action, entity, gameState, targets)
    
    // Role-specific bonuses
    score += this.getRoleSpecificBonuses(action, entity, aiProfile)
    
    return Math.max(0, score)
  }

  /**
   * Scores targets based on AI preferences and tactical situation
   */
  static scoreTargets(targets, action, entity, aiProfile) {
    let score = 0
    const target = targets[0] // For now, score based on primary target
    
    // Target type preferences
    if (action.targetPreference) {
      switch (action.targetPreference) {
        case 'weakest':
          score += target.currentHP < target.maxHP * 0.3 ? 50 : 0
          break
        case 'finishing':
          score += target.currentHP <= 10 ? 100 : 0
          break
        case 'strongest':
          score += target.currentHP > target.maxHP * 0.8 ? 30 : 0
          break
      }
    }
    
    // Distance efficiency
    const entityPos = this.getEntityPosition(entity, entity.combatPositions || {})
    const targetPos = this.getEntityPosition(target, entity.combatPositions || {})
    
    if (entityPos && targetPos) {
      const distance = calculateDistance(entityPos, targetPos)
      const actionRange = CombatEngine.getActionRange(action)
      
      if (distance <= actionRange) {
        score += 20 // In range bonus
        
        // Preferred range bonus
        const preferredRange = aiProfile.positioning?.preferredRange || 1
        if (Math.abs(distance - preferredRange) <= 1) {
          score += 30
        }
      } else {
        score -= 50 // Out of range penalty
      }
    }
    
    return score
  }

  /**
   * Gets health-based action modifiers
   */
  static getHealthModifiers(entity, action) {
    const healthPercentage = entity.currentHP / entity.maxHP
    let score = 0
    
    // Low health = prioritize healing/defensive actions
    if (healthPercentage < 0.3) {
      if (action.effects?.some(e => e.type === 'heal')) {
        score += 150
      }
      if (action.type === 'defensive') {
        score += 100
      }
    }
    
    // High health = more aggressive actions
    if (healthPercentage > 0.8) {
      if (action.type === 'offensive' || action.damageType) {
        score += 50
      }
    }
    
    return score
  }

  /**
   * Gets situational bonuses from action data
   */
  static getSituationalBonuses(action, entity, gameState, targets) {
    let score = 0
    
    if (!action.situational) return score
    
    // Multiple enemies bonus
    if (action.situational.multipleEnemies && gameState.combatEnemies?.length > 1) {
      score += action.situational.multipleEnemies
    }
    
    // Low HP target bonus
    if (action.situational.lowHPTarget && targets.length > 0) {
      const target = targets[0]
      if (target.currentHP < target.maxHP * 0.4) {
        score += action.situational.lowHPTarget
      }
    }
    
    // Isolated target bonus
    if (action.situational.isolated && targets.length > 0) {
      // Check if target is away from allies (simplified)
      score += action.situational.isolated
    }
    
    // Guaranteed hit bonus
    if (action.situational.guaranteedHit && !action.requiresAttackRoll) {
      score += action.situational.guaranteedHit
    }
    
    return score
  }

  /**
   * Gets role-specific bonuses
   */
  static getRoleSpecificBonuses(action, entity, aiProfile) {
    let score = 0
    
    // Check if action is recommended for this role
    if (action.aiRoles && action.aiRoles.includes(entity.role)) {
      score += 40
    }
    
    // Combat stage appropriateness
    const healthPercentage = entity.currentHP / entity.maxHP
    if (action.combatStage) {
      switch (action.combatStage) {
        case 'opening':
          score += healthPercentage > 0.8 ? 30 : 0
          break
        case 'finishing':
          score += healthPercentage < 0.4 ? 30 : 0
          break
        case 'any':
          score += 10 // Small bonus for versatile actions
          break
      }
    }
    
    return score
  }

  /**
   * Finds valid targets for an action using CombatEngine
   */
  static findTargetsForAction(action, entity, gameState) {
    const entityPos = this.getEntityPosition(entity, gameState.combatPositions || {})
    if (!entityPos) return []
    
    return CombatEngine.getTargetsInRange(entity, entityPos, action, gameState)
  }

  /**
   * Gets entity position from combat state
   */
  static getEntityPosition(entity, combatPositions) {
    if (!entity || !combatPositions) return null
    
    // Try different position keys
    const possibleKeys = [entity.name, entity.id, entity.name?.toLowerCase()]
    
    for (const key of possibleKeys) {
      if (key && combatPositions[key]) {
        return combatPositions[key]
      }
    }
    
    return null
  }

  /**
   * Evaluates if movement would be beneficial
   */
  static evaluateMovement(entity, gameState) {
    const currentPos = this.getEntityPosition(entity, gameState.combatPositions || {})
    if (!currentPos) return null
    
    const optimalPos = CombatEngine.calculateOptimalMovement(entity, currentPos, gameState)
    
    if (optimalPos && (optimalPos.x !== currentPos.x || optimalPos.y !== currentPos.y)) {
      return {
        name: "Mouvement tactique",
        actionType: 'movement',
        targetPosition: optimalPos,
        aiWeight: 60 // Moderate priority
      }
    }
    
    return null
  }

  /**
   * Gets available spells using SpellService
   */
  static getAvailableSpells(entity) {
    if (!entity.spellcasting || !entity.spellcasting.knownSpells) return []
    
    return entity.spellcasting.knownSpells
      .map(spellName => spells[spellName])
      .filter(spell => spell && SpellService.canCastSpell(entity, spell))
  }

  /**
   * Fallback action for entities without proper AI data
   */
  static fallbackAction(entity, gameState) {
    if (entity.attacks && entity.attacks.length > 0) {
      return {
        ...entity.attacks[0],
        actionType: 'attack'
      }
    }
    return null
  }
}