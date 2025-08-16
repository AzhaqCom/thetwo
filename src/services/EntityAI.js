import { calculateDistance, getModifier } from '../utils/calculations'
import { spells } from '../data/spells'
import { CombatEngine } from './combatEngine'
import { SpellService } from './SpellService'

/**
 * Service d'IA unifié pour tous les combattants (compagnons et ennemis)
 * Utilise le système de rôles et aiPriority pour déterminer les actions optimales
 */
export class EntityAI {
  
  /**
   * Point d'entrée principal : détermine la meilleure action pour n'importe quelle entité
   */
  static getBestAction(entity, gameState) {
    if (!entity || !entity.role) {
      console.warn('Entité invalide ou sans rôle:', entity)
      return null
    }
    
    // Enrichir gameState avec les informations nécessaires
    const enrichedGameState = {
      ...gameState,
      playerCharacter: gameState.playerCharacter,
      activeCompanions: gameState.activeCompanions || [],
      combatEnemies: gameState.combatEnemies || [],
      combatPositions: gameState.combatPositions || {}
    }
    
    // Sélectionner le module d'IA selon le rôle
    let aiModule
    switch (entity.role) {
      // Rôles de compagnons
      case 'tank':
        aiModule = EntityAI.tankAI
        break
      case 'healer':
        aiModule = EntityAI.healerAI
        break
      case 'dps':
        aiModule = EntityAI.dpsAI
        break
      case 'support':
        aiModule = EntityAI.supportAI
        break
      
      // Rôles d'ennemis
      case 'skirmisher':
        aiModule = EntityAI.skirmisherAI
        break
      case 'brute':
        aiModule = EntityAI.bruteAI
        break
      case 'caster':
        aiModule = EntityAI.casterAI
        break
      
      default:
        console.warn(`Rôle inconnu: ${entity.role}`)
        return null
    }
    
    const possibleActions = aiModule.priority(entity, enrichedGameState)
    const bestAction = possibleActions.length > 0 ? possibleActions[0] : null
    
    if (bestAction) {
      const entityType = entity.type === 'enemy' ? '🏹' : '🤖'
      console.log(`${entityType} ${entity.name} (${entity.role}): ${bestAction.description}`)
    }
    
    return bestAction
  }

  /**
   * Trouve les cibles selon le type d'entité
   */
  static findTargets(entity, gameState) {
    if (entity.type === 'enemy') {
      return EntityAI.findPlayerTargets(gameState)
    } else {
      return EntityAI.findEnemyTargets(gameState)
    }
  }

  /**
   * Trouve les cibles pour un ennemi (joueur + compagnons)
   */
  static findPlayerTargets(gameState) {
    const targets = []
    
    // Ajouter le joueur
    if (gameState.playerCharacter && gameState.playerCharacter.currentHP > 0) {
      const playerPos = gameState.combatPositions?.player
      if (playerPos) {
        targets.push({
          ...gameState.playerCharacter,
          id: 'player',
          position: playerPos,
          hpPercentage: gameState.playerCharacter.currentHP / gameState.playerCharacter.maxHP,
          threat: 'high' // Joueur = menace prioritaire
        })
      }
    }
    
    // Ajouter les compagnons
    if (gameState.activeCompanions) {
      gameState.activeCompanions.forEach(companion => {
        if (companion && companion.currentHP > 0) {
          const companionPos = gameState.combatPositions?.[companion.id]
          if (companionPos) {
            targets.push({
              ...companion,
              position: companionPos,
              hpPercentage: companion.currentHP / companion.maxHP,
              threat: companion.role === 'healer' ? 'high' : 'medium' // Soigneurs = priorité
            })
          }
        }
      })
    }
    
    return targets
  }

  /**
   * Trouve les cibles pour un compagnon (ennemis)
   */
  static findEnemyTargets(gameState) {
    const targets = []
    
    if (gameState.combatEnemies) {
      gameState.combatEnemies.forEach(enemy => {
        if (enemy && enemy.currentHP > 0) {
          const enemyPos = gameState.combatPositions?.[enemy.name]
          if (enemyPos) {
            targets.push({
              ...enemy,
              position: enemyPos,
              hpPercentage: enemy.currentHP / enemy.maxHP
            })
          }
        }
      })
    }
    
    return targets
  }

  /**
   * Trouve l'allié le plus blessé (pour compagnons soigneurs)
   */
  static findMostWoundedAlly(gameState) {
    const allies = []
    
    // Ajouter le joueur
    if (gameState.playerCharacter && gameState.playerCharacter.currentHP < gameState.playerCharacter.maxHP) {
      allies.push({
        ...gameState.playerCharacter,
        id: 'player',
        hpPercentage: gameState.playerCharacter.currentHP / gameState.playerCharacter.maxHP
      })
    }
    
    // Ajouter les autres compagnons
    if (gameState.activeCompanions) {
      gameState.activeCompanions.forEach(companion => {
        if (companion && companion.currentHP < companion.maxHP) {
          allies.push({
            ...companion,
            hpPercentage: companion.currentHP / companion.maxHP
          })
        }
      })
    }
    
    // Trier par HP% croissant (le plus blessé en premier)
    return allies.sort((a, b) => a.hpPercentage - b.hpPercentage)[0] || null
  }

  /**
   * Trouve la cible la plus proche
   */
  static findClosestTarget(entityPosition, targets) {
    if (!targets || targets.length === 0) return null
    
    return targets.reduce((closest, target) => {
      const distance = calculateDistance(entityPosition, target.position)
      
      if (!closest || distance < closest.distance) {
        return { target, distance }
      }
      return closest
    }, null)?.target
  }

  /**
   * Trouve la cible la plus faible
   */
  static findWeakestTarget(targets) {
    if (!targets || targets.length === 0) return null
    
    return targets.reduce((weakest, target) => {
      if (!weakest || target.hpPercentage < weakest.hpPercentage) {
        return target
      }
      return weakest
    }, null)
  }

  /**
   * Trouve les cibles groupées dans un rayon donné
   */
  static findGroupedTargets(targets, radius = 2) {
    if (!targets || targets.length < 2) return []
    
    const groups = []
    const processed = new Set()
    
    targets.forEach((target, index) => {
      if (processed.has(index)) return
      
      const group = [target]
      processed.add(index)
      
      targets.forEach((other, otherIndex) => {
        if (otherIndex === index || processed.has(otherIndex)) return
        
        const distance = calculateDistance(target.position, other.position)
        if (distance <= radius) {
          group.push(other)
          processed.add(otherIndex)
        }
      })
      
      if (group.length >= 2) {
        groups.push(group)
      }
    })
    
    return groups.length > 0 ? groups.reduce((largest, current) => 
      current.length > largest.length ? current : largest
    ) : []
  }

  /**
   * Trouve la meilleure attaque selon le type
   */
  static getBestAttack(entity, attackType = null, targets = []) {
    if (!entity.attacks || entity.attacks.length === 0) return null
    
    let availableAttacks = entity.attacks
    if (attackType) {
      availableAttacks = entity.attacks.filter(attack => attack.type === attackType)
    }
    
    if (availableAttacks.length === 0) return entity.attacks[0] // Fallback
    return availableAttacks[0]
  }

  /**
   * Vérifie si l'entité peut lancer un sort (délègue vers SpellService)
   */
  static canCastSpell(entity, spellName) {
    if (!entity.spellcasting || !entity.spellcasting.knownSpells) return false
    
    const spell = spells[spellName]
    if (!spell) return false
    
    const spellService = new SpellService()
    return spellService.canCastSpell(spell, entity)
  }

  /**
   * Trouve les sorts disponibles (délègue vers SpellService)
   */
  static getAvailableSpells(entity) {
    if (!entity.spellcasting || !entity.spellcasting.knownSpells) return []
    
    const spellService = new SpellService()
    return spellService.getKnownSpells(entity)
      .filter(spell => this.canCastSpell(entity, spell.name))
  }

  // ========================================
  // MODULES D'IA PAR RÔLE
  // ========================================

  /**
   * IA pour entités TANK
   */
  static tankAI = {
    priority: (entity, gameState) => {
      const actions = []
      const entityPos = gameState.combatPositions?.[entity.id || entity.name]
      const targets = EntityAI.findTargets(entity, gameState)
      
      if (!entityPos || targets.length === 0) return actions

      entity.aiPriority?.forEach((priorityType, index) => {
        const basePriority = 100 - (index * 10)
        
        switch (priorityType) {
          case 'protect':
            const fragileAlly = EntityAI.findMostWoundedAlly(gameState)
            if (fragileAlly && fragileAlly.hpPercentage < 0.3) {
              actions.push({
                type: 'protect',
                target: fragileAlly,
                priority: basePriority,
                description: `Protéger ${fragileAlly.name}`
              })
            }
            break
            
          case 'taunt':
            if (targets.length > 0) {
              actions.push({
                type: 'taunt',
                targets: targets,
                priority: basePriority,
                description: 'Attirer l\'attention'
              })
            }
            break
            
          case 'melee_attack':
            const meleeAttack = EntityAI.getBestAttack(entity, 'melee')
            const closestTarget = EntityAI.findClosestTarget(entityPos, targets)
            if (closestTarget && meleeAttack) {
              actions.push({
                type: 'attack',
                attack: meleeAttack,
                target: closestTarget,
                priority: basePriority,
                description: `${meleeAttack.name} sur ${closestTarget.name}`
              })
            }
            break
            
          case 'ranged_attack':
            const rangedAttack = EntityAI.getBestAttack(entity, 'ranged')
            if (rangedAttack && targets.length > 0) {
              const target = EntityAI.findWeakestTarget(targets)
              actions.push({
                type: 'attack',
                attack: rangedAttack,
                target: target,
                priority: basePriority,
                description: `${rangedAttack.name} sur ${target.name}`
              })
            }
            break
        }
      })
      
      return actions.sort((a, b) => b.priority - a.priority)
    }
  }

  /**
   * IA pour entités HEALER
   */
  static healerAI = {
    priority: (entity, gameState) => {
      const actions = []
      const entityPos = gameState.combatPositions?.[entity.id || entity.name]
      const targets = EntityAI.findTargets(entity, gameState)
      
      if (!entityPos) return actions

      entity.aiPriority?.forEach((priorityType, index) => {
        const basePriority = 100 - (index * 10)
        
        switch (priorityType) {
          case 'heal':
            const mostWounded = EntityAI.findMostWoundedAlly(gameState)
            if (mostWounded && mostWounded.hpPercentage < 0.6) {
              if (EntityAI.canCastSpell(entity, 'Soins')) {
                actions.push({
                  type: 'spell',
                  spell: 'Soins',
                  target: mostWounded,
                  priority: basePriority,
                  description: `Soigner ${mostWounded.name} (${Math.round(mostWounded.hpPercentage * 100)}% HP)`
                })
              }
            }
            break
            
          case 'buff':
            const availableSpells = EntityAI.getAvailableSpells(entity)
            if (availableSpells.includes('Bénédiction')) {
              actions.push({
                type: 'spell',
                spell: 'Bénédiction',
                target: 'party',
                priority: basePriority,
                description: 'Bénir l\'équipe'
              })
            }
            break
            
          case 'ranged_support':
            const rangedAttack = EntityAI.getBestAttack(entity, 'ranged')
            if (rangedAttack && targets.length > 0) {
              const target = EntityAI.findWeakestTarget(targets)
              actions.push({
                type: 'attack',
                attack: rangedAttack,
                target: target,
                priority: basePriority,
                description: `${rangedAttack.name} sur ${target.name}`
              })
            }
            break
            
          case 'melee_attack':
            const meleeAttack = EntityAI.getBestAttack(entity, 'melee')
            const closestTarget = EntityAI.findClosestTarget(entityPos, targets)
            if (closestTarget && meleeAttack) {
              actions.push({
                type: 'attack',
                attack: meleeAttack,
                target: closestTarget,
                priority: basePriority,
                description: `${meleeAttack.name} sur ${closestTarget.name} (dernier recours)`
              })
            }
            break
        }
      })
      
      return actions.sort((a, b) => b.priority - a.priority)
    }
  }

  /**
   * IA pour entités DPS
   */
  static dpsAI = {
    priority: (entity, gameState) => {
      const actions = []
      const entityPos = gameState.combatPositions?.[entity.id || entity.name]
      const targets = EntityAI.findTargets(entity, gameState)
      
      if (!entityPos) return actions

      entity.aiPriority?.forEach((priorityType, index) => {
        const basePriority = 100 - (index * 10)
        
        switch (priorityType) {
          case 'ranged_spell':
            const availableSpells = EntityAI.getAvailableSpells(entity)
            const target = EntityAI.findWeakestTarget(targets)
            
            if (availableSpells.includes('Trait de feu') && target) {
              actions.push({
                type: 'spell',
                spell: 'Trait de feu',
                target: target,
                priority: basePriority,
                description: `Trait de feu sur ${target.name}`
              })
            } else if (availableSpells.includes('Projectile Magique') && target) {
              actions.push({
                type: 'spell',
                spell: 'Projectile Magique',
                target: target,
                priority: basePriority,
                description: `Projectile magique sur ${target.name}`
              })
            }
            break
            
          case 'area_damage':
            const targetsWithPositions = targets.map(target => ({
              ...target,
              position: target.position || { x: 0, y: 0 }
            }))
            
            const groupedTargets = EntityAI.findGroupedTargets(targetsWithPositions, 2)
            if (groupedTargets.length >= 2) {
              const aoeSpells = EntityAI.getAvailableSpells(entity)
              if (aoeSpells.includes('Boule de Feu')) {
                actions.push({
                  type: 'spell',
                  spell: 'Boule de Feu',
                  target: groupedTargets,
                  priority: basePriority,
                  description: `Boule de feu sur ${groupedTargets.length} ennemis`
                })
              } else if (aoeSpells.includes('Toile d\'araignée')) {
                actions.push({
                  type: 'spell',
                  spell: 'Toile d\'araignée',
                  target: groupedTargets,
                  priority: basePriority,
                  description: `Toile d'araignée sur ${groupedTargets.length} ennemis`
                })
              }
            }
            break
            
          case 'debuff':
            const strongestTarget = targets.reduce((strongest, target) => {
              return (!strongest || target.currentHP > strongest.currentHP) ? target : strongest
            }, null)
            
            const debuffSpells = EntityAI.getAvailableSpells(entity)
            if (strongestTarget && debuffSpells.includes('Lenteur')) {
              actions.push({
                type: 'spell',
                spell: 'Lenteur',
                target: strongestTarget,
                priority: basePriority,
                description: `Ralentir ${strongestTarget.name}`
              })
            }
            break
            
          case 'ranged_attack':
            const rangedAttack = EntityAI.getBestAttack(entity, 'ranged')
            if (rangedAttack && targets.length > 0) {
              const target = EntityAI.findWeakestTarget(targets)
              actions.push({
                type: 'attack',
                attack: rangedAttack,
                target: target,
                priority: basePriority,
                description: `${rangedAttack.name} sur ${target.name}`
              })
            }
            break
            
          case 'melee_attack':
            const meleeAttack = EntityAI.getBestAttack(entity, 'melee')
            const closestTarget = EntityAI.findClosestTarget(entityPos, targets)
            if (closestTarget && meleeAttack) {
              actions.push({
                type: 'attack',
                attack: meleeAttack,
                target: closestTarget,
                priority: basePriority,
                description: `${meleeAttack.name} sur ${closestTarget.name}`
              })
            }
            break
        }
      })
      
      return actions.sort((a, b) => b.priority - a.priority)
    }
  }

  /**
   * IA pour entités SUPPORT
   */
  static supportAI = {
    priority: (entity, gameState) => {
      const actions = []
      const entityPos = gameState.combatPositions?.[entity.id || entity.name]
      const targets = EntityAI.findTargets(entity, gameState)
      
      if (!entityPos) return actions

      entity.aiPriority?.forEach((priorityType, index) => {
        const basePriority = 100 - (index * 10)
        
        switch (priorityType) {
          case 'support_skill':
            const availableSpells = EntityAI.getAvailableSpells(entity)
            
            if (availableSpells.includes('Détection de la magie')) {
              actions.push({
                type: 'spell',
                spell: 'Détection de la magie',
                target: 'area',
                priority: basePriority,
                description: 'Détecter la magie'
              })
            }
            
            if (availableSpells.includes('Réparation')) {
              actions.push({
                type: 'spell',
                spell: 'Réparation',
                target: 'party',
                priority: basePriority - 5,
                description: 'Réparer les équipements'
              })
            }
            break
            
          case 'ranged_attack':
            const rangedAttack = EntityAI.getBestAttack(entity, 'ranged')
            if (rangedAttack && targets.length > 0) {
              const target = EntityAI.findWeakestTarget(targets)
              actions.push({
                type: 'attack',
                attack: rangedAttack,
                target: target,
                priority: basePriority,
                description: `${rangedAttack.name} sur ${target.name}`
              })
            }
            break
            
          case 'heal':
            const mostWounded = EntityAI.findMostWoundedAlly(gameState)
            if (mostWounded && mostWounded.hpPercentage < 0.4) {
              actions.push({
                type: 'heal_support',
                target: mostWounded,
                priority: basePriority,
                description: `Soigner ${mostWounded.name} avec inventions`
              })
            }
            break
            
          case 'melee_attack':
            const meleeAttack = EntityAI.getBestAttack(entity, 'melee')
            const closestTarget = EntityAI.findClosestTarget(entityPos, targets)
            if (closestTarget && meleeAttack) {
              actions.push({
                type: 'attack',
                attack: meleeAttack,
                target: closestTarget,
                priority: basePriority,
                description: `${meleeAttack.name} sur ${closestTarget.name}`
              })
            }
            break
        }
      })
      
      return actions.sort((a, b) => b.priority - a.priority)
    }
  }

  /**
   * IA pour entités SKIRMISHER (escarmoucheurs)
   */
  static skirmisherAI = {
    priority: (entity, gameState) => {
      const actions = []
      const entityPos = gameState.combatPositions?.[entity.name]
      const targets = EntityAI.findTargets(entity, gameState)
      
      if (!entityPos || targets.length === 0) return actions

      entity.aiPriority?.forEach((priorityType, index) => {
        const basePriority = 100 - (index * 10)
        
        switch (priorityType) {
          case 'hit_and_run':
            const meleeTargets = targets.filter(t => calculateDistance(entityPos, t.position) <= 1)
            const rangedAttack = EntityAI.getBestAttack(entity, 'ranged')
            
            if (meleeTargets.length > 0 && rangedAttack) {
              actions.push({
                type: 'hit_and_run',
                targets: meleeTargets,
                attack: rangedAttack,
                priority: basePriority,
                description: `Harcèlement à distance après retraite`
              })
            }
            break
            
          case 'ranged_attack':
            const rangedAttackChoice = EntityAI.getBestAttack(entity, 'ranged')
            if (rangedAttackChoice && targets.length > 0) {
              const target = EntityAI.findWeakestTarget(targets)
              actions.push({
                type: 'attack',
                attack: rangedAttackChoice,
                target: target,
                priority: basePriority,
                description: `${rangedAttackChoice.name} sur ${target.name}`
              })
            }
            break
            
          case 'melee_attack':
            const meleeAttack = EntityAI.getBestAttack(entity, 'melee')
            if (meleeAttack && targets.length > 0) {
              const closestTarget = EntityAI.findClosestTarget(entityPos, targets)
              actions.push({
                type: 'attack',
                attack: meleeAttack,
                target: closestTarget,
                priority: basePriority,
                description: `${meleeAttack.name} sur ${closestTarget.name}`
              })
            }
            break
        }
      })
      
      return actions.sort((a, b) => b.priority - a.priority)
    }
  }

  /**
   * IA pour entités BRUTE
   */
  static bruteAI = {
    priority: (entity, gameState) => {
      const actions = []
      const entityPos = gameState.combatPositions?.[entity.name]
      const targets = EntityAI.findTargets(entity, gameState)
      
      if (!entityPos || targets.length === 0) return actions

      entity.aiPriority?.forEach((priorityType, index) => {
        const basePriority = 100 - (index * 10)
        
        switch (priorityType) {
          case 'charge':
            const closestTarget = EntityAI.findClosestTarget(entityPos, targets)
            const distance = calculateDistance(entityPos, closestTarget.position)
            
            if (distance > 2) {
              actions.push({
                type: 'charge',
                target: closestTarget,
                priority: basePriority,
                description: `Charger ${closestTarget.name}`
              })
            }
            break
            
          case 'melee_attack':
            const meleeAttack = EntityAI.getBestAttack(entity, 'melee')
            if (meleeAttack) {
              const target = EntityAI.findWeakestTarget(targets)
              actions.push({
                type: 'attack',
                attack: meleeAttack,
                target: target,
                priority: basePriority,
                description: `${meleeAttack.name} brutal sur ${target.name}`
              })
            }
            break
        }
      })
      
      return actions.sort((a, b) => b.priority - a.priority)
    }
  }

  /**
   * IA pour entités CASTER
   */
  static casterAI = {
    priority: (entity, gameState) => {
      const actions = []
      const entityPos = gameState.combatPositions?.[entity.name]
      const targets = EntityAI.findTargets(entity, gameState)
      
      if (!entityPos || targets.length === 0) return actions

      entity.aiPriority?.forEach((priorityType, index) => {
        const basePriority = 100 - (index * 10)
        
        switch (priorityType) {
          case 'area_spell':
            const groupedTargets = EntityAI.findGroupedTargets(targets, 2)
            if (groupedTargets.length >= 2) {
              actions.push({
                type: 'spell',
                spell: 'Boule de Feu',
                target: groupedTargets,
                priority: basePriority,
                description: `Sort de zone sur ${groupedTargets.length} cibles`
              })
            }
            break
            
          case 'ranged_spell':
            const target = EntityAI.findWeakestTarget(targets)
            actions.push({
              type: 'spell',
              spell: 'Trait de feu',
              target: target,
              priority: basePriority,
              description: `Sort à distance sur ${target.name}`
            })
            break
            
          case 'retreat':
            const tooClose = targets.some(t => calculateDistance(entityPos, t.position) <= 1)
            if (tooClose) {
              actions.push({
                type: 'retreat',
                priority: basePriority,
                description: 'Retraite tactique'
              })
            }
            break
        }
      })
      
      return actions.sort((a, b) => b.priority - a.priority)
    }
  }

  /**
   * Délégation vers CombatEngine pour les calculs de mouvement et ciblage
   */
  static calculateOptimalMovement(entity, currentPosition, gameState) {
    return CombatEngine.calculateOptimalMovement(
      { ...entity, type: entity.type || 'companion' },
      currentPosition,
      gameState
    )
  }

  static getTargetsInRange(entity, position, action, gameState) {
    return CombatEngine.getTargetsInRange(
      { ...entity, type: entity.type || 'companion' },
      position,
      action,
      gameState
    )
  }
}