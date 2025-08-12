import React from 'react'
import { Card, CardHeader, CardBody, HealthBar } from '../../ui'
import { HeartIcon } from '../../ui/Icons'
import { CharacterManager } from '../../../services/characterManager'

/**
 * Affichage compact d'un compagnon avec ses statistiques essentielles
 */
export const CompanionDisplay = ({ 
  companion,
  variant = 'default', // 'default', 'compact', 'detailed'
  className = '',
  showActions = false,
  onAction // Callback pour les actions sur le compagnon
}) => {
  if (!companion) {
    return null
  }

  const displayClass = [
    'companion-display',
    `companion-display--${variant}`,
    className
  ].filter(Boolean).join(' ')

  const hpPercentage = companion.maxHP > 0 
    ? Math.max(0, (companion.currentHP / companion.maxHP) * 100) 
    : 0

  const isAlive = companion.currentHP > 0
  const isHealthy = hpPercentage > 75
  const isWounded = hpPercentage <= 25 && hpPercentage > 0

  return (
    <Card className={displayClass}>
      <CardHeader>
        <h4>Compagnon</h4>
      </CardHeader>
      
      <CardBody>
        <div className="companion-card">
          {companion.image && (
            <div className="companion-image-container">
              <img
                src={companion.image}
                alt={companion.name}
                className="companion-image"
              />
            </div>
          )}
          
          <div className="companion-info">
            <div className="companion-header">
              <span className="companion-name">{companion.name}</span>
              {variant !== 'compact' && (
                <span className="companion-ac">CA: {companion.ac}</span>
              )}
            </div>
            
            <div className="companion-health">
              <div className="companion-hp-display">
                <HeartIcon className={`hp-icon ${!isAlive ? 'hp-icon--dead' : ''}`} />
                <span className={`hp-text ${!isAlive ? 'hp-text--dead' : ''}`}>
                  {Math.max(0, companion.currentHP)} / {companion.maxHP} PV
                </span>
              </div>
              
              <HealthBar 
                current={companion.currentHP}
                max={companion.maxHP}
                size={variant === 'compact' ? 'small' : 'medium'}
                animated
                showPercentage={variant === 'detailed'}
              />
            </div>
            
            {variant === 'detailed' && (
              <div className="companion-details">
                <div className="companion-stats">
                  <span>Initiative: +{CharacterManager.getInitiativeModifier(companion)}</span>
                  <span>Vitesse: {companion.speed || 30} ft</span>
                </div>
                
                {companion.attacks && companion.attacks.length > 0 && (
                  <div className="companion-attacks">
                    <h5>Attaques:</h5>
                    {companion.attacks.map((attack, index) => (
                      <div key={index} className="attack-info">
                        <span className="attack-name">{attack.name}</span>
                        <span className="attack-damage">({attack.damage})</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {showActions && isAlive && (
              <div className="companion-actions">
                <button 
                  className="action-button action-button--heal"
                  onClick={() => onAction?.('heal', companion)}
                  disabled={companion.currentHP >= companion.maxHP}
                >
                  Soigner
                </button>
                <button 
                  className="action-button action-button--rest"
                  onClick={() => onAction?.('rest', companion)}
                >
                  Repos
                </button>
              </div>
            )}
            
            {!isAlive && (
              <div className="companion-status companion-status--dead">
                <span>💀 Inconscient</span>
                {showActions && (
                  <button 
                    className="action-button action-button--revive"
                    onClick={() => onAction?.('revive', companion)}
                  >
                    Ranimer
                  </button>
                )}
              </div>
            )}
            
            {isWounded && isAlive && (
              <div className="companion-status companion-status--wounded">
                <span>⚠️ Gravement blessé</span>
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

/**
 * Version compacte pour les interfaces restreintes
 */
export const CompactCompanionDisplay = ({ companion, ...props }) => (
  <CompanionDisplay 
    companion={companion} 
    variant="compact" 
    {...props} 
  />
)

/**
 * Version détaillée avec plus d'informations
 */
export const DetailedCompanionDisplay = ({ companion, ...props }) => (
  <CompanionDisplay 
    companion={companion} 
    variant="detailed" 
    {...props} 
  />
)

/**
 * Version interactive avec actions possibles
 */
export const InteractiveCompanionDisplay = ({ companion, onAction, ...props }) => (
  <CompanionDisplay 
    companion={companion} 
    showActions={true}
    onAction={onAction}
    {...props} 
  />
)

export default CompanionDisplay