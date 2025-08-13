import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { CombatEngine } from '../services/combatEngine'
import { CharacterManager } from '../services/characterManager'
import { GameLogic } from '../services/gameLogic'
import { rollD20WithModifier, getModifier, calculateDistance } from '../utils/calculations'
import { isValidGridPosition, isPositionOccupied } from '../utils/validation'
import { GRID_WIDTH, GRID_HEIGHT, COMBAT_PHASES } from '../utils/constants'
import { enemyTemplates } from '../data/enemies'

// Store pour la gestion du système de combat
export const useCombatStore = create(
  devtools(
    (set, get) => ({
      // === ÉTAT DU COMBAT ===
      isActive: false,
      isInitialized: false,
      combatPhase: 'idle', // 'idle', 'initializing', 'initiative-display', 'turn', 'player-movement', 'executing-turn', 'end'
      combatKey: 0,
      encounterData: null,

      // === PARTICIPANTS ===
      combatEnemies: [],
      companionCharacter: null,

      // === GESTION DES TOURS ===
      turnOrder: [],
      currentTurnIndex: 0,
      turnCounter: 0,

      // === POSITIONS ET MOUVEMENT ===
      combatPositions: {}, // { player: {x,y}, companion: {x,y}, "Enemy 1": {x,y} }
      showMovementFor: null,
      showTargetingFor: null,
      hasMovedThisTurn: false,

      // === ACTIONS ET CIBLAGE ===
      playerAction: null,
      actionTargets: [],
      selectedAoESquares: [],
      aoeCenter: null,

      // === RÉSULTATS ===
      defeated: false,
      victory: false,
      totalXpGained: 0,

      // === ACTIONS D'INITIALISATION ===

      initializeCombat: (encounterData, playerCharacter, playerCompanion) => set((state) => {
        // Créer les instances d'ennemis à partir des références
        const enemyInstances = []
        
        encounterData.enemies.forEach((enemyRef, encounterIndex) => {
          const template = enemyTemplates[enemyRef.type]
          if (!template) {
            console.error('❌ Template ennemi non trouvé:', enemyRef.type)
            return
          }
          
          // Créer le nombre d'instances demandé
          for (let i = 0; i < enemyRef.count; i++) {
            enemyInstances.push({
              ...GameLogic.deepClone(template),
              name: `${template.name} ${i + 1}`,
              id: GameLogic.generateId('enemy'),
              type: 'enemy'
            })
          }
        })

        // Calculer l'ordre d'initiative
        const initiativeOrder = []

        // Initiative joueur
        const playerInitiative = rollD20WithModifier(getModifier(playerCharacter.stats.dexterite))
        initiativeOrder.push({
          type: 'player',
          name: playerCharacter.name,
          initiative: playerInitiative,
          character: playerCharacter
        })

        // Initiative compagnon si présent
        
        if (playerCompanion && playerCompanion.stats) {
          const companionInitiative = rollD20WithModifier(getModifier(playerCompanion.stats.dexterite))
          initiativeOrder.push({
            type: 'companion',
            name: playerCompanion.name,
            initiative: companionInitiative,
            character: playerCompanion
          })
         
        } else {
          console.log('❌ Pas de compagnon valide, skip');
        }

        // Initiative ennemis
        enemyInstances.forEach(enemy => {
          if (!enemy.stats || !enemy.stats.dexterite) {
            console.error('❌ Enemy sans stats.dexterite:', enemy);
            return; // Skip cet ennemi
          }
          
          const enemyInitiative = rollD20WithModifier(getModifier(enemy.stats.dexterite))
          initiativeOrder.push({
            type: 'enemy',
            name: enemy.name,
            initiative: enemyInitiative,
            character: enemy
          })
        })

        // Trier par initiative (plus haut en premier, joueur gagne les égalités)
        const sortedOrder = initiativeOrder.sort((a, b) => {
          if (b.initiative === a.initiative) {
            return a.type === 'player' ? -1 : (b.type === 'player' ? 1 : 0)
          }
          return b.initiative - a.initiative
        })
        
        // Initialiser les positions
        const positions = get().calculateInitialPositions(enemyInstances, !!playerCompanion, encounterData.enemyPositions)
        
        // Sauvegarder les positions initiales comme positions de début de tour
        positions.playerStartPos = { ...positions.player }
        if (positions.companion) {
          positions.companionStartPos = { ...positions.companion }
        }

        return {
          ...state,
          isActive: true,
          isInitialized: true,
          combatPhase: 'initiative-display',
          encounterData,
          combatEnemies: enemyInstances,
          companionCharacter: playerCompanion ? GameLogic.deepClone(playerCompanion) : null,
          turnOrder: sortedOrder,
          currentTurnIndex: 0,
          turnCounter: 1,
          combatPositions: positions,
          hasMovedThisTurn: false,
          defeated: false,
          victory: false,
          totalXpGained: 0
        }
      }),

      calculateInitialPositions: (enemies, hasCompanion, customEnemyPositions = {}) => {
        const positions = {
          player: { x: 0, y: 5 } // Bottom-left corner for player
        }

        // Position du compagnon
        if (hasCompanion) {
          positions.companion = { x: 1, y: 5 }
        }

        // Positions des ennemis
        enemies.forEach((enemy, index) => {
          if (customEnemyPositions[enemy.name]) {
            positions[enemy.name] = customEnemyPositions[enemy.name]
          } else {
            // Placement automatique côté droit de la grille
            const baseX = Math.min(6, GRID_WIDTH - 2)
            const baseY = Math.min(index, GRID_HEIGHT - 1)
            positions[enemy.name] = { x: baseX + (index % 2), y: baseY }
          }
        })

        return positions
      },

      resetCombat: () => set({
        isActive: false,
        isInitialized: false,
        combatPhase: 'idle',
        encounterData: null,
        combatEnemies: [],
        companionCharacter: null,
        turnOrder: [],
        currentTurnIndex: 0,
        turnCounter: 0,
        combatPositions: {},
        showMovementFor: null,
        showTargetingFor: null,
        hasMovedThisTurn: false,
        playerAction: null,
        actionTargets: [],
        selectedAoESquares: [],
        aoeCenter: null,
        defeated: false,
        victory: false,
        totalXpGained: 0
      }),

      // === GESTION DES TOURS ===

      startCombat: () => set({ combatPhase: 'turn' }),

      nextTurn: () => set((state) => {
        let nextIndex = state.currentTurnIndex + 1

        // Revenir au début si on a dépassé
        if (nextIndex >= state.turnOrder.length) {
          nextIndex = 0
          state.turnCounter++
        }

        // Skip les personnages morts
        while (nextIndex !== state.currentTurnIndex) {
          const currentTurnData = state.turnOrder[nextIndex]
          
          if (currentTurnData.type === 'enemy') {
            const enemy = state.combatEnemies.find(e => e.name === currentTurnData.name)
            if (!enemy || enemy.currentHP <= 0) {
              nextIndex++
              if (nextIndex >= state.turnOrder.length) {
                nextIndex = 0
                state.turnCounter++
              }
              continue
            }
          }
          break
        }

        // Sauvegarder la position de début de tour pour le joueur
        const newCombatant = state.turnOrder[nextIndex]
        const newPositions = { ...state.combatPositions }
        
        if (newCombatant?.type === 'player') {
          newPositions.playerStartPos = { ...state.combatPositions.player }
        } else if (newCombatant?.type === 'companion') {
          newPositions.companionStartPos = { ...state.combatPositions.companion }
        }

        return {
          currentTurnIndex: nextIndex,
          turnCounter: state.turnCounter,
          combatPhase: 'turn',
          hasMovedThisTurn: false,
          showMovementFor: null,
          showTargetingFor: null,
          playerAction: null,
          actionTargets: [],
          combatPositions: newPositions
        }
      }),

      setTurnPhase: (phase) => set({ combatPhase: phase }),

      getCurrentTurn: () => {
        const { turnOrder, currentTurnIndex } = get()
        return turnOrder[currentTurnIndex]
      },

      // === MOUVEMENT ET POSITIONNEMENT ===

      moveCharacter: (characterId, newPosition) => set((state) => {
        if (!isValidGridPosition(newPosition.x, newPosition.y)) return state

        const isOccupied = isPositionOccupied(
          newPosition.x, 
          newPosition.y, 
          state.combatPositions, 
          state.combatEnemies,
          characterId
        )

        if (isOccupied) return state

        // Vérifier les attaques d'opportunité
        const oldPosition = state.combatPositions[characterId]
        const opportunityAttacks = get().checkOpportunityAttacks(characterId, oldPosition, newPosition)

        // Exécuter les attaques d'opportunité (pour plus tard)
        // TODO: Implémenter l'exécution des attaques d'opportunité

        return {
          combatPositions: {
            ...state.combatPositions,
            [characterId]: newPosition
          },
          hasMovedThisTurn: characterId === 'player' ? true : state.hasMovedThisTurn
        }
      }),

      checkOpportunityAttacks: (movingCharacter, fromPosition, toPosition) => {
        const { combatPositions, combatEnemies } = get()
        const attacks = []

        // Vérifier chaque ennemi pour des attaques d'opportunité
        combatEnemies.forEach(enemy => {
          if (enemy.currentHP <= 0) return

          const enemyPosition = combatPositions[enemy.name]
          if (!enemyPosition) return

          const wasInRange = calculateDistance(fromPosition, enemyPosition) <= 1
          const stillInRange = calculateDistance(toPosition, enemyPosition) <= 1

          // Attaque d'opportunité si on était à portée et qu'on n'y est plus
          if (wasInRange && !stillInRange) {
            attacks.push({
              attacker: enemy,
              target: movingCharacter,
              position: enemyPosition
            })
          }
        })

        return attacks
      },

      updateEnemyPosition: (enemyName, position) => set((state) => ({
        combatPositions: {
          ...state.combatPositions,
          [enemyName]: position
        }
      })),

      // === ACTIONS DE COMBAT ===

      setPlayerAction: (action) => set({ playerAction: action }),

      setActionTargets: (targets) => set({ actionTargets: targets }),

      setShowMovementFor: (characterId) => set({ showMovementFor: characterId }),

      setShowTargetingFor: (characterId) => set({ showTargetingFor: characterId }),

      setSelectedAoESquares: (squares) => set({ selectedAoESquares: squares }),

      setAoECenter: (center) => set({ aoeCenter: center }),

      executeAction: () => {
        const { 
          playerAction, 
          actionTargets, 
          turnOrder, 
          currentTurnIndex,
          combatPositions 
        } = get()

        if (!playerAction || actionTargets.length === 0) return

        const currentTurn = turnOrder[currentTurnIndex]
        const attackerPosition = combatPositions[currentTurn.name.toLowerCase()]

        // Exécuter l'action via le service de combat
        const result = CombatEngine.executePlayerAction(
          currentTurn.character,
          playerAction,
          actionTargets,
          attackerPosition
        )

        // Appliquer les résultats
        get().applyActionResults(result)
      },

      applyActionResults: (results) => set((state) => {
        const newState = { ...state }

        // Appliquer les dégâts
        results.damages?.forEach(damage => {
          if (damage.target.type === 'enemy') {
            const enemyIndex = newState.combatEnemies.findIndex(e => e.name === damage.target.name)
            if (enemyIndex !== -1) {
              newState.combatEnemies[enemyIndex] = {
                ...newState.combatEnemies[enemyIndex],
                currentHP: Math.max(0, newState.combatEnemies[enemyIndex].currentHP - damage.amount)
              }
            }
          }
        })

        // Vérifier les conditions de victoire/défaite
        get().checkCombatEnd()

        return newState
      }),

      // === GESTION DES DÉGÂTS ===

      // Fonctions de callback pour les dégâts - seront assignées depuis l'extérieur
      _onPlayerDamage: null,
      _onCompanionDamage: null,

      // Setter pour les callbacks
      setDamageCallbacks: (onPlayerDamage, onCompanionDamage) => set({
        _onPlayerDamage: onPlayerDamage,
        _onCompanionDamage: onCompanionDamage
      }),

      dealDamageToPlayer: (damage) => {
        const { _onPlayerDamage } = get()
        if (_onPlayerDamage) {
          _onPlayerDamage(damage)
        } else {
          console.warn('Player damage callback not set')
        }
      },

      dealDamageToCompanion: (damage) => {
        const { _onCompanionDamage } = get()
        if (_onCompanionDamage) {
          _onCompanionDamage(damage)
        } else {
          console.warn('Companion damage callback not set')
        }
      },

      dealDamageToEnemy: (enemyName, damage) => set((state) => {
        const enemyIndex = state.combatEnemies.findIndex(e => e.name === enemyName)
        if (enemyIndex === -1) return state

        const newEnemies = [...state.combatEnemies]
        newEnemies[enemyIndex] = {
          ...newEnemies[enemyIndex],
          currentHP: Math.max(0, newEnemies[enemyIndex].currentHP - damage)
        }

        return { combatEnemies: newEnemies }
      }),

      // === FIN DE COMBAT ===

      checkCombatEnd: () => {
        const { combatEnemies } = get()
        
        // Vérifier victoire (tous les ennemis morts)
        const aliveEnemies = combatEnemies.filter(enemy => enemy.currentHP > 0)
        if (aliveEnemies.length === 0) {
          get().handleVictory()
          return
        }

        // Vérifier défaite (joueur mort) - sera géré en coordination avec characterStore
        // TODO: Coordination avec characterStore pour vérifier l'état du joueur
      },

      handleVictory: () => {
        const { combatEnemies } = get()
        
        // Calculer l'XP total des ennemis vaincus
        const totalXP = combatEnemies.reduce((total, enemy) => {
          return total + (enemy.xp || 0)
        }, 0)

        set((state) => ({
          victory: true,
          combatPhase: 'end',
          isActive: false,
          totalXpGained: totalXP // Store l'XP pour que d'autres composants puissent l'utiliser
        }))
      },

      handleDefeat: () => set({
        defeated: true,
        combatPhase: 'end',
        isActive: false
      }),

      endCombat: (victory) => set({
        [victory ? 'victory' : 'defeated']: true,
        combatPhase: 'end',
        isActive: false
      }),

      // === IA ET AUTOMATISATION ===

      executeEnemyTurn: (enemyName) => {
        const { combatEnemies, combatPositions, companionCharacter } = get()
        const enemy = combatEnemies.find(e => e.name === enemyName)
        if (!enemy || enemy.currentHP <= 0) return

        const enemyPosition = combatPositions[enemyName]
        if (!enemyPosition) return

        console.log('👹 Executing enemy turn:', enemyName)

        // Récupérer le personnage joueur - on aura besoin de le passer depuis l'extérieur
        // Pour l'instant, on va utiliser une approche simplifiée
        const playerCharacter = null // Sera géré différemment

        // 1. Calculer le mouvement optimal
        const combatState = {
          playerCharacter,
          companionCharacter,
          combatEnemies,
          combatPositions
        }

        const optimalPosition = CombatEngine.calculateOptimalMovement(
          { ...enemy, type: 'enemy' },
          enemyPosition,
          combatState
        )

        if (optimalPosition) {
          console.log(`🏃 ${enemyName} moves to position (${optimalPosition.x}, ${optimalPosition.y})`)
          get().moveCharacter(enemyName, optimalPosition)
        }

        // 2. Calculer et exécuter la meilleure attaque
        const finalPosition = optimalPosition || enemyPosition
        const enemyAttack = enemy.attacks?.[0] || {
          name: "Attaque de base",
          type: "melee",
          range: 1,
          damageDice: "1d6",
          damageBonus: 0
        }

        const targets = CombatEngine.getTargetsInRange(
          { ...enemy, type: 'enemy' },
          finalPosition,
          enemyAttack,
          combatState
        )

        if (targets.length > 0) {
          // Choisir la cible - priorité au joueur, sinon compagnon
          let target = targets.find(t => combatPositions.player && 
            t.position.x === combatPositions.player.x && 
            t.position.y === combatPositions.player.y)
          
          if (!target) {
            target = targets[0] // Prendre le premier disponible (compagnon)
          }
          
          console.log(`⚔️ ${enemyName} attacks ${target.name || 'target'}`)
          
          // 3. Exécuter l'attaque simplifiée
          const damageResult = CombatEngine.calculateDamage(enemyAttack)
          console.log(`💥 ${enemyName} inflige ${damageResult.damage} dégâts à ${target.name}`)
          
          // 4. Appliquer les dégâts selon le type de cible
          const targetPos = combatPositions.player
          const companionPos = combatPositions.companion
          
          if (targetPos && target.position.x === targetPos.x && target.position.y === targetPos.y) {
            // Cible = joueur
            get().dealDamageToPlayer(damageResult.damage)
          } else if (companionPos && target.position.x === companionPos.x && target.position.y === companionPos.y) {
            // Cible = compagnon
            get().dealDamageToCompanion(damageResult.damage)
          }
        } else {
          console.log(`🤷 ${enemyName} has no targets in range`)
        }
      },

      executeCompanionTurn: () => {
        const { companionCharacter, combatPositions, combatEnemies } = get()
        if (!companionCharacter || companionCharacter.currentHP <= 0) return

        const companionPosition = combatPositions.companion
        if (!companionPosition) return

        console.log('🤝 Executing companion turn:', companionCharacter.name)

        // 1. Calculer le mouvement optimal vers les ennemis
        const combatState = {
          playerCharacter: null, // Le compagnon ne cible pas le joueur
          companionCharacter,
          combatEnemies,
          combatPositions
        }
        
        const optimalPosition = CombatEngine.calculateOptimalMovement(
          { ...companionCharacter, type: 'companion' },
          companionPosition,
          combatState
        )

        if (optimalPosition) {
          console.log(`🏃 ${companionCharacter.name} moves to position (${optimalPosition.x}, ${optimalPosition.y})`)
          get().moveCharacter('companion', optimalPosition)
        }

        // 2. Trouver les cibles à portée d'attaque
        const finalPosition = optimalPosition || companionPosition
        const companionAttack = companionCharacter.attacks?.[0] || {
          name: "Attaque de base",
          type: "melee", 
          range: 1,
          damageDice: "1d6",
          damageBonus: 0
        }

        const targets = CombatEngine.getTargetsInRange(
          { ...companionCharacter, type: 'companion' },
          finalPosition,
          companionAttack,
          combatState
        )

        console.log('🎯 Companion targets found:', targets)

        if (targets.length > 0) {
          // Choisir la cible (ennemi le plus faible ou le plus proche)
          const target = targets.reduce((chosen, current) => {
            if (!chosen) return current
            // Vérifier que les entités ont des PV valides
            const currentHP = current.currentHP ?? 0
            const chosenHP = chosen.currentHP ?? 0
            // Priorité aux ennemis avec moins de PV
            if (currentHP < chosenHP && currentHP > 0) return current
            return chosen
          })
          
          // Vérifier que la cible est valide
          if (!target || !target.name) {
            console.log(`🤷 ${companionCharacter.name} found no valid target`)
            return
          }
          
          console.log(`⚔️ ${companionCharacter.name} attacks ${target.name}`)
          
          // 3. Exécuter l'attaque simplifiée
          const damageResult = CombatEngine.calculateDamage(companionAttack)
          console.log(`💥 ${companionCharacter.name} inflige ${damageResult.damage} dégâts à ${target.name}`)
          
          // 4. Appliquer les dégâts à l'ennemi
          get().dealDamageToEnemy(target.name, damageResult.damage)
        } else {
          console.log(`🤷 ${companionCharacter.name} has no targets in range`)
        }
      },

      // === UTILITAIRES ===

      incrementCombatKey: () => set((state) => ({
        combatKey: state.combatKey + 1
      })),

      getValidMovementSquares: (characterId, movementRange = 6) => {
        const { combatPositions, combatEnemies } = get()
        const currentPos = combatPositions[characterId]
        if (!currentPos) return []

        const validSquares = []

        for (let x = 0; x < GRID_WIDTH; x++) {
          for (let y = 0; y < GRID_HEIGHT; y++) {
            const distance = calculateDistance(currentPos, { x, y })
            
            if (distance <= movementRange && 
                !isPositionOccupied(x, y, combatPositions, combatEnemies, characterId)) {
              validSquares.push({ x, y })
            }
          }
        }

        return validSquares
      },

      getValidTargetSquares: (action, attackerPosition) => {
        const { combatPositions, combatEnemies } = get()
        
        return CombatEngine.getTargetsInRange(
          { type: 'player' }, // Assumons que c'est le joueur pour l'instant
          attackerPosition,
          action,
          { combatPositions, combatEnemies }
        ).map(target => combatPositions[target.name])
      }
    }),
    { name: 'combat-store' }
  )
)

// Sélecteurs optimisés
export const combatSelectors = {
  isInCombat: (state) => state.isActive,
  
  getCurrentPhase: (state) => state.combatPhase,
  
  getCurrentTurnData: (state) => 
    state.turnOrder[state.currentTurnIndex],
  
  isPlayerTurn: (state) => {
    const currentTurn = state.turnOrder[state.currentTurnIndex]
    return currentTurn?.type === 'player'
  },
  
  isCompanionTurn: (state) => {
    const currentTurn = state.turnOrder[state.currentTurnIndex]
    return currentTurn?.type === 'companion'
  },
  
  isEnemyTurn: (state) => {
    const currentTurn = state.turnOrder[state.currentTurnIndex]
    return currentTurn?.type === 'enemy'
  },
  
  getAliveEnemies: (state) => 
    state.combatEnemies.filter(enemy => enemy.currentHP > 0),
  
  getDeadEnemies: (state) =>
    state.combatEnemies.filter(enemy => enemy.currentHP <= 0),
  
  getTurnOrder: (state) => state.turnOrder,
  
  getCombatPositions: (state) => state.combatPositions,
  
  hasMovedThisTurn: (state) => state.hasMovedThisTurn,
  
  canEndTurn: (state) => {
    const currentTurn = state.turnOrder[state.currentTurnIndex]
    if (currentTurn?.type === 'player') {
      return state.playerAction && state.actionTargets.length > 0
    }
    return true // AI turns auto-complete
  },
  
  getCombatResults: (state) => ({
    victory: state.victory,
    defeated: state.defeated,
    isEnded: state.victory || state.defeated
  })
}