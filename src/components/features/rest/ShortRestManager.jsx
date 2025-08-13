import React, { useState } from 'react'
import { Card, CardBody, Button, ButtonGroup } from '../../ui'

/**
 * Gestionnaire de repos court avec dépense de dés de vie
 */
export const ShortRestManager = ({
  character,
  restData,
  onSpendHitDie,
  onCompleteRest,
  onCancelRest,
  className = ''
}) => {
  const canSpendHitDie = () => {
    return (
      restData.hitDiceAvailable > 0 &&
      restData.currentHP < restData.maxHP
    )
  }

  const handleSpendHitDie = async () => {
    if (!canSpendHitDie()) return

    try {
      await onSpendHitDie()
    } catch (error) {
      console.error('Erreur lors de la dépense du dé de vie:', error)
    }
  }

  const isFullyHealed = restData.currentHP >= restData.maxHP

  return (
    <Card className={`short-rest-manager ${className}`}>
      <CardBody>
        <div className="short-rest-manager__content">
          {/* En-tête */}
          <div className="short-rest-manager__header">
            <h4>🌅 Repos court en cours</h4>
            <p className="rest-description">
              Prenez une heure pour vous reposer et récupérer des forces. 
              Vous pouvez dépenser des dés de vie pour récupérer des points de vie.
            </p>
          </div>

          {/* État actuel */}
          <div className="short-rest-manager__status">
            <div className="rest-status-grid">
              <div className="rest-status-item">
                <span className="rest-status-label">Points de vie</span>
                <span className="rest-status-value">
                  {restData.currentHP}/{restData.maxHP}
                </span>
              </div>
              
              <div className="rest-status-item">
                <span className="rest-status-label">Dés de vie restants</span>
                <span className="rest-status-value">
                  {restData.hitDiceAvailable} (d{restData.hitDiceType})
                </span>
              </div>
            </div>
          </div>

          {/* Barre de vie visuelle */}
          <div className="short-rest-manager__health-bar">
            <div className="health-bar-container">
              <div 
                className="health-bar-fill"
                style={{ 
                  width: `${(restData.currentHP / restData.maxHP) * 100}%` 
                }}
              />
            </div>
            <span className="health-bar-label">
              PV : {restData.currentHP}/{restData.maxHP}
            </span>
          </div>

          {/* Contrôles de dés de vie */}
          <div className="short-rest-manager__hit-dice">
            <h5>Dés de vie</h5>
            <p className="hit-dice-description">
              Lancez un dé de vie (d{restData.hitDiceType}) et ajoutez votre modificateur de Constitution 
              (+{Math.floor((character.stats.constitution - 10) / 2)}) pour récupérer des points de vie.
            </p>
            
            <div className="hit-dice-controls">
              <Button
                variant="secondary"
                disabled={!canSpendHitDie()}
                onClick={handleSpendHitDie}
              >
                🎲 Dépenser un dé de vie
                {!canSpendHitDie() && (
                  <span className="button-disabled-reason">
                    {restData.hitDiceAvailable === 0 ? ' (aucun restant)' : ' (PV au maximum)'}
                  </span>
                )}
              </Button>
              
              <div className="hit-dice-info">
                <span>Dés restants : {restData.hitDiceAvailable}</span>
              </div>
            </div>
          </div>

          {/* Récapitulatif des bénéfices du repos court */}
          <div className="short-rest-manager__benefits">
            <h5>Autres bénéfices du repos court</h5>
            <ul className="rest-benefits-list">
              {character.class === 'Magicien' && character.level >= 1 && (
                <li>✨ Récupération arcanique disponible</li>
              )}
              {character.class === 'Guerrier' && character.level >= 2 && (
                <li>⚔️ Action Surge récupérée</li>
              )}
              {character.class === 'Ensorceleur' && (
                <li>🔮 Points de sorcellerie récupérés</li>
              )}
              <li>🧘 Récupération mentale et physique</li>
            </ul>
          </div>

          {/* Messages d'état */}
          {isFullyHealed && (
            <div className="rest-message rest-message--success">
              <span className="rest-message-icon">✅</span>
              <span>Vous êtes à pleine santé ! Vous pouvez terminer le repos.</span>
            </div>
          )}
          
          {!isFullyHealed && restData.hitDiceAvailable > 0 && (
            <div className="rest-message rest-message--info">
              <span className="rest-message-icon">💡</span>
              <span>Vous pouvez dépenser d'autres dés de vie ou terminer le repos maintenant.</span>
            </div>
          )}

          {/* Actions */}
          <div className="short-rest-manager__actions">
            <ButtonGroup>
              <Button
                variant="primary"
                onClick={onCompleteRest}
              >
                ✅ Terminer le repos
              </Button>
              
              <Button
                variant="ghost"
                onClick={onCancelRest}
              >
                ❌ Annuler le repos
              </Button>
            </ButtonGroup>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

export default ShortRestManager