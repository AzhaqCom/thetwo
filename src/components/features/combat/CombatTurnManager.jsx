import React, { useEffect, useCallback } from 'react'
import { useCombatStore } from '../../../stores/combatStore'
import { useGameStore } from '../../../stores/gameStore'
import { CombatService } from '../../../services/CombatService'

/**
 * Gestionnaire automatique des tours de combat
 * Composant invisible qui gère la logique des tours
 */
export const CombatTurnManager = ({
  currentTurn,
  turnOrder,
  phase,
  onPhaseChange,
  onNextTurn
}) => {
  const { enemies, positions } = useCombatStore()
  const { addCombatMessage } = useGameStore()
  const combatService = new CombatService()

  // Obtenir le combattant actuel
  const getCurrentCombatant = useCallback(() => {
    if (!turnOrder || turnOrder.length === 0 || currentTurn >= turnOrder.length) {
      return null
    }
    return turnOrder[currentTurn]
  }, [turnOrder, currentTurn])

  // Vérifier si le combattant actuel est vivant
  const isCurrentCombatantAlive = useCallback(() => {
    const combatant = getCurrentCombatant()
    if (!combatant) return false
    return combatant.currentHP > 0
  }, [getCurrentCombatant])

  // Passer au prochain combattant vivant
  const skipToNextAliveCombatant = useCallback(() => {
    let nextIndex = currentTurn
    let attempts = 0
    const maxAttempts = turnOrder.length
    
    do {
      nextIndex = (nextIndex + 1) % turnOrder.length
      attempts++
      
      if (attempts >= maxAttempts) {
        // Tous les combattants sont morts, fin du combat
        return null
      }
      
      const nextCombatant = turnOrder[nextIndex]
      if (nextCombatant && nextCombatant.currentHP > 0) {
        return nextIndex
      }
    } while (attempts < maxAttempts)
    
    return null
  }, [currentTurn, turnOrder])

  // Gestion automatique des tours d'IA
  useEffect(() => {
    if (phase !== 'combat') return
    
    const currentCombatant = getCurrentCombatant()
    if (!currentCombatant || !isCurrentCombatantAlive()) return
    
    // Gérer les différents types de combattants
    switch (currentCombatant.type) {
      case 'player':
        onPhaseChange('player-turn')
        addCombatMessage(`C'est au tour de ${currentCombatant.name}`, 'turn-start')
        break
        
      case 'companion':
        onPhaseChange('companion-turn')
        addCombatMessage(`C'est au tour de ${currentCombatant.name}`, 'turn-start')
        // Auto-gérer le tour du compagnon après un délai
        setTimeout(() => {
          handleCompanionTurn(currentCombatant)
        }, 1000)
        break
        
      case 'enemy':
        onPhaseChange('enemy-turn')
        addCombatMessage(`C'est au tour de ${currentCombatant.name}`, 'turn-start')
        // Auto-gérer le tour de l'ennemi après un délai
        setTimeout(() => {
          handleEnemyTurn(currentCombatant)
        }, 1500)
        break
    }
  }, [phase, currentTurn, getCurrentCombatant, isCurrentCombatantAlive, onPhaseChange, addCombatMessage])

  // Gestion du tour du compagnon
  const handleCompanionTurn = (companion) => {
    // TODO: Implémenter l'IA du compagnon
    addCombatMessage(`${companion.name} observe la situation et attend le bon moment.`)
    
    // Passer au tour suivant après un délai
    setTimeout(() => {
      onNextTurn()
      onPhaseChange('combat')
    }, 1000)
  }

  // Gestion du tour de l'ennemi
  const handleEnemyTurn = (enemy) => {
    if (!enemy.attacks || enemy.attacks.length === 0) {
      addCombatMessage(`${enemy.name} n'a pas d'attaque disponible.`)
      setTimeout(() => {
        onNextTurn()
        onPhaseChange('combat')
      }, 1000)
      return
    }

    // Choisir une attaque aléatoire
    const attack = enemy.attacks[Math.floor(Math.random() * enemy.attacks.length)]
    
    // Trouver une cible (priorité: joueur > compagnon)
    const possibleTargets = turnOrder.filter(combatant => 
      (combatant.type === 'player' || combatant.type === 'companion') && 
      combatant.currentHP > 0
    )
    
    if (possibleTargets.length === 0) {
      // Pas de cible, fin du combat
      onPhaseChange('victory')
      return
    }

    // Priorité au joueur
    const target = possibleTargets.find(t => t.type === 'player') || possibleTargets[0]
    
    // Exécuter l'attaque
    executeEnemyAttack(enemy, attack, target)
  }

  // Exécuter une attaque d'ennemi
  const executeEnemyAttack = (enemy, attack, target) => {
    // Jet d'attaque
    const attackRoll = combatService.rollD20()
    const attackBonus = combatService.getAttackBonus(enemy, attack)
    const totalAttack = attackRoll + attackBonus
    
    const criticalHit = attackRoll === 20
    const hit = totalAttack >= target.ac || criticalHit
    
    if (hit) {
      let damage = combatService.rollDamage(attack.damage)
      if (criticalHit) {
        damage *= 2
        addCombatMessage(
          `💥 Coup critique ! ${enemy.name} utilise ${attack.name} et inflige ${damage} dégâts à ${target.name} !`,
          'critical'
        )
      } else {
        addCombatMessage(
          `⚔️ ${enemy.name} utilise ${attack.name} et inflige ${damage} dégâts à ${target.name}`,
          'enemy-hit'
        )
      }
      
      // Appliquer les dégâts
      // TODO: Intégrer avec le store pour mettre à jour les HP
      
    } else {
      addCombatMessage(
        `❌ ${enemy.name} manque ${target.name} avec ${attack.name} (${totalAttack} vs CA ${target.ac})`,
        'miss'
      )
    }
    
    // Passer au tour suivant après un délai
    setTimeout(() => {
      onNextTurn()
      onPhaseChange('combat')
    }, 2000)
  }

  // Vérification des conditions de fin de combat
  useEffect(() => {
    if (phase === 'victory' || phase === 'defeat') return
    
    // Vérifier si tous les ennemis sont morts
    const aliveEnemies = enemies.filter(enemy => enemy.currentHP > 0)
    if (aliveEnemies.length === 0) {
      onPhaseChange('victory')
      addCombatMessage('🎉 Victoire ! Tous les ennemis ont été vaincus !', 'victory')
      return
    }
    
    // Vérifier si le joueur (et compagnon) sont morts
    const aliveAllies = turnOrder.filter(combatant => 
      (combatant.type === 'player' || combatant.type === 'companion') && 
      combatant.currentHP > 0
    )
    if (aliveAllies.length === 0) {
      onPhaseChange('defeat')
      addCombatMessage('💀 Défaite... Tous les alliés ont été vaincus.', 'defeat')
      return
    }
  }, [phase, enemies, turnOrder, onPhaseChange, addCombatMessage])

  // Ce composant ne rend rien - il ne gère que la logique
  return null
}

export default CombatTurnManager