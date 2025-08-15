import { calculateDistance, getModifier } from '../utils/calculations'
import { spells } from '../data/spells'
import { CombatEngine } from './combatEngine'

/**
 * Service d'IA pour les compagnons selon leur rôle et aiPriority
 * Architecture refactorisée pour séparer la logique du store
 */
export class CompanionAI {
  
  /**
   * Trouve l'allié le plus blessé dans l'équipe
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
   * Trouve l'ennemi le plus proche
   */
  static findClosestEnemy(companionPosition, enemies) {
    if (!enemies || enemies.length === 0) return null
    
    const aliveEnemies = enemies.filter(enemy => enemy.currentHP > 0)
    if (aliveEnemies.length === 0) return null
    
    return aliveEnemies.reduce((closest, enemy) => {
      const enemyPos = enemy.position || { x: 0, y: 0 }
      const distance = calculateDistance(companionPosition, enemyPos)
      
      if (!closest || distance < closest.distance) {
        return { enemy, distance }
      }
      return closest
    }, null)?.enemy
  }

  /**
   * Vérifie si le compagnon peut lancer un sort
   */
  static canCastSpell(companion, spellName) {
    if (!companion.spellcasting || !companion.spellcasting.knownSpells) return false
    
    const spell = spells[spellName]
    if (!spell) return false
    
    const spellLevel = spell.level
    const slotsRemaining = companion.spellcasting.slotsRemaining || {}
    
    if (spellLevel === 0) return true // Cantrips
    
    return (slotsRemaining[spellLevel.toString()] || 0) > 0
  }

  /**
   * Trouve la meilleure attaque selon le type et la priorité
   */
  static getBestAttack(companion, attackType = null, targets = []) {
    if (!companion.attacks || companion.attacks.length === 0) return null
    
    // Filtrer par type si spécifié
    let availableAttacks = companion.attacks
    if (attackType) {
      availableAttacks = companion.attacks.filter(attack => attack.type === attackType)
    }
    
    if (availableAttacks.length === 0) return companion.attacks[0] // Fallback
    
    // Pour l'instant, retourne la première attaque du type demandé
    // TODO: Améliorer avec logique de choix plus sophistiquée
    return availableAttacks[0]
  }

  /**
   * Trouve les sorts disponibles du compagnon
   */
  static getAvailableSpells(companion) {
    if (!companion.spellcasting || !companion.spellcasting.knownSpells) return []
    
    return companion.spellcasting.knownSpells.filter(spellName => 
      CompanionAI.canCastSpell(companion, spellName)
    )
  }

  /**
   * Évalue si une position est dans la portée d'attaque
   */
  static isInRange(attackerPos, targetPos, attack) {
    const distance = calculateDistance(attackerPos, targetPos)
    const range = attack.range || 1
    return distance <= range
  }

  /**
   * IA pour compagnon TANK - Utilise aiPriority
   */
  static tankAI = {
    priority: (companion, gameState) => {
      const actions = []
      const companionPos = gameState.combatPositions?.[companion.id]
      const aliveEnemies = (gameState.combatEnemies || []).filter(e => e.currentHP > 0)
      
      if (!companionPos) return actions

      // Traiter les priorités dans l'ordre défini par aiPriority
      companion.aiPriority?.forEach((priorityType, index) => {
        const basePriority = 100 - (index * 10) // Premier élément = priorité max
        
        switch (priorityType) {
          case 'protect':
            // Protéger les alliés fragiles
            const fragileAlly = CompanionAI.findMostWoundedAlly(gameState)
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
            // Attirer l'attention des ennemis
            if (aliveEnemies.length > 0) {
              actions.push({
                type: 'taunt',
                targets: aliveEnemies,
                priority: basePriority,
                description: 'Attirer l\'attention'
              })
            }
            break
            
          case 'melee_attack':
            // Attaque au corps à corps
            const meleeAttack = CompanionAI.getBestAttack(companion, 'melee')
            const closestEnemy = CompanionAI.findClosestEnemy(companionPos, aliveEnemies)
            if (closestEnemy && meleeAttack) {
              actions.push({
                type: 'attack',
                attack: meleeAttack,
                target: closestEnemy,
                priority: basePriority,
                description: `${meleeAttack.name} sur ${closestEnemy.name}`
              })
            }
            break
            
          case 'ranged_attack':
            // Attaque à distance si disponible
            const rangedAttack = CompanionAI.getBestAttack(companion, 'ranged')
            if (rangedAttack && aliveEnemies.length > 0) {
              const target = CompanionAI.findWeakestEnemy(aliveEnemies)
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
   * IA pour compagnon HEALER - Utilise aiPriority
   */
  static healerAI = {
    priority: (companion, gameState) => {
      const actions = []
      const companionPos = gameState.combatPositions?.[companion.id]
      const aliveEnemies = (gameState.combatEnemies || []).filter(e => e.currentHP > 0)
      
      if (!companionPos) return actions

      // Traiter les priorités dans l'ordre défini par aiPriority
      companion.aiPriority?.forEach((priorityType, index) => {
        const basePriority = 100 - (index * 10)
        
        switch (priorityType) {
          case 'heal':
            // Soigner les alliés blessés
            const mostWounded = CompanionAI.findMostWoundedAlly(gameState)
            if (mostWounded && mostWounded.hpPercentage < 0.6) {
              if (CompanionAI.canCastSpell(companion, 'Soins')) {
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
            // Améliorer les alliés
            const availableSpells = CompanionAI.getAvailableSpells(companion)
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
            // Support à distance
            const rangedAttack = CompanionAI.getBestAttack(companion, 'ranged')
            if (rangedAttack && aliveEnemies.length > 0) {
              const target = CompanionAI.findWeakestEnemy(aliveEnemies)
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
            // Attaque au corps à corps en dernier recours
            const meleeAttack = CompanionAI.getBestAttack(companion, 'melee')
            const closestEnemy = CompanionAI.findClosestEnemy(companionPos, aliveEnemies)
            if (closestEnemy && meleeAttack) {
              actions.push({
                type: 'attack',
                attack: meleeAttack,
                target: closestEnemy,
                priority: basePriority,
                description: `${meleeAttack.name} sur ${closestEnemy.name} (dernier recours)`
              })
            }
            break
        }
      })
      
      return actions.sort((a, b) => b.priority - a.priority)
    }
  }

  /**
   * IA pour compagnon DPS - Étendue avec support des sorts et attaques à distance
   */
  static dpsAI = {
    priority: (companion, gameState) => {
      const actions = []
      const companionPos = gameState.combatPositions?.[companion.id]
      const aliveEnemies = (gameState.combatEnemies || []).filter(e => e.currentHP > 0)
      
      if (!companionPos) return actions

      // Traiter les priorités dans l'ordre défini par aiPriority
      companion.aiPriority?.forEach((priorityType, index) => {
        const basePriority = 100 - (index * 10)
        
        switch (priorityType) {
          case 'ranged_spell':
            // Sorts à distance
            const availableSpells = CompanionAI.getAvailableSpells(companion)
            const target = CompanionAI.findWeakestEnemy(aliveEnemies)
            
            // Priorité aux sorts de dégâts
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
            // Sorts de zone
            const groupedEnemies = CompanionAI.findGroupedEnemies(aliveEnemies, 2)
            if (groupedEnemies.length >= 2) {
              const aoeSpells = CompanionAI.getAvailableSpells(companion)
              if (aoeSpells.includes('Boule de Feu')) {
                actions.push({
                  type: 'spell',
                  spell: 'Boule de Feu',
                  target: groupedEnemies,
                  priority: basePriority,
                  description: `Boule de feu sur ${groupedEnemies.length} ennemis`
                })
              } else if (aoeSpells.includes('Toile d\'araignée')) {
                actions.push({
                  type: 'spell',
                  spell: 'Toile d\'araignée',
                  target: groupedEnemies,
                  priority: basePriority,
                  description: `Toile d'araignée sur ${groupedEnemies.length} ennemis`
                })
              }
            }
            break
            
          case 'debuff':
            // Sorts de débuff
            const strongestEnemy = aliveEnemies.reduce((strongest, enemy) => {
              return (!strongest || enemy.currentHP > strongest.currentHP) ? enemy : strongest
            }, null)
            
            const debuffSpells = CompanionAI.getAvailableSpells(companion)
            if (strongestEnemy && debuffSpells.includes('Lenteur')) {
              actions.push({
                type: 'spell',
                spell: 'Lenteur',
                target: strongestEnemy,
                priority: basePriority,
                description: `Ralentir ${strongestEnemy.name}`
              })
            }
            break
            
          case 'ranged_attack':
            // Attaques à distance physiques
            const rangedAttack = CompanionAI.getBestAttack(companion, 'ranged')
            if (rangedAttack && aliveEnemies.length > 0) {
              const target = CompanionAI.findWeakestEnemy(aliveEnemies)
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
            // Attaque au corps à corps
            const meleeAttack = CompanionAI.getBestAttack(companion, 'melee')
            const closestEnemy = CompanionAI.findClosestEnemy(companionPos, aliveEnemies)
            if (closestEnemy && meleeAttack) {
              actions.push({
                type: 'attack',
                attack: meleeAttack,
                target: closestEnemy,
                priority: basePriority,
                description: `${meleeAttack.name} sur ${closestEnemy.name}`
              })
            }
            break
        }
      })
      
      return actions.sort((a, b) => b.priority - a.priority)
    }
  }

  /**
   * IA pour compagnon SUPPORT - Nouveau pour Finn
   */
  static supportAI = {
    priority: (companion, gameState) => {
      const actions = []
      const companionPos = gameState.combatPositions?.[companion.id]
      const aliveEnemies = (gameState.combatEnemies || []).filter(e => e.currentHP > 0)
      
      if (!companionPos) return actions

      // Traiter les priorités dans l'ordre défini par aiPriority
      companion.aiPriority?.forEach((priorityType, index) => {
        const basePriority = 100 - (index * 10)
        
        switch (priorityType) {
          case 'support_skill':
            // Compétences de support
            const availableSpells = CompanionAI.getAvailableSpells(companion)
            
            // Détection de magie pour révéler les ennemis cachés
            if (availableSpells.includes('Détection de la magie')) {
              actions.push({
                type: 'spell',
                spell: 'Détection de la magie',
                target: 'area',
                priority: basePriority,
                description: 'Détecter la magie'
              })
            }
            
            // Réparation des équipements alliés
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
            // Attaques technologiques à distance
            const rangedAttack = CompanionAI.getBestAttack(companion, 'ranged')
            if (rangedAttack && aliveEnemies.length > 0) {
              const target = CompanionAI.findWeakestEnemy(aliveEnemies)
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
            // Support de soin (inventions médicales)
            const mostWounded = CompanionAI.findMostWoundedAlly(gameState)
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
            // Attaque de proximité en dernier recours
            const meleeAttack = CompanionAI.getBestAttack(companion, 'melee')
            const closestEnemy = CompanionAI.findClosestEnemy(companionPos, aliveEnemies)
            if (closestEnemy && meleeAttack) {
              actions.push({
                type: 'attack',
                attack: meleeAttack,
                target: closestEnemy,
                priority: basePriority,
                description: `${meleeAttack.name} sur ${closestEnemy.name}`
              })
            }
            break
        }
      })
      
      return actions.sort((a, b) => b.priority - a.priority)
    }
  }

  /**
   * Trouve l'ennemi le plus faible
   */
  static findWeakestEnemy(enemies) {
    if (!enemies || enemies.length === 0) return null
    
    return enemies.reduce((weakest, enemy) => {
      if (!weakest || enemy.currentHP < weakest.currentHP) {
        return enemy
      }
      return weakest
    }, null)
  }

  /**
   * Trouve les ennemis groupés dans un rayon donné
   */
  static findGroupedEnemies(enemies, radius = 2) {
    // Logique simplifiée : retourne tous les ennemis pour l'instant
    // À améliorer avec calcul de distance réel
    return enemies.length >= 2 ? enemies : []
  }

  /**
   * Point d'entrée principal : détermine la meilleure action pour un compagnon
   * Architecture refactorisée - sépare la logique du store
   */
  static getBestAction(companion, gameState) {
    if (!companion || !companion.role) {
      console.warn('Compagnon invalide ou sans rôle:', companion)
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
    
    let aiModule
    switch (companion.role) {
      case 'tank':
        aiModule = CompanionAI.tankAI
        break
      case 'healer':
        aiModule = CompanionAI.healerAI
        break
      case 'dps':
        aiModule = CompanionAI.dpsAI
        break
      case 'support':
        aiModule = CompanionAI.supportAI
        break
      default:
        console.warn(`Rôle de compagnon inconnu: ${companion.role}`)
        return null
    }
    
    const possibleActions = aiModule.priority(companion, enrichedGameState)
    const bestAction = possibleActions.length > 0 ? possibleActions[0] : null
    
    if (bestAction) {
      console.log(`🤖 ${companion.name} (${companion.role}): ${bestAction.description}`)
    }
    
    return bestAction
  }

  /**
   * Nouvelle méthode : calcule le mouvement optimal pour un compagnon
   */
  static calculateOptimalMovement(companion, currentPosition, gameState) {
    // Déléguer au CombatEngine existant
    return CombatEngine.calculateOptimalMovement(
      { ...companion, type: 'companion' },
      currentPosition,
      gameState
    )
  }

  /**
   * Nouvelle méthode : trouve les cibles à portée pour une action donnée
   */
  static getTargetsInRange(companion, position, action, gameState) {
    // Déléguer au CombatEngine existant
    return CombatEngine.getTargetsInRange(
      { ...companion, type: 'companion' },
      position,
      action,
      gameState
    )
  }
}