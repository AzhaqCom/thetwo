import React, { useEffect, useCallback } from 'react'
import { useCombatStore } from '../../../stores/combatStore'
import { useGameStore } from '../../../stores/gameStore'
import { CombatService } from '../../../services/CombatService'
import { Card, Button } from '../../ui'
import { CombatGrid } from './CombatGrid'
import { CombatTurnManager } from './CombatTurnManager'
import { CombatActionPanel } from './CombatActionPanel'
import { CombatLog } from '../../ui/CombatLog'

/**
 * Panneau de combat moderne utilisant Zustand
 */
export const CombatPanel = ({
  playerCharacter,
  playerCompanion,
  encounterData,
  onCombatEnd,
  onReplayCombat,
  combatKey
}) => {
  // Stores
  const {
    // État du combat
    combatPhase: phase,
    currentTurnIndex,
    turnOrder,
    combatEnemies: enemies,
    combatPositions: positions,
    playerAction: selectedAction,
    actionTargets: selectedTargets,
    defeated,
    victory,
    isInitialized,

    // Actions
    initializeCombat,
    startCombat,
    setTurnPhase: setPhase,
    nextTurn,
    setPlayerAction: selectAction,
    setActionTargets,
    resetCombat,
    moveCharacter
  } = useCombatStore()

  // Calcul du tour actuel
  const currentTurn = turnOrder[currentTurnIndex]

  // Fonctions pour gérer les cibles
  const clearTargets = () => setActionTargets([])
  const selectTarget = (target) => {
    setActionTargets([...selectedTargets, target])
  }

  const { addCombatMessage, combatLog, clearCombatLog } = useGameStore()

  // Initialisation du combat
  useEffect(() => {
    if (!encounterData || !encounterData.enemies?.length) return

    // Reset pour nouveau combat
    if (combatKey !== undefined) {
      resetCombat()
    }

    // Initialiser le combat
    if (!isInitialized) {
      initializeCombat(encounterData, playerCharacter, playerCompanion)
    }
  }, [encounterData, combatKey, isInitialized, playerCharacter, playerCompanion, initializeCombat, startCombat, resetCombat, addCombatMessage, turnOrder])

  useEffect(() => {
    // On se déclenche UNIQUEMENT quand la phase est la bonne.
    if (phase === 'initiative-display') {
      addCombatMessage('Un combat commence !', 'combat-start');
      turnOrder.forEach(element => {
        const message = `${element.name} a obtenu ${element.initiative} en initiative !`;
        addCombatMessage(message, 'combat-start');
      });
    }
  }, [phase]);

  // Gestion des actions de combat
  const handleActionSelect = useCallback((action) => {
    selectAction(action)
  }, [selectAction])

  const handleTargetSelect = useCallback((target) => {
    if (!selectedAction) return

    // Ajouter la cible à la liste
    const newTargets = [...selectedTargets, target]
    setActionTargets(newTargets)

    // Auto-exécution si assez de cibles
    const maxTargets = selectedAction.projectiles || 1

    if (newTargets.length >= maxTargets) {
      // Exécuter immédiatement avec les nouvelles cibles
      setTimeout(() => {
        const combatService = new CombatService()
        const result = combatService.executePlayerAction(
          playerCharacter,
          selectedAction,
          newTargets,
          enemies,
          positions
        )

        // Appliquer les résultats
        result.messages.forEach(message => addCombatMessage(message.text, message.type))

        // Appliquer les dégâts
        if (result.damage && result.damage.length > 0) {
          result.damage.forEach(damageData => {
            // Trouver la cible et appliquer les dégâts
            const target = enemies.find(e => e.name === damageData.targetId || e.id === damageData.targetId)
            if (target) {
              // Utiliser le store pour appliquer les dégâts
              const { dealDamageToEnemy } = useCombatStore.getState()
              dealDamageToEnemy(target.name, damageData.damage)

              // Message de mort si nécessaire
              setTimeout(() => {
                const updatedEnemy = enemies.find(e => e.name === target.name)
                if (updatedEnemy && updatedEnemy.currentHP <= 0 && target.currentHP > 0) {
                  addCombatMessage(`💀 ${target.name} tombe au combat !`, 'enemy-death')
                }
              }, 100)
            }
          })
        }

        // Passer au tour suivant
        clearTargets()
        selectAction(null)
        nextTurn()
      }, 500) // Petit délai pour que l'utilisateur voie la sélection
    }
  }, [selectedAction, selectedTargets, setActionTargets, playerCharacter, enemies, positions, addCombatMessage, clearTargets, selectAction, nextTurn])

  const handleExecuteAction = useCallback(() => {
    if (!selectedAction || !selectedTargets.length) return

    const combatService = new CombatService()
    const result = combatService.executePlayerAction(
      playerCharacter,
      selectedAction,
      selectedTargets,
      enemies,
      positions
    )

    // Appliquer les résultats
    result.messages.forEach(message => addCombatMessage(message.text, message.type))

    // Passer au tour suivant
    clearTargets()
    selectAction(null)
    nextTurn()
  }, [selectedAction, selectedTargets, playerCharacter, enemies, positions, addCombatMessage, clearTargets, selectAction, nextTurn])

  const handlePassTurn = () => {
    addCombatMessage(`${playerCharacter.name} passe son tour.`)
    clearTargets()
    selectAction(null)
    nextTurn()
  }

  // Rendu conditionnel selon la phase
  const renderPhaseContent = () => {
    switch (phase) {
      case 'initializing':
        return (
          <Card>
            <div className="combat-phase-content">
              <h3>Initialisation du combat...</h3>
              <p>Préparation des combattants et jets d'initiative</p>
            </div>
          </Card>
        )

      case 'initiative-display':
        return (
          <Card>
            <div className="combat-phase-content">
              <h3>Initiative lancée !</h3>
              <p>Les jets d'initiative ont été effectués. Prêt à commencer le combat ?</p>
              <Button onClick={() => startCombat()}>
                Commencer le combat
              </Button>
            </div>
          </Card>
        )

      case 'player-turn':
        return (
          <CombatActionPanel
            playerCharacter={playerCharacter}
            selectedAction={selectedAction}
            selectedTargets={selectedTargets}
            onSelectAction={handleActionSelect}
            onExecuteAction={handleExecuteAction}
            onPassTurn={handlePassTurn}
            canMove={!positions.playerHasMoved}
            onMoveToggle={() => setPhase('player-movement')}
          />
        )

      case 'player-movement':
        return (
          <Card>
            <div className="combat-phase-content">
              <h3>Phase de mouvement</h3>
              <p>Cliquez sur une case pour vous déplacer (maximum 6 cases)</p>
              <Button onClick={() => setPhase('player-turn')}>
                Terminer le mouvement
              </Button>
            </div>
          </Card>
        )

      case 'victory':
        return (
          <Card >
            <div className="combat-phase-content">
              <h3>🎉 Victoire !</h3>
              <p>Tous les ennemis ont été vaincus !</p>
              <Button onClick={() => {
                clearCombatLog()
                onCombatEnd?.(encounterData)
              }}>
                Continuer l'aventure
              </Button>
            </div>
          </Card>
        )

      case 'defeat':
        return (
          <Card variant="danger">
            <div className="combat-phase-content">
              <h3>💀 Défaite</h3>
              <p>Vous avez été vaincu...</p>
              <div className="combat-defeat-actions">
                <Button
                  variant="secondary"
                  onClick={onReplayCombat}
                >
                  Rejouer le combat
                </Button>
              </div>
            </div>
          </Card>
        )

      case 'enemy-turn':
      case 'companion-turn':
      default:
        return (
          <Card>
            <div className="combat-phase-content">
              <h3>Combat en cours</h3>
              <p>Attendez la fin du tour en cours...</p>
            </div>
          </Card>
        )
    }
  }

  if (!isInitialized) {
    return (
      <div className="combat-container">
        <Card>
          <div className="combat-loading">
            <h3>Chargement du combat...</h3>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="combat-container">
      {/* Gestionnaire de tours automatique */}
      <CombatTurnManager
        currentTurn={currentTurnIndex}
        turnOrder={turnOrder}
        phase={phase}
        onPhaseChange={setPhase}
        onNextTurn={nextTurn}
      />

      <div className="combat-layout">
        {/* Grille de combat */}
        <div className="combat-grid-section">
          <CombatGrid
            playerCharacter={playerCharacter}
            playerCompanion={playerCompanion}
            enemies={enemies}
            positions={positions}
            selectedAction={selectedAction}
            selectedTargets={selectedTargets}
            currentTurn={currentTurn}
            phase={phase}
            onTargetSelect={handleTargetSelect}
            onMoveCharacter={(characterId, newPosition) => {
              moveCharacter(characterId, newPosition)
            }}
          />
        </div>

        {/* Panneau latéral */}
        <div className="combat-side-container">
          {/* Contrôles de phase */}
          <div className="combat-controls">
            {renderPhaseContent()}
          </div>

          {/* Journal de combat */}
          <div className="combat-log-section">
            <CombatLog title="Combat" maxEntries={10} showTimestamps={false} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CombatPanel