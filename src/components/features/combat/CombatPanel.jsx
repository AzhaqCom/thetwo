import React, { useEffect, useCallback } from 'react'
import { useCombatStore } from '../../../stores/combatStore'
import { useGameStore } from '../../../stores/gameStore'
import { Card, Button } from '../../ui'
import { CombatGrid } from './CombatGrid'
import { CombatTurnManager } from './CombatTurnManager'
import { CombatActionPanel } from './CombatActionPanel'
import { CombatLog } from './CombatLog'

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
    resetCombat
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
      addCombatMessage('Un combat commence !', 'combat-start')
      
      // Démarrer le combat après un délai pour l'initiative
      setTimeout(() => {
        startCombat()
      }, 2000) // 2 secondes pour voir l'initiative
    }
  }, [encounterData, combatKey, isInitialized, playerCharacter, playerCompanion, initializeCombat, startCombat, resetCombat, addCombatMessage])

  // Gestion des actions de combat
  const handleActionSelect = useCallback((action) => {
    selectAction(action)
  }, [selectAction])

  const handleTargetSelect = useCallback((target) => {
    if (!selectedAction) return
    
    selectTarget(target)
    
    // Auto-exécution si assez de cibles
    const maxTargets = selectedAction.projectiles || 1
    const currentTargets = selectedTargets.length + 1
    
    if (currentTargets >= maxTargets) {
      setTimeout(() => {
        handleExecuteAction()
      }, 100)
    }
  }, [selectedAction, selectTarget, selectedTargets.length])

  const handleExecuteAction = useCallback(() => {
    if (!selectedAction || !selectedTargets.length) return
    
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
  }, [selectedAction, selectedTargets, playerCharacter, enemies, addCombatMessage, clearTargets, selectAction, nextTurn])

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

      case 'initiative':
        return (
          <Card>
            <div className="combat-phase-content">
              <h3>Initiative lancée !</h3>
              <p>Les jets d'initiative ont été effectués. Prêt à commencer le combat ?</p>
              <Button onClick={() => setPhase('combat')}>
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
          <Card variant="success">
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
        currentTurn={currentTurn}
        turnOrder={turnOrder}
        enemies={enemies}
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
              // TODO: Implémenter le mouvement
            }}
          />
        </div>

        {/* Panneau latéral */}
        <div className="combat-sidebar">
          {/* Contrôles de phase */}
          <div className="combat-controls">
            {renderPhaseContent()}
          </div>

          {/* Journal de combat */}
          <div className="combat-log-section">
            <CombatLog messages={combatLog} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CombatPanel