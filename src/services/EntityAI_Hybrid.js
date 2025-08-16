import { calculateDistance, getModifier } from '../utils/calculations'
import { spells } from '../data/spells'
import { CombatEngine } from './combatEngine'
import { SpellService } from './SpellService'

/**
 * Hybrid Entity AI - Combines existing aiPriority system with intelligent scoring
 * Preserves the flexible aiPriority approach while adding contextual intelligence
 */
export class EntityAI_Hybrid {
  
  /**
   * Main entry point: uses aiPriority as base + intelligent scoring for refinement
   */
  static getBestAction(entity, gameState) {
    if (!entity || !entity.role) {
      console.warn('Entity has no role, using fallback AI')
      return this.fallbackAction(entity, gameState)
    }
    
    // 1. Get actions based on aiPriority (existing flexible system)
    const priorityActions = this.getActionsByPriority(entity, gameState)
    
    if (priorityActions.length === 0) {
      return this.fallbackAction(entity, gameState)
    }
    
    // 2. Add intelligent scoring to refine decisions
    const scoredActions = priorityActions.map(action => ({
      action,
      score: this.calculateHybridScore(action, entity, gameState)
    }))
    
    // 3. Sort by total score and return best
    scoredActions.sort((a, b) => b.score - a.score)
    
    const bestAction = scoredActions[0]
    console.log(`🧠 ${entity.name} (${entity.role}) chose ${bestAction.action.description || bestAction.action.name} (score: ${bestAction.score})`)
    
    return bestAction.action
  }

  /**
   * Gets available actions respecting aiPriority order (preserves existing system)
   */
  static getActionsByPriority(entity, gameState) {
    const actions = []
    
    if (!entity.aiPriority) {
      console.warn(`Entity ${entity.name} has no aiPriority, using fallback`)
      return this.getFallbackActions(entity, gameState)
    }
    
    // Process each priority in order (existing system logic)
    entity.aiPriority.forEach((priorityType, index) => {
      const basePriority = 100 - (index * 15) // Respect priority order
      
      const priorityActions = this.getActionsForPriorityType(priorityType, entity, gameState)
      priorityActions.forEach(action => {
        action.priorityScore = basePriority
        action.priorityType = priorityType
        action.priorityIndex = index
        actions.push(action)
      })
    })
    
    return actions
  }

  /**
   * Gets specific actions for a priority type (enhanced from original system)
   */
  static getActionsForPriorityType(priorityType, entity, gameState) {
    const actions = []
    const entityPos = gameState.combatPositions?.[entity.id || entity.name]
    
    if (!entityPos) {
      return actions
    }

    switch (priorityType) {
      case 'protect':
        const fragileAlly = this.findMostWoundedAlly(entity, gameState)
        if (fragileAlly) {
          actions.push({
            type: 'protect',
            target: fragileAlly,
            name: 'Protection',
            description: `Protéger ${fragileAlly.name}`,
            actionType: 'ability'
          })
        }
        break
        
      case 'heal':
        const woundedAllies = this.findWoundedAllies(entity, gameState)
        woundedAllies.forEach(ally => {
          const healingSpells = this.getHealingSpells(entity)
          healingSpells.forEach(spell => {
            actions.push({
              ...spell,
              target: ally,
              actionType: 'spell',
              description: `${spell.name} sur ${ally.name}`
            })
          })
        })
        break
        
      case 'taunt':
        const targets = this.findTargets(entity, gameState)
        if (targets.length > 0) {
          actions.push({
            type: 'taunt',
            targets: targets,
            name: 'Provocation',
            description: 'Attirer l\'attention',
            actionType: 'ability'
          })
        }
        break
        
      case 'melee_attack':
        const meleeAttacks = this.getMeleeAttacks(entity)
        const meleeTargets = this.findTargetsInMeleeRange(entity, gameState)
        meleeAttacks.forEach(attack => {
          meleeTargets.forEach(target => {
            actions.push({
              ...attack,
              target: target,
              actionType: 'attack',
              description: `${attack.name} sur ${target.name}`
            })
          })
        })
        break
        
      case 'ranged_attack':
        const rangedAttacks = this.getRangedAttacks(entity)
        const rangedTargets = this.findTargetsInRange(entity, gameState)
        rangedAttacks.forEach(attack => {
          rangedTargets.forEach(target => {
            actions.push({
              ...attack,
              target: target,
              actionType: 'attack',
              description: `${attack.name} sur ${target.name}`
            })
          })
        })
        break
        
      case 'hit_and_run':
        // Combine movement + attack
        const runTargets = this.findIsolatedTargets(entity, gameState)
        const quickAttacks = this.getQuickAttacks(entity)
        quickAttacks.forEach(attack => {
          runTargets.forEach(target => {
            actions.push({
              ...attack,
              target: target,
              actionType: 'hit_and_run',
              description: `Harcèlement: ${attack.name} sur ${target.name}`,
              requiresMovement: true
            })
          })
        })
        break
        
      case 'buff':
        const buffSpells = this.getBuffSpells(entity)
        const buffTargets = this.getAllies(entity, gameState)
        buffSpells.forEach(spell => {
          buffTargets.forEach(target => {
            actions.push({
              ...spell,
              target: target,
              actionType: 'spell',
              description: `${spell.name} sur ${target.name}`
            })
          })
        })
        break
        
      case 'ranged_support':
        const supportSpells = this.getSupportSpells(entity)
        const supportTargets = this.findTargets(entity, gameState)
        supportSpells.forEach(spell => {
          supportTargets.forEach(target => {
            actions.push({
              ...spell,
              target: target,
              actionType: 'spell',
              description: `${spell.name} sur ${target.name}`
            })
          })
        })
        break
    }
    
    return actions
  }

  /**
   * Calculates hybrid score: aiPriority base + intelligent modifiers
   */
  static calculateHybridScore(action, entity, gameState) {
    let score = action.priorityScore || 50 // Base from aiPriority
    
    // Add intelligent modifiers from entity data
    if (entity.aiModifiers && action.priorityType) {
      const modifiers = entity.aiModifiers[action.priorityType]
      if (modifiers) {
        score += this.applyAIModifiers(modifiers, action, entity, gameState)
      }
    }
    
    // Add action-specific bonuses from attack/spell data
    if (action.aiWeight) {
      score += action.aiWeight
    }
    
    // Situational bonuses from action data
    if (action.situational) {
      score += this.applySituationalBonuses(action.situational, action, entity, gameState)
    }
    
    // Health-based adjustments
    score += this.getHealthAdjustments(action, entity, gameState)
    
    // Distance and positioning
    score += this.getPositionalAdjustments(action, entity, gameState)
    
    return Math.max(0, score)
  }

  /**
   * Applies AI modifiers from entity configuration
   */
  static applyAIModifiers(modifiers, action, entity, gameState) {
    let bonus = 0
    
    // Ally low HP bonus
    if (modifiers.allyLowHPBonus && action.target) {
      const targetHP = action.target.currentHP / action.target.maxHP
      if (targetHP < 0.3) {
        bonus += modifiers.allyLowHPBonus
      }
    }
    
    // Critical HP bonus  
    if (modifiers.criticalHPBonus && action.target) {
      const targetHP = action.target.currentHP / action.target.maxHP
      if (targetHP < 0.15) {
        bonus += modifiers.criticalHPBonus
      }
    }
    
    // Multiple enemies bonus
    if (modifiers.multipleEnemiesBonus) {
      const enemyCount = gameState.combatEnemies?.length || 0
      if (enemyCount > 1) {
        bonus += modifiers.multipleEnemiesBonus
      }
    }
    
    // Safe distance bonus
    if (modifiers.safeDistanceBonus && action.target) {
      const distance = this.getDistanceToTarget(action, entity, gameState)
      if (distance > 2) {
        bonus += modifiers.safeDistanceBonus
      }
    }
    
    // Low HP target bonus
    if (modifiers.lowHPBonus && action.target) {
      const targetHP = action.target.currentHP / action.target.maxHP
      if (targetHP < 0.4) {
        bonus += modifiers.lowHPBonus
      }
    }
    
    return bonus
  }

  /**
   * Applies situational bonuses from action data
   */
  static applySituationalBonuses(situational, action, entity, gameState) {
    let bonus = 0
    
    if (situational.lowHPTarget && action.target) {
      const targetHP = action.target.currentHP / action.target.maxHP
      if (targetHP < 0.4) {
        bonus += situational.lowHPTarget
      }
    }
    
    if (situational.safeDistance) {
      const distance = this.getDistanceToTarget(action, entity, gameState)
      if (distance > 2) {
        bonus += situational.safeDistance
      }
    }
    
    if (situational.desperateBonus) {
      const entityHP = entity.currentHP / entity.maxHP
      if (entityHP < 0.3) {
        bonus += situational.desperateBonus
      }
    }
    
    return bonus
  }

  /**
   * Gets health-based score adjustments
   */
  static getHealthAdjustments(action, entity, gameState) {
    let adjustment = 0
    const entityHP = entity.currentHP / entity.maxHP
    
    // Low health entity prioritizes healing/defensive actions
    if (entityHP < 0.3) {
      if (action.actionType === 'spell' && action.name?.toLowerCase().includes('soin')) {
        adjustment += 80
      }
      if (action.type === 'protect' || action.actionType === 'defensive') {
        adjustment += 60
      }
    }
    
    // High health entity can be more aggressive
    if (entityHP > 0.8) {
      if (action.actionType === 'attack') {
        adjustment += 20
      }
    }
    
    return adjustment
  }

  /**
   * Gets positional score adjustments
   */
  static getPositionalAdjustments(action, entity, gameState) {
    let adjustment = 0
    
    const distance = this.getDistanceToTarget(action, entity, gameState)
    const actionRange = this.getActionRange(action)
    
    // In range bonus
    if (distance <= actionRange) {
      adjustment += 25
    } else {
      adjustment -= 50 // Out of range penalty
    }
    
    // Optimal range bonus
    if (entity.role === 'healer' && distance > 2) {
      adjustment += 15 // Healers prefer distance
    } else if (entity.role === 'tank' && distance <= 1) {
      adjustment += 15 // Tanks prefer close range
    }
    
    return adjustment
  }

  // ========================================
  // HELPER METHODS
  // ========================================

  static getDistanceToTarget(action, entity, gameState) {
    if (!action.target) return 999
    
    const entityPos = gameState.combatPositions?.[entity.id || entity.name]
    const targetPos = gameState.combatPositions?.[action.target.id || action.target.name]
    
    if (!entityPos || !targetPos) return 999
    
    return calculateDistance(entityPos, targetPos)
  }

  static getActionRange(action) {
    if (action.range) return action.range
    if (action.actionType === 'spell' && action.range) return action.range
    if (action.type === 'melee') return 1
    if (action.type === 'ranged') return 6
    return 1
  }

  static findMostWoundedAlly(entity, gameState) {
    const allies = this.getAllies(entity, gameState)
    return allies.reduce((mostWounded, ally) => {
      const allyHP = ally.currentHP / ally.maxHP
      const mostWoundedHP = mostWounded ? mostWounded.currentHP / mostWounded.maxHP : 1
      return allyHP < mostWoundedHP ? ally : mostWounded
    }, null)
  }

  static findWoundedAllies(entity, gameState) {
    return this.getAllies(entity, gameState).filter(ally => ally.currentHP < ally.maxHP)
  }

  static getAllies(entity, gameState) {
    const allies = []
    
    if (entity.type === 'companion') {
      // For companions: player + other companions are allies
      if (gameState.playerCharacter) {
        allies.push(gameState.playerCharacter)
      }
      if (gameState.activeCompanions) {
        gameState.activeCompanions.forEach(companion => {
          if (companion.id !== entity.id) {
            allies.push(companion)
          }
        })
      }
    }
    
    return allies
  }

  static findTargets(entity, gameState) {
    if (entity.type === 'companion') {
      return gameState.combatEnemies || []
    } else {
      // Enemy targets player and companions
      const targets = []
      if (gameState.playerCharacter) targets.push(gameState.playerCharacter)
      if (gameState.activeCompanions) targets.push(...gameState.activeCompanions)
      return targets
    }
  }

  static getMeleeAttacks(entity) {
    return entity.attacks?.filter(attack => attack.type === 'melee') || []
  }

  static getRangedAttacks(entity) {
    return entity.attacks?.filter(attack => attack.type === 'ranged') || []
  }

  static getQuickAttacks(entity) {
    return entity.attacks?.filter(attack => attack.type === 'melee' || attack.type === 'ranged') || []
  }

  static getHealingSpells(entity) {
    if (!entity.spellcasting) return []
    return entity.spellcasting.knownSpells
      ?.map(spellName => spells[spellName])
      .filter(spell => spell && spell.name?.toLowerCase().includes('soin')) || []
  }

  static getBuffSpells(entity) {
    if (!entity.spellcasting) return []
    return entity.spellcasting.knownSpells
      ?.map(spellName => spells[spellName])
      .filter(spell => spell && (spell.name?.toLowerCase().includes('bénédiction') || spell.school === 'Enchantement')) || []
  }

  static getSupportSpells(entity) {
    if (!entity.spellcasting) return []
    return entity.spellcasting.knownSpells
      ?.map(spellName => spells[spellName])
      .filter(spell => spell && spell.level <= 2) || [] // Basic support spells
  }

  static findTargetsInMeleeRange(entity, gameState) {
    return this.findTargets(entity, gameState).filter(target => {
      const distance = this.getDistanceToTarget({target}, entity, gameState)
      return distance <= 1
    })
  }

  static findTargetsInRange(entity, gameState) {
    return this.findTargets(entity, gameState).filter(target => {
      const distance = this.getDistanceToTarget({target}, entity, gameState)
      return distance <= 6 // Standard ranged
    })
  }

  static findIsolatedTargets(entity, gameState) {
    // Simplified: just return all targets for hit-and-run
    return this.findTargets(entity, gameState)
  }

  static getFallbackActions(entity, gameState) {
    const actions = []
    
    if (entity.attacks && entity.attacks.length > 0) {
      const targets = this.findTargets(entity, gameState)
      entity.attacks.forEach(attack => {
        targets.forEach(target => {
          actions.push({
            ...attack,
            target: target,
            actionType: 'attack',
            priorityScore: 50,
            description: `${attack.name} sur ${target.name}`
          })
        })
      })
    }
    
    return actions
  }

  static fallbackAction(entity, gameState) {
    const fallbackActions = this.getFallbackActions(entity, gameState)
    return fallbackActions.length > 0 ? fallbackActions[0] : null
  }
}