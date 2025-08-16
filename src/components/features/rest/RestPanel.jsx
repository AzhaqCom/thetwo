import React, { useState, useMemo } from 'react'
import { useCharacterStore } from '../../../stores/characterStore'
import { useGameStore } from '../../../stores/gameStore'
import { RestService } from '../../../services/RestService'
import { Card, CardHeader, CardBody, Button } from '../../ui'
import { ShortRestManager } from './ShortRestManager'
import { LongRestManager } from './LongRestManager'
import { RestTypeSelector } from './RestTypeSelector'

/**
 * Panneau de gestion des repos avec Zustand
 */
export const RestPanel = ({
  type,
  character,
  onRestComplete,
  onCancel,        // Nouveau prop pour gérer l'annulation depuis l'extérieur
  className = ''
}) => {
  // Stores
  const { 
    playerCharacter,
    shortRestPlayer,
    longRestPlayer,
    spendHitDie
  } = useCharacterStore()
  
  // Use prop character or fallback to playerCharacter from store
  const activeCharacter = character || playerCharacter
  
  const { addCombatMessage, gamePhase, setGamePhase } = useGameStore()
  
  // Services
  const restService = useMemo(() => new RestService(), [])
  
  // État local
  const [restType, setRestType] = useState(type || null) // null, 'short', 'long'
  const [restInProgress, setRestInProgress] = useState(false)

  if (!activeCharacter) {
    return (
      <Card className={`rest-panel ${className}`}>
        <CardBody>
          <div className="rest-panel__no-character">
            <span className="no-character-icon">😴</span>
            <p>Aucun personnage sélectionné pour se reposer</p>
          </div>
        </CardBody>
      </Card>
    )
  }

  // Données de repos
  const restData = useMemo(() => {
    return {
      canTakeShortRest: restService.canTakeShortRest(activeCharacter),
      canTakeLongRest: restService.canTakeLongRest(activeCharacter),
      shortRestBenefits: restService.getShortRestBenefits(activeCharacter),
      longRestBenefits: restService.getLongRestBenefits(activeCharacter),
      hitDiceAvailable: activeCharacter.hitDice || 0,
      hitDiceType: activeCharacter.hitDiceType || 8,
      currentHP: activeCharacter.currentHP || 0,
      maxHP: activeCharacter.maxHP || 0,
      needsRest: activeCharacter.currentHP < activeCharacter.maxHP || 
                 (activeCharacter.spellcasting && restService.hasUsedSpellSlots(activeCharacter))
    }
  }, [activeCharacter, restService])

  // Gestionnaires d'événements
  const handleRestTypeSelect = (type) => {
    setRestType(type)
  }

  const handleStartRest = () => {
    setRestInProgress(true)
    setGamePhase('rest')
    
    addCombatMessage(
      `${activeCharacter.name} commence un ${restType === 'short' ? 'repos court' : 'repos long'}`,
      'rest-start'
    )
  }

  const handleCompleteShortRest = () => {
    try {
      shortRestPlayer()
      addCombatMessage('Repos court terminé !', 'rest-complete')
      setRestInProgress(false)
      setRestType(null)
      onRestComplete?.('short')
    } catch (error) {
      console.error('Erreur lors du repos court:', error)
      addCombatMessage('Erreur lors du repos court', 'error')
    }
  }

  const handleCompleteLongRest = () => {
    try {
      longRestPlayer()
      addCombatMessage('Repos long terminé ! Tous vos points de vie et emplacements de sorts ont été restaurés.', 'rest-complete')
      setRestInProgress(false)
      setRestType(null)
      onRestComplete?.('long')
    } catch (error) {
      console.error('Erreur lors du repos long:', error)
      addCombatMessage('Erreur lors du repos long', 'error')
    }
  }

  const handleSpendHitDie = () => {
    try {
      spendHitDie('player')
      addCombatMessage('Dé de vie dépensé !', 'healing')
    } catch (error) {
      console.error('Erreur lors de la dépense du dé de vie:', error)
      addCombatMessage('Impossible de dépenser le dé de vie', 'error')
    }
  }

  const handleCancelRest = () => {
    setRestInProgress(false)
    setRestType(null)
    setGamePhase('normal')
    addCombatMessage('Repos annulé', 'rest-cancel')
    
    // Appeler le callback externe si fourni
    onCancel?.()
  }

  // Rendu du sélecteur de type de repos (seulement si pas de type forcé)
  if (!restType && !restInProgress) {
    return (
      <Card className={`rest-panel ${className}`}>
        <CardHeader>
          <h3>😴 Choix de repos pour {activeCharacter.name}</h3>
          
          {/* Indicateurs de besoin de repos */}
          <div className="rest-panel__status">
            <div className="rest-status-item">
              <span className="rest-status-label">Points de vie:</span>
              <span className={`rest-status-value ${restData.currentHP < restData.maxHP ? 'rest-status-value--low' : ''}`}>
                {restData.currentHP}/{restData.maxHP}
              </span>
            </div>
            
            <div className="rest-status-item">
              <span className="rest-status-label">Dés de vie:</span>
              <span className="rest-status-value">
                {restData.hitDiceAvailable} disponible{restData.hitDiceAvailable > 1 ? 's' : ''}
              </span>
            </div>
            
            {restData.needsRest && (
              <div className="rest-need-indicator">
                <span className="rest-need-icon">⚠️</span>
                <span>Repos recommandé</span>
              </div>
            )}
          </div>
        </CardHeader>

        <CardBody>
          <RestTypeSelector
            character={activeCharacter}
            restData={restData}
            onSelect={handleRestTypeSelect}
            showBackButton={onCancel ? true : false}  // Bouton retour seulement si onCancel fourni
            onBack={onCancel}
          />
        </CardBody>
      </Card>
    )
  }

  // Rendu du gestionnaire de repos actif
  return (
    <Card className={`rest-panel ${className}`}>
      <CardHeader>
        <h3>
          😴 {restType === 'short' ? 'Repos court' : 'Repos long'} en cours
        </h3>
      </CardHeader>

      <CardBody>
        {restType === 'short' ? (
          <ShortRestManager
            character={activeCharacter}
            restData={restData}
            onSpendHitDie={handleSpendHitDie}
            onCompleteRest={handleCompleteShortRest}
            onCancelRest={onCancel ? handleCancelRest : undefined}  // Annulation seulement si onCancel fourni
          />
        ) : (
          <LongRestManager
            character={activeCharacter}
            restData={restData}
            onCompleteRest={handleCompleteLongRest}
            onCancelRest={onCancel ? handleCancelRest : undefined}  // Annulation seulement si onCancel fourni
          />
        )}
      </CardBody>
    </Card>
  )
}

export default RestPanel