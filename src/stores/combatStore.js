import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { CombatEngine } from '../services/combatEngine'
import { CombatService } from '../services/CombatService'
import { CharacterManager } from '../services/characterManager'
import { GameLogic } from '../services/gameLogic'
import { CombatEffects } from '../services/combatEffects'
import { EntityAI } from '../services/EntityAI'
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
      // companionCharacter supprimé - utilise activeCompanions[] du characterStore

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

      initializeCombat: (encounterData, playerCharacter, activeCompanions = []) => set((state) => {
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

        // Initiative des compagnons actifs
        if (activeCompanions && activeCompanions.length > 0) {

          activeCompanions.forEach((companion, index) => {
            if (companion && companion.stats && companion.stats.dexterite) {
              const companionInitiative = rollD20WithModifier(getModifier(companion.stats.dexterite))
              initiativeOrder.push({
                type: 'companion',
                name: companion.name,
                id: companion.id,
                initiative: companionInitiative,
                character: companion
              })
            } else {
              console.error(`❌ COMBAT INIT: Compagnon invalide:`, companion)
            }
          })
        } else {
          console.log('⚠️ COMBAT INIT: Aucun compagnon actif');
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
        const positions = get().calculateInitialPositions(
          enemyInstances, 
          activeCompanions,
          encounterData.enemyPositions, 
          encounterData.playerPosition,    // Position personnalisée du joueur
          encounterData.companionPositions // Positions personnalisées des compagnons
        )
        
        // Sauvegarder les positions initiales comme positions de début de tour
        positions.playerStartPos = { ...positions.player }
        
        // Sauvegarder les positions de tous les compagnons
        if (activeCompanions && activeCompanions.length > 0) {
          activeCompanions.forEach(companion => {
            const companionId = companion.id || companion.name.toLowerCase()
            if (positions[companionId]) {
              positions[`${companionId}StartPos`] = { ...positions[companionId] }
            }
          })
        }
        
        // Plus besoin de compatibilité companionStartPos

        return {
          ...state,
          isActive: true,
          isInitialized: true,
          combatPhase: 'initiative-display',
          encounterData,
          combatEnemies: enemyInstances,
          // companionCharacter supprimé - données dans characterStore.activeCompanions
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

      calculateInitialPositions: (enemies, activeCompanions = [], customEnemyPositions = {}, customPlayerPosition = null, customCompanionPositions = null) => {
        const positions = {
          player: customPlayerPosition || { x: 0, y: 5 } // Position personnalisée ou coin bas-gauche par défaut
        }

        // Positions des compagnons actifs
        if (activeCompanions && activeCompanions.length > 0) {
          activeCompanions.forEach((companion, index) => {
            const companionId = companion.id || companion.name.toLowerCase()
            
            // Vérifier s'il y a des positions personnalisées pour ce compagnon
            if (customCompanionPositions && customCompanionPositions[companionId]) {
              positions[companionId] = customCompanionPositions[companionId]
            } else if (customCompanionPositions && Array.isArray(customCompanionPositions) && customCompanionPositions[index]) {
              // Format tableau : [{ x: 2, y: 5 }, { x: 3, y: 5 }]
              positions[companionId] = customCompanionPositions[index]
            } else {
              // Position par défaut : à côté du joueur
              const playerPos = positions.player
              positions[companionId] = { 
                x: playerPos.x + 1 + index, 
                y: playerPos.y - Math.floor(index / 2) // Décaler sur Y si plus de 2 compagnons
              }
            }
          })
          
          // Plus besoin de positions.companion avec le nouveau système
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

        // Positions finales configurées
        return positions
      },

      resetCombat: () => set({
        isActive: false,
        isInitialized: false,
        combatPhase: 'idle',
        encounterData: null,
        combatEnemies: [],
        // companionCharacter supprimé
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
        const maxLoops = state.turnOrder.length // Sécurité pour éviter les boucles infinies
        let loopCount = 0
        
        while (nextIndex !== state.currentTurnIndex && loopCount < maxLoops) {
          const currentTurnData = state.turnOrder[nextIndex]
          let shouldSkip = false
          
          if (currentTurnData.type === 'enemy') {
            const enemy = state.combatEnemies.find(e => e.name === currentTurnData.name)
            if (!enemy || enemy.currentHP <= 0) {
              shouldSkip = true
            }
          } else if (currentTurnData.type === 'companion') {
            // Vérifier si le compagnon est mort via useCharacterStore
            // Pour l'instant, on assume qu'il faut le gérer différemment
            // Le CombatTurnManager gérera cette logique
          }
          
          if (shouldSkip) {
            nextIndex++
            loopCount++
            if (nextIndex >= state.turnOrder.length) {
              nextIndex = 0
              state.turnCounter++
            }
            continue
          }
          break
        }

        // Traiter les effets de début de tour pour le nouveau combattant
        const newCombatant = state.turnOrder[nextIndex]
        let effectMessages = []
        
        if (newCombatant?.type === 'enemy') {
          const enemy = state.combatEnemies.find(e => e.name === newCombatant.name)
          if (enemy) {
            effectMessages = CombatEffects.processStartOfTurnEffects(enemy)
          }
        }
        // TODO: Gérer les effets pour joueur et compagnons

        // Sauvegarder la position de début de tour pour le joueur
        const newPositions = { ...state.combatPositions }
        
        if (newCombatant?.type === 'player') {
          newPositions.playerStartPos = { ...state.combatPositions.player }
        } else if (newCombatant?.type === 'companion') {
          // Sauvegarder la position de début de tour du compagnon par ID
          const companionId = newCombatant.id || newCombatant.name.toLowerCase()
          const companionPos = state.combatPositions[companionId]
          if (companionPos) {
            newPositions[`${companionId}StartPos`] = { ...companionPos }
          }
        }

        // Log des messages d'effets pour debug
        if (effectMessages.length > 0) {
          console.log('Effets de début de tour:', effectMessages)
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
          combatPositions,
          combatEnemies 
        } = get()

        if (!playerAction || actionTargets.length === 0) return

        const currentTurn = turnOrder[currentTurnIndex]
        const attackerPosition = combatPositions[currentTurn.name.toLowerCase()]

        // Exécuter l'action via le service de combat
        const combatService = new CombatService()
        const result = combatService.executePlayerAction(
          currentTurn.character,
          playerAction,
          actionTargets,
          combatEnemies,
          combatPositions
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
      _onCompanionDamageById: null, // Nouveau: callback par ID de compagnon

      // Setter pour les callbacks
      setDamageCallbacks: (onPlayerDamage, onCompanionDamageById) => set({
        _onPlayerDamage: onPlayerDamage,
        _onCompanionDamageById: onCompanionDamageById
      }),

      dealDamageToPlayer: (damage) => {
        const { _onPlayerDamage } = get()
        if (_onPlayerDamage) {
          _onPlayerDamage(damage)
        } else {
          console.warn('Player damage callback not set')
        }
      },

      // OBSOLÈTE: Remplacé par dealDamageToCompanionById
      dealDamageToCompanion: (damage) => {
        console.warn('dealDamageToCompanion is deprecated, use dealDamageToCompanionById')
      },

      dealDamageToCompanionById: (companionId, damage) => {
        const { _onCompanionDamageById } = get()
        if (_onCompanionDamageById) {
          _onCompanionDamageById(companionId, damage)
        } else {
          console.warn('Companion damage by ID callback not set')
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

      executeEnemyTurn: (enemyName, playerCharacter, activeCompanions = []) => {
        const { combatEnemies, combatPositions } = get()
        const enemy = combatEnemies.find(e => e.name === enemyName)
        if (!enemy || enemy.currentHP <= 0) return

        const enemyPosition = combatPositions[enemyName]
        if (!enemyPosition) return

        // 1. Vérifier les effets qui limitent les actions
        const effectModifiers = CombatEffects.calculateEffectModifiers(enemy)
        
        if (effectModifiers.incapacitated) {
          console.log(`${enemyName} est incapacité par des effets et ne peut pas agir`)
          return
        }

        // 2. Utiliser la nouvelle IA unifiée si l'ennemi a un rôle défini
        const combatState = {
          playerCharacter,
          activeCompanions,
          combatEnemies,
          combatPositions
        }

        if (enemy.role && enemy.aiPriority) {
          // Nouveau système d'IA par rôle
          const bestAction = EntityAI.getBestAction(enemy, combatState)
          
          if (bestAction) {
            // Exécuter l'action intelligente
            get().executeEnemyAction(enemy, bestAction, combatState)
          } else {
            console.log(`${enemyName} (${enemy.role}) ne trouve aucune action`)
          }
        } else {
          // Ancienne logique pour ennemis sans rôle défini
          let finalPosition = enemyPosition
          
          if (effectModifiers.canMove && !CombatEffects.hasEffect(enemy, 'restrained')) {
            const optimalPosition = CombatEngine.calculateOptimalMovement(
              { ...enemy, type: 'enemy' },
              enemyPosition,
              combatState
            )

            if (optimalPosition) {
              get().moveCharacter(enemyName, optimalPosition)
              finalPosition = optimalPosition
            }
          } else {
            console.log(`${enemyName} ne peut pas bouger à cause d'effets (${enemy.activeEffects?.map(e => e.name).join(', ') || 'aucun effet visible'})`)
          }

          // Ancienne logique d'attaque basique
          if (!effectModifiers.canAct) {
            console.log(`${enemyName} ne peut pas attaquer à cause d'effets`)
            return
          }

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
            let target = targets.find(t => combatPositions.player && 
              t.position.x === combatPositions.player.x && 
              t.position.y === combatPositions.player.y)
            
            if (!target) {
              target = targets[0]
            }
            
            let damageResult = CombatEngine.calculateDamage(enemyAttack)
            
            if (effectModifiers.attackDisadvantage) {
              console.log(`${enemyName} attaque avec désavantage à cause d'effets`)
              damageResult.damage = Math.floor(damageResult.damage * 0.75)
            }

            const targetPos = combatPositions.player
            
            if (targetPos && target.position.x === targetPos.x && target.position.y === targetPos.y) {
              get().dealDamageToPlayer(damageResult.damage)
            } else {
              const targetCompanion = activeCompanions.find(companion => {
                const companionPos = combatPositions[companion.id]
                return companionPos && companionPos.x === target.position.x && companionPos.y === target.position.y
              })
              
              if (targetCompanion) {
                get().dealDamageToCompanionById(targetCompanion.id, damageResult.damage)
              }
            }
          } else {
            console.log(`${enemyName} n'a aucune cible à portée`)
          }
        }
      },

      /**
       * Exécute une action d'ennemi selon la nouvelle IA
       */
      executeEnemyAction: (enemy, action, combatState) => {
        console.log(`Executing ${action.type} for ${enemy.name}:`, action.description)
        
        switch (action.type) {
          case 'attack':
            // Attaque normale
            if (action.attack && action.target) {
              const damageResult = CombatEngine.calculateDamage(action.attack)
              
              // Identifier le type de cible et appliquer les dégâts
              if (action.target.id === 'player') {
                get().dealDamageToPlayer(damageResult.damage)
              } else if (action.target.id) {
                get().dealDamageToCompanionById(action.target.id, damageResult.damage)
              }
            }
            break
            
          case 'hit_and_run':
            // Tactique spéciale : retraite puis attaque à distance
            // TODO: Implémenter la logique de retraite
            console.log(`${enemy.name} utilise une tactique de harcèlement`)
            if (action.attack && action.targets.length > 0) {
              const target = action.targets[0]
              const damageResult = CombatEngine.calculateDamage(action.attack)
              
              if (target.id === 'player') {
                get().dealDamageToPlayer(damageResult.damage)
              } else if (target.id) {
                get().dealDamageToCompanionById(target.id, damageResult.damage)
              }
            }
            break
            
          case 'charge':
            // Charge vers la cible
            console.log(`${enemy.name} charge ${action.target.name}`)
            // TODO: Implémenter le mouvement de charge
            break
            
          case 'retreat':
            // Retraite tactique
            console.log(`${enemy.name} se replie tactiquement`)
            // TODO: Implémenter la logique de retraite
            break
            
          default:
            console.warn(`Type d'action ennemi inconnu: ${action.type}`)
        }
      },

      // executeCompanionTurn supprimé - les compagnons sont gérés individuellement par executeCompanionTurnById
      
      executeCompanionTurnById: (companionId, companion, activeCompanions, playerCharacter) => {
        const { combatPositions, combatEnemies } = get()
        if (!companion || companion.currentHP <= 0) return

        // Utiliser la nouvelle architecture séparée
        const combatService = new CombatService()
        const gameState = {
          playerCharacter,
          activeCompanions,
          combatEnemies,
          combatPositions
        }

        // Exécuter l'action via le nouveau système d'IA
        const result = combatService.executeCompanionAction(companionId, companion, gameState)

        if (result && result.success) {
          // Appliquer les dégâts aux ennemis
          result.damage?.forEach(dmg => {
            get().dealDamageToEnemy(dmg.targetId, dmg.damage)
          })

          // Appliquer les soins aux alliés
          result.healing?.forEach(heal => {
            if (heal.targetId === 'player') {
              get().dealDamageToPlayer(-heal.amount) // Soin = dégâts négatifs
            } else {
              get().dealDamageToCompanionById(heal.targetId, -heal.amount)
            }
          })

          // Appliquer les effets (pour plus tard)
          // TODO: Implémenter la gestion des effets de combat
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