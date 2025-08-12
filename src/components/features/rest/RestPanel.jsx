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
  onRestComplete,
  className = ''
}) => {
  // Stores
  const { 
    selectedCharacter,
    takeShortRest,
    takeLongRest,
    spendHitDie,
    restoreSpellSlot
  } = useCharacterStore()
  
  const { addCombatMessage, gamePhase, setGamePhase } = useGameStore()
  
  // Services
  const restService = useMemo(() => new RestService(), [])
  
  // État local
  const [restType, setRestType] = useState(null) // null, 'short', 'long'
  const [restInProgress, setRestInProgress] = useState(false)

  if (!selectedCharacter) {
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
      canTakeShortRest: restService.canTakeShortRest(selectedCharacter),
      canTakeLongRest: restService.canTakeLongRest(selectedCharacter),
      shortRestBenefits: restService.getShortRestBenefits(selectedCharacter),
      longRestBenefits: restService.getLongRestBenefits(selectedCharacter),
      hitDiceAvailable: selectedCharacter.hitDice || 0,
      hitDiceType: selectedCharacter.hitDiceType || 8,
      currentHP: selectedCharacter.currentHP || 0,
      maxHP: selectedCharacter.maxHP || 0,
      needsRest: selectedCharacter.currentHP < selectedCharacter.maxHP || 
                 (selectedCharacter.spellcasting && restService.hasUsedSpellSlots(selectedCharacter))
    }
  }, [selectedCharacter, restService])

  // Gestionnaires d'événements
  const handleRestTypeSelect = (type) => {
    setRestType(type)
  }

  const handleStartRest = () => {
    setRestInProgress(true)
    setGamePhase('rest')
    
    addCombatMessage(
      `${selectedCharacter.name} commence un ${restType === 'short' ? 'repos court' : 'repos long'}`,
      'rest-start'
    )
  }

  const handleCompleteShortRest = async () => {
    try {
      const result = await takeShortRest()
      
      if (result.success) {
        addCombatMessage('Repos court terminé !', 'rest-complete')
        setRestInProgress(false)
        setRestType(null)
        onRestComplete?.('short')
      } else {
        addCombatMessage(result.message, 'error')
      }
    } catch (error) {
      console.error('Erreur lors du repos court:', error)
      addCombatMessage('Erreur lors du repos court', 'error')
    }
  }

  const handleCompleteLongRest = async () => {
    try {
      const result = await takeLongRest()
      
      if (result.success) {
        addCombatMessage('Repos long terminé ! Tous vos points de vie et emplacements de sorts ont été restaurés.', 'rest-complete')
        setRestInProgress(false)
        setRestType(null)
        onRestComplete?.('long')
      } else {
        addCombatMessage(result.message, 'error')
      }
    } catch (error) {
      console.error('Erreur lors du repos long:', error)
      addCombatMessage('Erreur lors du repos long', 'error')
    }
  }

  const handleSpendHitDie = async () => {
    try {
      const result = await spendHitDie()
      
      if (result.success) {
        addCombatMessage(
          `Dé de vie dépensé ! +${result.healing} PV récupérés.`,
          'healing'
        )
      } else {
        addCombatMessage(result.message, 'error')
      }
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
  }

  // Rendu du sélecteur de type de repos
  if (!restType && !restInProgress) {
    return (
      <Card className={`rest-panel ${className}`}>
        <CardHeader>
          <h3>😴 Repos pour {selectedCharacter.name}</h3>
          
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
            character={selectedCharacter}
            restData={restData}
            onSelect={handleRestTypeSelect}
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
            character={selectedCharacter}
            restData={restData}
            onSpendHitDie={handleSpendHitDie}
            onCompleteRest={handleCompleteShortRest}
            onCancelRest={handleCancelRest}
          />
        ) : (
          <LongRestManager
            character={selectedCharacter}
            restData={restData}
            onCompleteRest={handleCompleteLongRest}
            onCancelRest={handleCancelRest}
          />
        )}
      </CardBody>
    </Card>
  )
}

export default RestPanel