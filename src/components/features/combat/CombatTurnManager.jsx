import React, { useEffect, useCallback } from 'react'
import { useCombatStore } from '../../../stores/combatStore'
import { useGameStore } from '../../../stores/gameStore'
import { useCharacterStore } from '../../../stores/characterStore'
import { CombatService } from '../../../services/CombatService'
import { CombatEngine } from '../../../services/combatEngine'
import { calculateDistance } from '../../../utils/calculations'

/**
 * Gestionnaire automatique des tours de combat - Version refactorisée
 * Architecture claire avec séparation des responsabilités
 */
export const CombatTurnManager = ({
  currentTurn,
  turnOrder,
  phase,
  onPhaseChange,
  onNextTurn
}) => {
  // Store hooks
  const { 
    combatEnemies: enemies, 
    combatPositions: positions, 
    dealDamageToEnemy, 
    updateEnemyPosition,
    setDamageCallbacks 
  } = useCombatStore()
  
  const { addCombatMessage } = useGameStore()
  const { takeDamagePlayer, takeDamageCompanionById, playerCharacter, playerCompanion, getActiveCompanions } = useCharacterStore()
  
  // Services
  const combatService = new CombatService()

  // Configuration des callbacks de dégâts
  useEffect(() => {
    setDamageCallbacks(takeDamagePlayer, takeDamageCompanionById)
  }, [setDamageCallbacks, takeDamagePlayer, takeDamageCompanionById])

  /**
   * GESTION DES MOUVEMENTS
   * Calcule et exécute le mouvement optimal pour une entité
   */
  const handleMovement = useCallback((entity, gameState) => {
    // Gérer les différentes clés de position selon le type d'entité
    const positionKey = entity.type === 'companion' ? (entity.id || 'companion') : entity.name
    const currentPos = gameState.combatPositions[positionKey]
    
    if (!currentPos) {
      console.warn(`⚠️ Position manquante pour ${entity.name} (clé: ${positionKey})`)
      return { moved: false, newPosition: currentPos }
    }

    // Utiliser CombatEngine pour calculer le mouvement optimal
    const optimalPosition = CombatEngine.calculateOptimalMovement(entity, currentPos, gameState)
    
    if (!optimalPosition) {
      console.log(`🚫 ${entity.name} ne bouge pas - déjà bien placé`)
      return { moved: false, newPosition: currentPos }
    }

    // Valider le mouvement avec le service
    const isValidMove = combatService.executeEntityMovement(
      entity, 
      currentPos, 
      optimalPosition, 
      gameState, 
      addCombatMessage
    )

    if (isValidMove) {
      // Appliquer le mouvement (gérer les différents types)
      updateEnemyPosition(positionKey, optimalPosition)
      
      const distance = Math.abs(optimalPosition.x - currentPos.x) + Math.abs(optimalPosition.y - currentPos.y)
      addCombatMessage(`${entity.name} se déplace de ${distance} case(s).`)
      
      console.log(`✅ ${entity.name} bouge vers (${optimalPosition.x}, ${optimalPosition.y})`)
      return { moved: true, newPosition: optimalPosition }
    } else {
      console.warn(`❌ Mouvement échoué pour ${entity.name}`)
      return { moved: false, newPosition: currentPos }
    }
  }, [combatService, updateEnemyPosition, addCombatMessage])

  /**
   * GESTION DU CIBLAGE
   * Trouve la meilleure cible pour une entité
   */
  const getTarget = useCallback((entity, gameState) => {
    // Gérer les différentes clés de position selon le type d'entité
    const positionKey = entity.type === 'companion' ? (entity.id || 'companion') : entity.name
    const currentPos = gameState.combatPositions[positionKey]
    
    // Utiliser CombatEngine pour trouver la meilleure cible
    const activeCompanions = getActiveCompanions()
    const target = CombatEngine.findBestTarget(entity, currentPos, {
      ...gameState,
      playerCharacter,
      companionCharacter: playerCompanion, // Compatibilité
      activeCompanions: activeCompanions    // Nouveau système
    })

    if (!target) {
      console.log(`🎯 ${entity.name}: Aucune cible trouvée`)
      addCombatMessage(`${entity.name} ne trouve aucune cible.`)
    }

    return target
  }, [playerCharacter, playerCompanion, addCombatMessage, getActiveCompanions])

  /**
   * Applique les dégâts à une cible selon son type
   */
  const applyDamageToTarget = useCallback((target, damage) => {
    if (target.type === 'player') {
      takeDamagePlayer(damage)
    } else if (target.type === 'companion') {
      console.log(target)
      console.log(target.name)

      takeDamageCompanionById(target.character.id, damage)
       console.log(target)
    } else if (target.type === 'enemy') {
      dealDamageToEnemy(target.name, damage)
      
      // Vérifier si l'ennemi est mort
      setTimeout(() => {
       
        const enemyAfter = enemies.find(e => e.name === target.name)
        if (enemyAfter && enemyAfter.currentHP <= 0) {
          addCombatMessage(`💀 ${target.name} tombe au combat !`, 'enemy-death')
        }
      }, 100)
    }
  }, [takeDamagePlayer, takeDamageCompanionById, dealDamageToEnemy, addCombatMessage, enemies])

  /**
   * Sélectionne le meilleur attackSet selon la distance
   */
  const selectAttackSet = useCallback((attackSets, distance) => {
    // Filtrer les sets qui ont au moins une attaque à portée
    const viableSets = attackSets.filter(set => 
      set.attacks.some(attack => {
        const attackRange = attack.range || 1
        return distance <= attackRange
      })
    )

    if (viableSets.length === 0) return null

    // Prioriser selon la distance et le type d'attaque
    const meleeSets = viableSets.filter(set => 
      set.attacks.some(attack => attack.type === 'melee' && distance <= (attack.range || 1))
    )
    
    const rangedSets = viableSets.filter(set => 
      set.attacks.some(attack => attack.type === 'ranged' && distance <= (attack.range || 6))
    )

    // Si le joueur est proche (distance <= 1), privilégier le mêlée
    if (distance <= 1 && meleeSets.length > 0) {
      return meleeSets[0] // Prendre le premier set de mêlée disponible
    }
    
    // Sinon, privilégier la distance si disponible
    if (rangedSets.length > 0) {
      return rangedSets[0] // Prendre le premier set à distance disponible
    }
    
    // Sinon prendre le premier set viable
    return viableSets[0]
  }, [])

  /**
   * Exécute une attaque simple traditionnelle
   */
  const executeSingleAttack = useCallback((attacker, target, gameState, distance) => {
    // Choisir une attaque appropriée
    const availableAttacks = attacker.attacks || [{
      name: "Attaque de base",
      damageDice: "1d6",
      damageBonus: 0,
      range: 1
    }]

    // Filtrer les attaques viables selon la distance
    const viableAttacks = availableAttacks.filter(attack => {
      const attackRange = attack.range || 1
      return distance <= attackRange
    })

    if (viableAttacks.length === 0) {
      console.log(`🤷 ${attacker.name} est trop loin pour attaquer (distance: ${distance})`)
      addCombatMessage(`${attacker.name} est trop loin pour attaquer.`)
      return false
    }

    // Choisir une attaque au hasard parmi les viables
    const attack = viableAttacks[Math.floor(Math.random() * viableAttacks.length)]

    // Exécuter l'attaque via le service
    const result = combatService.executeEntityAttack(attacker, attack, target, addCombatMessage)

    if (result.success) {
      applyDamageToTarget(target, result.damage)
    }

    return result.success
  }, [combatService, addCombatMessage, applyDamageToTarget])

  /**
   * Exécute plusieurs attaques d'un attackSet
   */
  const executeMultipleAttacks = useCallback((attacker, target, gameState, distance) => {
    // Sélectionner intelligemment un attackSet selon la distance
    const selectedSet = selectAttackSet(attacker.attackSets, distance)
    
    if (!selectedSet) {
      console.log(`🤷 ${attacker.name} n'a pas d'attaque viable à distance ${distance}`)
      addCombatMessage(`${attacker.name} ne peut pas attaquer à cette distance.`)
      return false
    }

    console.log(`⚔️ ${attacker.name} utilise: ${selectedSet.name}`)
    addCombatMessage(`${attacker.name} lance ${selectedSet.name}.`)

    let overallSuccess = false
    let attackCount = 0

    // Exécuter toutes les attaques du set sélectionné
    for (const attack of selectedSet.attacks) {
      // Vérifier si la cible est encore vivante avant chaque attaque
      if (target.character.currentHP <= 0) {
        console.log(`💀 ${target.name} est mort, arrêt des attaques restantes`)
        break
      }

      attackCount++
      const result = combatService.executeEntityAttack(attacker, attack, target, addCombatMessage)

      if (result.success) {
        overallSuccess = true
        applyDamageToTarget(target, result.damage)
        
        // Petit délai entre les attaques multiples pour la lisibilité
        if (attackCount < selectedSet.attacks.length) {
          setTimeout(() => {}, 200)
        }
      }
    }

    return overallSuccess
  }, [combatService, addCombatMessage, selectAttackSet, applyDamageToTarget])

  /**
   * GESTION DES ATTAQUES
   * Exécute une ou plusieurs attaques et applique les dégâts
   */
  const executeAttack = useCallback((attacker, target, gameState) => {
    if (!target || !target.character) {
      console.warn(`⚠️ Cible invalide pour ${attacker.name}`)
      return false
    }

    // Vérifier que la cible est toujours vivante
    if (target.character.currentHP <= 0) {
      console.log(`💀 ${target.name} est déjà mort, ${attacker.name} passe son tour`)
      addCombatMessage(`${attacker.name} réalise que ${target.name} est déjà tombé au combat.`)
      return false
    }

    // Calculer la distance à la cible (gérer les différents types)
    const attackerPosKey = attacker.type === 'companion' ? (attacker.id || 'companion') : attacker.name
    const attackerPos = gameState.combatPositions[attackerPosKey]
    const distance = calculateDistance(attackerPos, target.position)

    // Gérer les attaques multiples (attackSets) ou simples (attacks)
    if (attacker.attackSets && attacker.attackSets.length > 0) {
      return executeMultipleAttacks(attacker, target, gameState, distance)
    } else {
      return executeSingleAttack(attacker, target, gameState, distance)
    }
  }, [executeMultipleAttacks, executeSingleAttack, addCombatMessage])

  /**
   * EXECUTION DU TOUR D'ENNEMI
   * Logique complète pour un tour d'ennemi
   */
  const handleEnemyTurn = useCallback((enemy) => {
    console.log(`👹 === Tour de ${enemy.name} ===`)
    
    // Vérifier que l'ennemi est vivant AU DÉBUT du tour
    const enemyCharacter = enemies.find(e => e.name === enemy.name)
    if (!enemyCharacter || enemyCharacter.currentHP <= 0) {
      console.log(`💀 ${enemy.name} est mort, tour passé`)
      setTimeout(() => {
        setIsExecuting(false)
        onNextTurn()
      }, 200)
      return
    }

    // État du jeu actuel
    const activeCompanions = getActiveCompanions()
    const gameState = {
      combatPositions: useCombatStore.getState().combatPositions,
      combatEnemies: enemies,
      playerCharacter,
      companionCharacter: playerCompanion,
      activeCompanions: activeCompanions
    }

    // 1. MOUVEMENT
    const movementResult = handleMovement(enemyCharacter, gameState)
    
    // VÉRIFICATION après mouvement : est-il toujours vivant ?
    const enemyAfterMovement = enemies.find(e => e.name === enemy.name)
    if (!enemyAfterMovement || enemyAfterMovement.currentHP <= 0) {
      console.log(`💀 ${enemy.name} est mort pendant le mouvement, tour annulé`)
      setTimeout(() => {
        setIsExecuting(false)
        onNextTurn()
      }, 200)
      return
    }
    
    // Mettre à jour l'état du jeu après mouvement
    const updatedGameState = {
      ...gameState,
      combatPositions: useCombatStore.getState().combatPositions,
      activeCompanions: activeCompanions
    }

    // 2. CIBLAGE
    const target = getTarget(enemyAfterMovement, updatedGameState)
    
    if (!target) {
      // Pas de cible, fin de tour
      setTimeout(() => {
        setIsExecuting(false)
        onNextTurn()
      }, 200)
      return
    }

    // 3. ATTAQUE (vérification finale avant attaque)
    setTimeout(() => {
      // VÉRIFICATION FINALE : ennemi toujours vivant avant attaque ?
      const enemyBeforeAttack = enemies.find(e => e.name === enemy.name)
      if (!enemyBeforeAttack || enemyBeforeAttack.currentHP <= 0) {
        console.log(`💀 ${enemy.name} est mort avant l'attaque, tour annulé`)
        setIsExecuting(false)
        onNextTurn()
        return
      }

      const attackSuccess = executeAttack(enemyBeforeAttack, target, updatedGameState)
      
      if (attackSuccess) {
        console.log(`✅ ${enemy.name} a terminé son attaque`)
      } else {
        console.log(`❌ ${enemy.name} n'a pas pu attaquer`)
      }

      // Fin de tour avec délai réduit
      setTimeout(() => {
        setIsExecuting(false)
        onNextTurn()
      }, 300)
    }, movementResult.moved ? 800 : 400)

  }, [enemies, playerCharacter, playerCompanion, handleMovement, getTarget, executeAttack, onNextTurn, onPhaseChange])

  /**
   * EXECUTION DU TOUR DE COMPAGNON  
   * Logique identique aux ennemis mais ciblant les ennemis
   */
  const handleCompanionTurn = useCallback((companionTurn) => {
    console.log(`🤝 ${companionTurn.name} agit`)
    const activeCompanions = getActiveCompanions()
    
    // Récupérer le bon personnage compagnon depuis le turn order
    const actualCompanion = companionTurn.character || playerCompanion
    
    if (!actualCompanion || actualCompanion.currentHP <= 0) {
      console.log(`💀 TURN: ${companionTurn.name} est mort, tour passé`)
      addCombatMessage(`${companionTurn.name} est trop blessé pour agir.`)
      setTimeout(() => {
        setIsExecuting(false)
        onNextTurn()
      }, 500)
      return
    }
    
    // Détails du compagnon configurés

    // État du jeu pour le compagnon (cible les ennemis vivants)
    const gameState = {
      combatPositions: useCombatStore.getState().combatPositions,
      combatEnemies: enemies.filter(e => e.currentHP > 0), // Ennemis vivants uniquement
      playerCharacter: null, // Le compagnon ne cible pas le joueur
      companionCharacter: null // Le compagnon ne se cible pas
    }

    // Adapter l'entité compagnon pour utiliser la même logique que les ennemis
    const companionAsEntity = {
      ...actualCompanion,
      name: companionTurn.name,
      id: companionTurn.id || companionTurn.name.toLowerCase(),
      type: 'companion',
      attacks: actualCompanion.attacks || [{
        name: "Attaque de base",
        damageDice: "1d6", 
        damageBonus: 0,
        range: 1
      }]
    }

    // 1. MOUVEMENT vers les ennemis (utilise la même logique que les ennemis)
    const movementResult = handleMovement(companionAsEntity, gameState)
    
    // Mettre à jour l'état du jeu après mouvement
    const updatedGameState = {
      ...gameState,
      combatPositions: useCombatStore.getState().combatPositions,
      activeCompanions: activeCompanions
    }

    // 2. CIBLAGE ET ATTAQUE (utilise la même logique que les ennemis)
    setTimeout(() => {
      // Recherche de cible
      
      const target = getTarget(companionAsEntity, updatedGameState)
      
      if (!target) {
        addCombatMessage(`${companionTurn.name} ne trouve aucune cible.`)
        setTimeout(() => {
          setIsExecuting(false)
          onNextTurn()
        }, 500)
        return
      }

      // 3. ATTAQUE
      const attackSuccess = executeAttack(companionAsEntity, target, updatedGameState)
      
      if (attackSuccess) {
        console.log(`✅ ${companionTurn.name} a attaqué avec succès`)
      } else {
        console.log(`❌ ${companionTurn.name} n'a pas pu attaquer`)
      }

      // Fin de tour
      setTimeout(() => {
        setIsExecuting(false)
        onNextTurn()
      }, 500)
    }, movementResult.moved ? 1000 : 500)

  }, [playerCompanion, enemies, combatService, updateEnemyPosition, addCombatMessage, executeAttack, onNextTurn, onPhaseChange])

  // Protection contre les re-exécutions multiples
  const [isExecuting, setIsExecuting] = React.useState(false)
  const [lastExecutedTurn, setLastExecutedTurn] = React.useState(null)

  /**
   * GESTIONNAIRE PRINCIPAL DES TOURS
   * Détermine quel type de tour exécuter
   */
  useEffect(() => {
    if (phase !== 'executing-turn' || !currentTurn || isExecuting) return

    // Éviter les re-exécutions du même tour exact
    // Utiliser le turnCounter et currentTurnIndex pour créer un identifiant unique de tour
    const { turnCounter, currentTurnIndex } = useCombatStore.getState()
    const currentTurnKey = `${currentTurn.name}-${currentTurn.type}-${turnCounter}-${currentTurnIndex}`
    if (lastExecutedTurn === currentTurnKey) {
      // Protection silencieuse - normal en mode dev React
      console.log(`🔄 Tour déjà exécuté: ${currentTurnKey}`)
      return
    }

    console.log(`🎮 Exécution du tour: ${currentTurn.name} (${currentTurn.type}) - Round: ${turnCounter}, Index: ${currentTurnIndex}`)
    setIsExecuting(true)
    setLastExecutedTurn(currentTurnKey)

    // VÉRIFICATION GLOBALE de fin de combat avant d'exécuter le tour
    const allEnemiesDead = enemies.every(e => e.currentHP <= 0)
    const playerDead = !playerCharacter || playerCharacter.currentHP <= 0
    
    if (allEnemiesDead) {
      console.log(`🎉 Victoire ! Tous les ennemis sont morts`)
      setIsExecuting(false)
      onPhaseChange('victory')
      return
    } else if (playerDead) {
      console.log(`💀 Défaite ! Le joueur est mort`)
      setIsExecuting(false)
      onPhaseChange('defeat')
      return
    }

    // VÉRIFICATION PRIORITAIRE: Skip les entités mortes
    const isEntityDead = () => {
      if (currentTurn.type === 'player') {
        return !playerCharacter || playerCharacter.currentHP <= 0
      } else if (currentTurn.type === 'companion') {
        return !playerCompanion || playerCompanion.currentHP <= 0
      } else if (currentTurn.type === 'enemy') {
        const enemy = enemies.find(e => e.name === currentTurn.name)
        return !enemy || enemy.currentHP <= 0
      }
      return false
    }

    if (isEntityDead()) {
      console.log(`💀 ${currentTurn.name} est mort, tour passé automatiquement`)
      setIsExecuting(false)
      
      // Vérifier les conditions de fin de combat avant de passer au tour suivant
      const allEnemiesDead = enemies.every(e => e.currentHP <= 0)
      const playerDead = !playerCharacter || playerCharacter.currentHP <= 0
      
      if (allEnemiesDead) {
        console.log(`🎉 Tous les ennemis sont morts - Victoire !`)
        onPhaseChange('victory')
        return
      } else if (playerDead) {
        console.log(`💀 Le joueur est mort - Défaite !`)
        onPhaseChange('defeat')
        return
      }
      
      onNextTurn()
      return
    }

    const executeWithCleanup = (executionFunction) => {
      try {
        executionFunction()
      } catch (error) {
        console.error(`❌ Erreur pendant l'exécution du tour ${currentTurn.name}:`, error)
        setIsExecuting(false)
        onNextTurn()
      }
    }

    switch (currentTurn.type) {
      case 'enemy':
        executeWithCleanup(() => {
          handleEnemyTurn(currentTurn)
          setTimeout(() => setIsExecuting(false), 800) // Safety timeout
        })
        break
        
      case 'companion':
        executeWithCleanup(() => {
          handleCompanionTurn(currentTurn)
          setTimeout(() => setIsExecuting(false), 800) // Safety timeout
        })
        break
        
      case 'player':
        // Vérifier si le joueur peut encore agir
        if (playerCharacter && playerCharacter.currentHP > 0) {
          console.log(`👤 Tour du joueur: ${currentTurn.name}`)
          setIsExecuting(false)
          
          // Vérifier la victoire après le tour du joueur (case où il vient de tuer le dernier ennemi)
          setTimeout(() => {
            const allEnemiesDead = enemies.every(e => e.currentHP <= 0)
            if (allEnemiesDead) {
              console.log(`🎉 Victoire détectée après le tour du joueur !`)
              onPhaseChange('victory')
            }
          }, 100) // Court délai pour que les dégâts soient appliqués
        } else {
          console.log(`💀 Joueur mort, fin de combat`)
          setIsExecuting(false)
          onPhaseChange('defeat')
        }
        break
        
      default:
        console.warn(`❓ Type de tour inconnu: ${currentTurn.type}`)
        setIsExecuting(false)
        onNextTurn()
    }
  }, [phase, currentTurn, isExecuting, lastExecutedTurn, handleEnemyTurn, handleCompanionTurn, onNextTurn, onPhaseChange, playerCharacter, playerCompanion, enemies])

  // Ce composant est invisible, il ne rend rien
  return null
}

export default CombatTurnManager