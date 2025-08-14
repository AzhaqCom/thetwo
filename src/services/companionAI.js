import { calculateDistance, getModifier } from '../utils/calculations'
import { spells } from '../data/spells'

/**
 * Service d'IA pour les compagnons selon leur rôle
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
   * IA pour compagnon TANK
   */
  static tankAI = {
    priority: (companion, gameState) => {
      const actions = []
      
      // 1. Se positionner entre les ennemis et les alliés fragiles
      const aliveEnemies = (gameState.combatEnemies || []).filter(e => e.currentHP > 0)
      if (aliveEnemies.length > 0) {
        actions.push({
          type: 'position',
          priority: 90,
          description: 'Se positionner défensivement'
        })
      }
      
      // 2. Attaquer l'ennemi le plus proche
      const companionPos = gameState.combatPositions?.[companion.id] || gameState.combatPositions?.companion
      if (companionPos) {
        const closestEnemy = CompanionAI.findClosestEnemy(companionPos, aliveEnemies)
        if (closestEnemy) {
          actions.push({
            type: 'attack',
            target: closestEnemy,
            priority: 70,
            description: `Attaquer ${closestEnemy.name}`
          })
        }
      }
      
      return actions.sort((a, b) => b.priority - a.priority)
    },
    
    shouldCastSpell: () => null // Le tank n'a pas de sorts
  }

  /**
   * IA pour compagnon HEALER
   */
  static healerAI = {
    priority: (companion, gameState) => {
      const actions = []
      
      // 1. Priorité absolue : soigner si quelqu'un < 50% HP
      const mostWounded = CompanionAI.findMostWoundedAlly(gameState)
      if (mostWounded && mostWounded.hpPercentage < 0.5) {
        if (CompanionAI.canCastSpell(companion, 'Soins')) {
          actions.push({
            type: 'spell',
            spell: 'Soins',
            target: mostWounded,
            priority: 100,
            description: `Soigner ${mostWounded.name} (${Math.round(mostWounded.hpPercentage * 100)}% HP)`
          })
        }
      }
      
      // 2. Buffer les alliés si tout le monde > 75% HP et sorts disponibles
      if (!mostWounded || mostWounded.hpPercentage > 0.75) {
        if (CompanionAI.canCastSpell(companion, 'Bénédiction')) {
          actions.push({
            type: 'spell',
            spell: 'Bénédiction',
            target: 'party',
            priority: 80,
            description: 'Bénir l\'équipe'
          })
        }
        
        if (CompanionAI.canCastSpell(companion, 'Aide')) {
          actions.push({
            type: 'spell',
            spell: 'Aide',
            target: 'party',
            priority: 75,
            description: 'Renforcer l\'équipe'
          })
        }
      }
      
      // 3. Attaque en dernier recours
      const companionPos = gameState.combatPositions?.[companion.id] || gameState.combatPositions?.companion
      if (companionPos) {
        const aliveEnemies = (gameState.combatEnemies || []).filter(e => e.currentHP > 0)
        const closestEnemy = CompanionAI.findClosestEnemy(companionPos, aliveEnemies)
        if (closestEnemy) {
          actions.push({
            type: 'attack',
            target: closestEnemy,
            priority: 40,
            description: `Attaquer ${closestEnemy.name} (dernier recours)`
          })
        }
      }
      
      return actions.sort((a, b) => b.priority - a.priority)
    },
    
    shouldCastSpell: (companion, gameState) => {
      // Logique de sorts pour healer (appelée par l'IA principale)
      const mostWounded = CompanionAI.findMostWoundedAlly(gameState)
      
      if (mostWounded && mostWounded.hpPercentage < 0.5 && CompanionAI.canCastSpell(companion, 'Soins')) {
        return { spell: 'Soins', target: mostWounded }
      }
      
      if ((!mostWounded || mostWounded.hpPercentage > 0.75) && CompanionAI.canCastSpell(companion, 'Bénédiction')) {
        return { spell: 'Bénédiction', target: 'party' }
      }
      
      return null
    }
  }

  /**
   * IA pour compagnon DPS
   */
  static dpsAI = {
    priority: (companion, gameState) => {
      const actions = []
      const aliveEnemies = (gameState.combatEnemies || []).filter(e => e.currentHP > 0)
      
      // 1. Utiliser sorts AOE si plusieurs ennemis groupés
      const groupedEnemies = CompanionAI.findGroupedEnemies(aliveEnemies, 2) // Rayon de 2 cases
      if (groupedEnemies.length >= 2 && CompanionAI.canCastSpell(companion, 'Boule de Feu')) {
        actions.push({
          type: 'spell',
          spell: 'Boule de Feu',
          target: groupedEnemies,
          priority: 95,
          description: `Boule de feu sur ${groupedEnemies.length} ennemis`
        })
      }
      
      // 2. Sort de dégâts simple sur l'ennemi le plus faible
      const weakestEnemy = CompanionAI.findWeakestEnemy(aliveEnemies)
      if (weakestEnemy && CompanionAI.canCastSpell(companion, 'Projectile Magique')) {
        actions.push({
          type: 'spell',
          spell: 'Projectile Magique',
          target: weakestEnemy,
          priority: 85,
          description: `Projectile magique sur ${weakestEnemy.name}`
        })
      }
      
      // 3. Attaque physique si plus de magie
      const companionPos = gameState.combatPositions?.[companion.id] || gameState.combatPositions?.companion
      if (companionPos && weakestEnemy) {
        actions.push({
          type: 'attack',
          target: weakestEnemy,
          priority: 60,
          description: `Attaquer ${weakestEnemy.name}`
        })
      }
      
      return actions.sort((a, b) => b.priority - a.priority)
    },
    
    shouldCastSpell: (companion, gameState) => {
      const aliveEnemies = (gameState.combatEnemies || []).filter(e => e.currentHP > 0)
      
      // AOE en priorité
      const groupedEnemies = CompanionAI.findGroupedEnemies(aliveEnemies, 2)
      if (groupedEnemies.length >= 2 && CompanionAI.canCastSpell(companion, 'Boule de Feu')) {
        return { spell: 'Boule de Feu', target: groupedEnemies }
      }
      
      // Sort single target
      const weakestEnemy = CompanionAI.findWeakestEnemy(aliveEnemies)
      if (weakestEnemy && CompanionAI.canCastSpell(companion, 'Projectile Magique')) {
        return { spell: 'Projectile Magique', target: weakestEnemy }
      }
      
      return null
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
   */
  static getBestAction(companion, gameState) {
    if (!companion || !companion.role) return null
    
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
      default:
        console.warn(`Rôle de compagnon inconnu: ${companion.role}`)
        return null
    }
    
    const possibleActions = aiModule.priority(companion, gameState)
    return possibleActions.length > 0 ? possibleActions[0] : null
  }
}