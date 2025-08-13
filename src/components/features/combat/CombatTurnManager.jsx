import React, { useEffect, useCallback } from 'react'
import { useCombatStore } from '../../../stores/combatStore'
import { useGameStore } from '../../../stores/gameStore'
import { useCharacterStore } from '../../../stores/characterStore'
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
  const { combatEnemies: enemies, combatPositions: positions, dealDamageToEnemy, updateEnemyPosition } = useCombatStore()
  const { addCombatMessage } = useGameStore()
  const { takeDamagePlayer, takeDamageCompanion } = useCharacterStore()
  const { playerCharacter, playerCompanion } = useCharacterStore()
  const combatService = new CombatService()

  // Calculer le déplacement intelligent pour un ennemi
  const calculateEnemyMovement = useCallback((enemy, turnOrder, positions) => {
    const enemyPosition = positions[enemy.name]
    if (!enemyPosition) return { shouldMove: false, newPosition: null }
    
    // Trouver tous les alliés vivants
    const aliveAllies = turnOrder.filter(combatant => {
      if (combatant.type !== 'player' && combatant.type !== 'companion') return false
      
      if (combatant.character) {
        return combatant.character.currentHP > 0
      } else {
        return (combatant.currentHP || 0) > 0
      }
    })
    
    if (aliveAllies.length === 0) return { shouldMove: false, newPosition: null }
    
    // Trouver la cible la plus proche (priorité au joueur)
    const primaryTarget = aliveAllies.find(ally => ally.type === 'player') || aliveAllies[0]
    const targetPosition = positions[primaryTarget.type === 'player' ? 'player' : 'companion']
    
    if (!targetPosition) return { shouldMove: false, newPosition: null }
    
    // Calculer la distance
    const distance = Math.abs(enemyPosition.x - targetPosition.x) + Math.abs(enemyPosition.y - targetPosition.y)
    
    // L'ennemi a-t-il une attaque de mêlée ?
    const enemyCharacter = enemy.character || enemy
    const hasMeleeAttack = enemyCharacter.attacks?.some(attack => 
      attack.type === 'melee' || attack.range <= 1
    )
    
    // S'il a une attaque de mêlée et n'est pas adjacent, il doit se rapprocher
    if (hasMeleeAttack && distance > 1) {
      // Calculer la meilleure position pour se rapprocher
      const bestPosition = findBestMovePosition(enemyPosition, targetPosition, positions, turnOrder)
      
      // Vérifier que la nouvelle position est différente de la position actuelle
      if (bestPosition && (bestPosition.x !== enemyPosition.x || bestPosition.y !== enemyPosition.y)) {
        return {
          shouldMove: true,
          newPosition: bestPosition,
          target: primaryTarget
        }
      }
    }
    
    // Pour les attaques à distance, reste en place si déjà à portée
    // Ou si aucune meilleure position n'a été trouvée
    return { shouldMove: false, newPosition: null }
  }, [])
  
  // Trouver la meilleure position pour se déplacer
  const findBestMovePosition = useCallback((startPos, targetPos, positions, turnOrder) => {
    const MOVEMENT_RANGE = 6 // Portée de déplacement des ennemis
    const possibleMoves = []
    
    console.log(`🎯 Calcul mouvement de (${startPos.x}, ${startPos.y}) vers (${targetPos.x}, ${targetPos.y})`)
    console.log(`🗺️ Positions actuelles:`, positions)
    
    // Générer toutes les positions possibles dans la portée de déplacement
    for (let dx = -MOVEMENT_RANGE; dx <= MOVEMENT_RANGE; dx++) {
      for (let dy = -MOVEMENT_RANGE; dy <= MOVEMENT_RANGE; dy++) {
        const newX = startPos.x + dx
        const newY = startPos.y + dy
        
        // Vérifier les limites de la grille
        if (newX < 0 || newX >= 8 || newY < 0 || newY >= 6) continue
        
        // Ne peut pas dépasser la portée de déplacement (distance Manhattan)
        if (Math.abs(dx) + Math.abs(dy) > MOVEMENT_RANGE) continue
        
        // Vérifier que la case n'est pas occupée
        const isOccupied = Object.values(positions).some(pos => 
          pos && pos.x === newX && pos.y === newY
        )
        
        if (!isOccupied) {
          const distanceToTarget = Math.abs(newX - targetPos.x) + Math.abs(newY - targetPos.y)
          possibleMoves.push({
            x: newX,
            y: newY,
            distanceToTarget,
            movementCost: Math.abs(dx) + Math.abs(dy)
          })
        }
      }
    }
    
    console.log(`📍 ${possibleMoves.length} mouvements possibles trouvés`)
    
    // Trier par distance à la cible puis par coût de mouvement
    possibleMoves.sort((a, b) => {
      if (a.distanceToTarget !== b.distanceToTarget) {
        return a.distanceToTarget - b.distanceToTarget
      }
      return a.movementCost - b.movementCost
    })
    
    const bestMove = possibleMoves[0] || startPos
    console.log(`🏆 Meilleur mouvement choisi:`, bestMove)
    
    return bestMove
  }, [])

  // Système d'attaques d'opportunité
  const checkOpportunityAttacks = useCallback((movingCharacter, fromPosition, toPosition, allCombatants) => {
    const opportunityAttacks = []
    
    // Parcourir tous les combattants pour voir qui peut faire une attaque d'opportunité
    allCombatants.forEach(combatant => {
      // Ne pas s'attaquer soi-même
      if (combatant === movingCharacter) return
      
      // Seuls les ennemis (par rapport au personnage qui bouge) peuvent faire des AO
      const isEnemyOf = (
        (movingCharacter.type === 'player' || movingCharacter.type === 'companion') && combatant.type === 'enemy'
      ) || (
        movingCharacter.type === 'enemy' && (combatant.type === 'player' || combatant.type === 'companion')
      )
      
      if (!isEnemyOf) return
      
      // Vérifier que l'attaquant est vivant
      const attackerCharacter = combatant.character || combatant
      if ((attackerCharacter.currentHP || 0) <= 0) return
      
      // Obtenir la position de l'attaquant
      let attackerPosition = null
      if (combatant.type === 'player') {
        attackerPosition = positions.player
      } else if (combatant.type === 'companion') {
        attackerPosition = positions.companion
      } else {
        attackerPosition = positions[combatant.name]
      }
      
      if (!attackerPosition) return
      
      // L'attaque d'opportunité se déclenche si :
      // 1. Le personnage était adjacent à l'attaquant (distance = 1)
      // 2. Le personnage n'est plus adjacent après le mouvement
      // 3. L'attaquant a une attaque de mêlée
      
      const wasAdjacent = Math.abs(fromPosition.x - attackerPosition.x) + Math.abs(fromPosition.y - attackerPosition.y) === 1
      const stillAdjacent = Math.abs(toPosition.x - attackerPosition.x) + Math.abs(toPosition.y - attackerPosition.y) === 1
      
      if (wasAdjacent && !stillAdjacent) {
        // Vérifier que l'attaquant a une attaque de mêlée
        const hasMeleeAttack = attackerCharacter.attacks?.some(attack => 
          attack.type === 'melee' || attack.range <= 1
        )
        
        if (hasMeleeAttack) {
          const meleeAttack = attackerCharacter.attacks.find(attack => 
            attack.type === 'melee' || attack.range <= 1
          )
          
          opportunityAttacks.push({
            attacker: combatant,
            target: movingCharacter,
            attack: meleeAttack,
            attackerPosition
          })
        }
      }
    })
    
    return opportunityAttacks
  }, [positions])
  
  // Exécuter une attaque d'opportunité
  const executeOpportunityAttack = useCallback((opportunityAttack) => {
    const { attacker, target, attack } = opportunityAttack
    const attackerCharacter = attacker.character || attacker
    const targetCharacter = target.character || target
    
    addCombatMessage(`⚡ Attaque d'opportunité ! ${attacker.name} attaque ${target.name} qui tente de s'éloigner !`, 'opportunity')
    
    // Jet d'attaque
    const attackRoll = combatService.rollD20()
    const attackBonus = combatService.getAttackBonus(attackerCharacter, attack)
    const totalAttack = attackRoll + attackBonus
    
    const criticalHit = attackRoll === 20
    const targetAC = targetCharacter ? targetCharacter.ac : target.ac
    const hit = totalAttack >= targetAC || criticalHit
    
    if (hit) {
      let damage = 0
      if (attack.damageDice) {
        damage = combatService.rollDamage(attack.damageDice) + (attack.damageBonus || 0)
      } else if (attack.damage) {
        damage = combatService.rollDamage(attack.damage)
      } else {
        damage = 1
      }
      
      if (criticalHit) {
        damage *= 2
        addCombatMessage(
          `💥 Coup critique d'opportunité ! ${attacker.name} inflige ${damage} dégâts à ${target.name} !`,
          'critical'
        )
      } else {
        addCombatMessage(
          `⚔️ L'attaque d'opportunité de ${attacker.name} touche et inflige ${damage} dégâts à ${target.name}`,
          'hit'
        )
      }
      
      // Appliquer les dégâts selon le type de cible
      if (target.type === 'player') {
        takeDamagePlayer(damage)
      } else if (target.type === 'companion') {
        takeDamageCompanion(damage)
      } else if (target.type === 'enemy') {
        const enemyBeforeDamage = enemies.find(e => e.name === target.name)
        dealDamageToEnemy(target.name, damage)
        
        // Vérifier si l'ennemi est mort après les dégâts
        setTimeout(() => {
          const enemyAfterDamage = enemies.find(e => e.name === target.name)
          if (enemyAfterDamage && enemyAfterDamage.currentHP <= 0 && enemyBeforeDamage?.currentHP > 0) {
            addCombatMessage(`💀 ${target.name} tombe au combat !`, 'enemy-death')
          }
        }, 100)
      }
      
    } else {
      addCombatMessage(
        `❌ L'attaque d'opportunité de ${attacker.name} manque ${target.name} (${totalAttack} vs CA ${targetAC})`,
        'miss'
      )
    }
  }, [combatService, addCombatMessage, takeDamagePlayer, takeDamageCompanion, dealDamageToEnemy])

  // Obtenir le combattant actuel
  const getCurrentCombatant = useCallback(() => {
    if (!turnOrder || turnOrder.length === 0 || currentTurn >= turnOrder.length || currentTurn < 0) {
      return null
    }
    return turnOrder[currentTurn]
  }, [turnOrder, currentTurn])

  // Vérifier si le combattant actuel est vivant
  const isCurrentCombatantAlive = useCallback(() => {
    const combatant = getCurrentCombatant()
    if (!combatant) return false
    
    // Pour les ennemis, les PV sont directement sur l'objet combatant
    if (combatant.type === 'enemy' && combatant.currentHP !== undefined) {
      return combatant.currentHP > 0
    }
    
    // Pour les joueurs et compagnons, les PV sont dans combatant.character
    if (combatant.character) {
      return combatant.character.currentHP > 0
    }
    
    // Fallback - chercher les PV directement
    return (combatant.currentHP || 0) > 0
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
      if (nextCombatant) {
        // Vérifier les PV selon le type de combattant
        let isAlive = false
        if (nextCombatant.type === 'enemy' && nextCombatant.currentHP !== undefined) {
          isAlive = nextCombatant.currentHP > 0
        } else if (nextCombatant.character) {
          isAlive = nextCombatant.character.currentHP > 0
        } else {
          isAlive = (nextCombatant.currentHP || 0) > 0
        }
        
        if (isAlive) {
          return nextIndex
        }
      }
    } while (attempts < maxAttempts)
    
    return null
  }, [currentTurn, turnOrder])

  // Gestion automatique des tours d'IA
  useEffect(() => {
    console.log('🎮 CombatTurnManager - phase actuelle:', phase);
    if (phase !== 'turn') return
    
    const currentCombatant = getCurrentCombatant()
    console.log('👤 Current combattant:', currentCombatant);
    console.log('✅ Is alive:', isCurrentCombatantAlive());
    
    if (!currentCombatant || !isCurrentCombatantAlive()) return
    
    // Gérer les différents types de combattants
    switch (currentCombatant.type) {
      case 'player':
        onPhaseChange('player-turn')
        addCombatMessage(`C'est au tour de ${currentCombatant.name}`, 'turn-start')
        break
        
      case 'companion':
        // Vérifier que le compagnon existe toujours
        if (!currentCombatant || !currentCombatant.character) {
          console.warn('Tour de compagnon mais compagnon inexistant, passage au tour suivant')
          onNextTurn()
          return
        }
        
        onPhaseChange('companion-turn')
        addCombatMessage(`C'est au tour de ${currentCombatant.name}`, 'turn-start')
        // Auto-gérer le tour du compagnon après un délai
        setTimeout(() => {
          handleCompanionTurn(currentCombatant)
        }, 500)
        break
        
      case 'enemy':
        onPhaseChange('enemy-turn')
        addCombatMessage(`C'est au tour de ${currentCombatant.name}`, 'turn-start')
        // Auto-gérer le tour de l'ennemi après un délai
        setTimeout(() => {
          handleEnemyTurn(currentCombatant)
        }, 500)
        break
    }
  }, [phase, currentTurn, getCurrentCombatant, isCurrentCombatantAlive, onPhaseChange, addCombatMessage])

  // Gestion du tour du compagnon
  const handleCompanionTurn = useCallback((companion) => {
    // TODO: Implémenter l'IA du compagnon
    addCombatMessage(`${companion.name} observe la situation et attend le bon moment.`)
    
    // Passer au tour suivant après un délai
    setTimeout(() => {
      onNextTurn()
      onPhaseChange('turn')
    }, 500)
  }, [onNextTurn, onPhaseChange, addCombatMessage])

  // Gestion du tour de l'ennemi
  const handleEnemyTurn = useCallback((enemy) => {
    // Vérifier que l'ennemi est vivant
    const enemyCharacter = enemy.character || enemy
    const currentHP = enemyCharacter.currentHP || 0
    
    if (currentHP <= 0) {
      addCombatMessage(`${enemy.name} est inconscient et ne peut pas agir.`)
      setTimeout(() => {
        onNextTurn()
        onPhaseChange('turn')
      }, 500)
      return
    }

    if (!enemyCharacter.attacks || enemyCharacter.attacks.length === 0) {
      addCombatMessage(`${enemy.name} n'a pas d'attaque disponible.`)
      setTimeout(() => {
        onNextTurn()
        onPhaseChange('turn')
      }, 500)
      return
    }

    // 1. Déplacement intelligent
    // Utiliser les positions actuelles du store pour être sûr d'avoir les dernières positions
    const currentPositions = useCombatStore.getState().combatPositions
    const movement = calculateEnemyMovement(enemy, turnOrder, currentPositions)
    
    console.log(`🚶 ${enemy.name} - mouvement calculé:`, movement)
    
    if (movement.shouldMove && movement.newPosition) {
      const oldPosition = positions[enemy.name]
      
      console.log(`🚶 ${enemy.name} bouge de (${oldPosition?.x}, ${oldPosition?.y}) vers (${movement.newPosition.x}, ${movement.newPosition.y})`)
      
      // Vérifier les attaques d'opportunité AVANT de bouger
      const opportunityAttacks = checkOpportunityAttacks(enemy, oldPosition, movement.newPosition, turnOrder)
      
      addCombatMessage(`${enemy.name} se déplace vers une meilleure position.`)
      updateEnemyPosition(enemy.name, movement.newPosition)
      
      console.log(`✅ Position mise à jour pour ${enemy.name}:`, positions[enemy.name])
      
      // Exécuter les attaques d'opportunité APRÈS le mouvement
      if (opportunityAttacks.length > 0) {
        opportunityAttacks.forEach(attackData => {
          setTimeout(() => {
            executeOpportunityAttack(attackData)
          }, 500) // Petit délai pour que le mouvement soit visible
        })
      }
    } else {
      console.log(`🚫 ${enemy.name} ne bouge pas - shouldMove: ${movement.shouldMove}, newPosition:`, movement.newPosition)
    }

    // 2. Trouver des cibles vivantes (priorité: joueur > compagnon)
    const possibleTargets = turnOrder.filter(combatant => {
      if (combatant.type !== 'player' && combatant.type !== 'companion') return false
      
      // Vérifier les PV selon la structure du combattant
      if (combatant.character) {
        return combatant.character.currentHP > 0
      } else {
        return (combatant.currentHP || 0) > 0
      }
    })
    
    if (possibleTargets.length === 0) {
      // Pas de cible, fin du combat
      onPhaseChange('victory')
      return
    }

    // Priorité au joueur
    const target = possibleTargets.find(t => t.type === 'player') || possibleTargets[0]
    const updatedPositions = useCombatStore.getState().combatPositions
    const targetPosition = updatedPositions[target.type === 'player' ? 'player' : 'companion']
    const currentEnemyPosition = updatedPositions[enemy.name]
    
    if (!targetPosition || !currentEnemyPosition) {
      addCombatMessage(`${enemy.name} ne peut pas localiser sa cible.`)
      setTimeout(() => {
        onNextTurn()
        onPhaseChange('turn')
      }, 500)
      return
    }
    
    // 3. Calculer la distance à la cible
    const distanceToTarget = Math.abs(currentEnemyPosition.x - targetPosition.x) + Math.abs(currentEnemyPosition.y - targetPosition.y)
    
    // 4. Choisir une attaque appropriée selon la distance
    const viableAttacks = enemyCharacter.attacks.filter(attack => {
      const attackRange = attack.range || 1
      return distanceToTarget <= attackRange
    })
    
    if (viableAttacks.length === 0) {
      addCombatMessage(`${enemy.name} est trop loin pour attaquer et passe son tour.`)
      setTimeout(() => {
        onNextTurn()
        onPhaseChange('turn')
      }, 500)
      return
    }
    
    // Choisir une attaque viable aléatoirement
    const attack = viableAttacks[Math.floor(Math.random() * viableAttacks.length)]
    
    // Exécuter l'attaque
    executeEnemyAttack(enemyCharacter, attack, target)
  }, [onNextTurn, onPhaseChange, addCombatMessage])

  // Exécuter une attaque d'ennemi
  const executeEnemyAttack = useCallback((enemy, attack, target) => {
    // Jet d'attaque
    const attackRoll = combatService.rollD20()
    
    // Vérifier que l'ennemi a les bonnes propriétés pour le calcul d'attaque
    const attackBonus = combatService.getAttackBonus(enemy, attack)
    if (isNaN(attackBonus)) {
      console.error('❌ Attack bonus est NaN pour:', enemy, attack)
      return
    }
    
    const totalAttack = attackRoll + attackBonus
    
    const criticalHit = attackRoll === 20
    const targetAC = target.character ? target.character.ac : (target.ac || 10)
    
    if (isNaN(targetAC)) {
      console.error('❌ Target AC est NaN pour:', target)
      return
    }
    
    const hit = totalAttack >= targetAC || criticalHit
    
    if (hit) {
      // Calculer les dégâts en utilisant le format correct selon l'attaque
      let damage = 0
      if (attack.damageDice) {
        // Format ennemi avec dés séparés
        damage = combatService.rollDamage(attack.damageDice) + (attack.damageBonus || 0)
      } else if (attack.damage) {
        // Format arme standard
        damage = combatService.rollDamage(attack.damage)
      } else {
        // Fallback
        damage = 1
      }
      
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
      
      // Appliquer les dégâts selon le type de cible
      if (target.type === 'player') {
        takeDamagePlayer(damage)
      } else if (target.type === 'companion') {
        takeDamageCompanion(damage)
      } else if (target.type === 'enemy') {
        const enemyBeforeDamage = enemies.find(e => e.name === target.name)
        dealDamageToEnemy(target.name, damage)
        
        // Vérifier si l'ennemi est mort après les dégâts
        setTimeout(() => {
          const enemyAfterDamage = enemies.find(e => e.name === target.name)
          if (enemyAfterDamage && enemyAfterDamage.currentHP <= 0 && enemyBeforeDamage?.currentHP > 0) {
            addCombatMessage(`💀 ${target.name} tombe au combat !`, 'enemy-death')
          }
        }, 100)
      }
      
    } else {
      addCombatMessage(
        `❌ ${enemy.name} manque ${target.name} avec ${attack.name} (${totalAttack} vs CA ${targetAC})`,
        'miss'
      )
    }
    
    // Passer au tour suivant après un délai
    setTimeout(() => {
      onNextTurn()
      onPhaseChange('turn')
    }, 600)
  }, [onNextTurn, onPhaseChange, addCombatMessage])

  // Vérification de la mort du joueur (priorité sur les autres conditions)
  useEffect(() => {
    // Ne pas vérifier pendant l'initialisation
    if (phase === 'initializing' || phase === 'initiative-display') return
    
    // Ne pas revérifier si déjà en défaite ou victoire
    if (phase === 'victory' || phase === 'defeat') return
    
    // Vérifier si le joueur est mort
    const playerDead = playerCharacter && playerCharacter.currentHP <= 0
    
    // Vérifier si le compagnon est mort (s'il existe)
    const companionDead = playerCompanion ? playerCompanion.currentHP <= 0 : true
    
    // Si le joueur ET le compagnon sont morts, c'est la défaite
    if (playerDead && companionDead) {
      console.log('💀 Défaite détectée - joueur mort!')
      addCombatMessage(`💀 ${playerCharacter.name} tombe au combat...`, 'death')
      if (playerCompanion && playerCompanion.currentHP <= 0) {
        addCombatMessage(`💀 ${playerCompanion.name} tombe également au combat...`, 'death')
      }
      addCombatMessage('💀 Défaite... Tous les alliés ont été vaincus.', 'defeat')
      setTimeout(() => {
        onPhaseChange('defeat')
      }, 500) // Délai pour laisser voir les messages
      return
    }
    
    // Si seul le joueur est mort mais le compagnon vit encore
    if (playerDead && !companionDead) {
      console.log('⚰️ Joueur mort mais compagnon encore vivant')
      addCombatMessage(`💀 ${playerCharacter.name} tombe au combat ! ${playerCompanion.name} continue seul...`, 'death')
      // Le combat continue avec le compagnon
      return
    }
  }, [playerCharacter?.currentHP, playerCompanion?.currentHP, phase, onPhaseChange, addCombatMessage])

  // Vérification des conditions de fin de combat
  useEffect(() => {
    if (phase === 'victory' || phase === 'defeat') return
    
    // Ne pas vérifier les conditions de fin pendant l'initialisation
    if (phase === 'initializing' || phase === 'initiative-display') return
    
    // Vérifier si tous les ennemis sont morts
    if (!enemies || !Array.isArray(enemies)) return
    
    const aliveEnemies = enemies.filter(enemy => {
      const currentHP = enemy.currentHP || 0
      return currentHP > 0
    })
    
    console.log(`🏥 Check de fin de combat: ${aliveEnemies.length}/${enemies.length} ennemis vivants`)
    
    if (aliveEnemies.length === 0 && enemies.length > 0) {
      console.log('🎉 Victoire détectée!')
      onPhaseChange('victory')
      addCombatMessage('🎉 Victoire ! Tous les ennemis ont été vaincus !', 'victory')
      return
    }
    
    // Vérifier si le joueur (et compagnon) sont morts
    const aliveAllies = turnOrder.filter(combatant => {
      if (combatant.type !== 'player' && combatant.type !== 'companion') return false
      
      // Vérifier les PV selon la structure du combattant
      if (combatant.character) {
        return combatant.character.currentHP > 0
      } else {
        return (combatant.currentHP || 0) > 0
      }
    })
    
    console.log(`🏥 Check alliés: ${aliveAllies.length} alliés vivants`)
    
    if (aliveAllies.length === 0) {
      console.log('💀 Défaite détectée!')
      onPhaseChange('defeat')
      addCombatMessage('💀 Défaite... Tous les alliés ont été vaincus.', 'defeat')
      return
    }
  }, [phase, enemies, turnOrder, onPhaseChange, addCombatMessage])

  // Ce composant ne rend rien - il ne gère que la logique
  return null
}

export default CombatTurnManager