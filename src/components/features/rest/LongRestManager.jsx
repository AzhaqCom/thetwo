import React, { useState, useEffect } from 'react'
import { Card, CardBody, Button, ButtonGroup } from '../../ui'

/**
 * Gestionnaire de repos long avec récupération complète
 */
export const LongRestManager = ({
  character,
  restData,
  onCompleteRest,
  onCancelRest,
  className = ''
}) => {
  const [restingTime, setRestingTime] = useState(0) // en minutes simulées
  const [canComplete, setCanComplete] = useState(false)

  // Simulation du temps de repos (accéléré pour le jeu)
  useEffect(() => {
    const timer = setInterval(() => {
      setRestingTime(prev => {
        const newTime = prev + 30 // 30 minutes simulées par seconde
        if (newTime >= 480) { // 8 heures = 480 minutes
          setCanComplete(true)
          clearInterval(timer)
          return 480
        }
        return newTime
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Calculer les bénéfices du repos long
  const getBenefits = () => {
    const benefits = []
    
    // Points de vie
    const hpToRecover = restData.maxHP - restData.currentHP
    if (hpToRecover > 0) {
      benefits.push({
        icon: '❤️',
        text: `+${hpToRecover} points de vie (récupération complète)`
      })
    }
    
    // Dés de vie
    const hitDiceToRecover = Math.max(1, Math.floor(character.level / 2))
    const maxHitDice = character.level
    const currentHitDice = restData.hitDiceAvailable
    const actualRecovery = Math.min(hitDiceToRecover, maxHitDice - currentHitDice)
    
    if (actualRecovery > 0) {
      benefits.push({
        icon: '🎲',
        text: `+${actualRecovery} dé${actualRecovery > 1 ? 's' : ''} de vie`
      })
    }
    
    // Emplacements de sorts
    if (character.spellcasting?.spellSlots) {
      const usedSlots = Object.values(character.spellcasting.spellSlots)
        .reduce((total, slot) => total + (slot.used || 0), 0)
      
      if (usedSlots > 0) {
        benefits.push({
          icon: '🔮',
          text: 'Tous les emplacements de sorts récupérés'
        })
      }
    }
    
    // Capacités de classe
    benefits.push({
      icon: '⚡',
      text: 'Toutes les capacités de classe récupérées'
    })
    
    // Capacités spéciales selon la classe
    if (character.class === 'Magicien') {
      benefits.push({
        icon: '📚',
        text: 'Possibilité de changer les sorts préparés'
      })
    }
    
    if (character.class === 'Ensorceleur') {
      benefits.push({
        icon: '✨',
        text: 'Points de sorcellerie récupérés'
      })
    }
    
    if (character.class === 'Moine') {
      benefits.push({
        icon: '🧘',
        text: 'Points de ki récupérés'
      })
    }
    
    return benefits
  }

  const benefits = getBenefits()
  const progressPercentage = (restingTime / 480) * 100
  const hoursRested = Math.floor(restingTime / 60)
  const minutesRested = restingTime % 60

  return (
    <Card className={`long-rest-manager ${className}`}>
      <CardBody>
        <div className="long-rest-manager__content">
          {/* En-tête */}
          <div className="long-rest-manager__header">
            <h4>🌙 Repos long en cours</h4>
            <p className="rest-description">
              Prenez 8 heures pour dormir ou vous reposer paisiblement. 
              Toutes vos capacités seront restaurées.
            </p>
          </div>

          {/* Progression du temps */}
          <div className="long-rest-manager__progress">
            <div className="rest-progress-header">
              <h5>Progression du repos</h5>
              <span className="rest-time">
                {hoursRested}h {minutesRested}min / 8h 00min
              </span>
            </div>
            
            <div className="rest-progress-bar">
              <div 
                className="rest-progress-fill"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            
            <div className="rest-progress-status">
              {!canComplete ? (
                <span className="rest-status-resting">
                  😴 Repos en cours... ({Math.floor(100 - progressPercentage)}% restant)
                </span>
              ) : (
                <span className="rest-status-complete">
                  ✅ Repos terminé ! Vous vous sentez complètement reposé.
                </span>
              )}
            </div>
          </div>

          {/* Aperçu des bénéfices */}
          <div className="long-rest-manager__benefits">
            <h5>Bénéfices du repos long</h5>
            <div className="rest-benefits-grid">
              {benefits.map((benefit, index) => (
                <div 
                  key={index} 
                  className={`rest-benefit-item ${canComplete ? 'rest-benefit-item--available' : ''}`}
                >
                  <span className="rest-benefit-icon">{benefit.icon}</span>
                  <span className="rest-benefit-text">{benefit.text}</span>
                  {canComplete && (
                    <span className="rest-benefit-check">✓</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* État de santé actuel vs futur */}
          <div className="long-rest-manager__health-comparison">
            <div className="health-comparison-grid">
              <div className="health-comparison-item">
                <h6>État actuel</h6>
                <div className="health-stats">
                  <span className="health-stat">
                    ❤️ PV: {restData.currentHP}/{restData.maxHP}
                  </span>
                  <span className="health-stat">
                    🎲 Dés: {restData.hitDiceAvailable}
                  </span>
                </div>
              </div>
              
              <div className="health-comparison-arrow">→</div>
              
              <div className="health-comparison-item">
                <h6>Après le repos</h6>
                <div className="health-stats">
                  <span className="health-stat health-stat--improved">
                    ❤️ PV: {restData.maxHP}/{restData.maxHP}
                  </span>
                  <span className="health-stat health-stat--improved">
                    🎲 Dés: {Math.min(character.level, restData.hitDiceAvailable + Math.max(1, Math.floor(character.level / 2)))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Informations sur le repos long */}
          {!canComplete && (
            <div className="long-rest-manager__info">
              <div className="rest-info-box">
                <h6>💡 Pendant votre repos</h6>
                <ul className="rest-info-list">
                  <li>Votre corps et votre esprit récupèrent naturellement</li>
                  <li>Les blessures guérissent complètement</li>
                  <li>Votre énergie magique se régénère</li>
                  <li>Vos capacités spéciales retrouvent leur pleine puissance</li>
                </ul>
              </div>
            </div>
          )}

          {/* Avertissements */}
          <div className="long-rest-manager__warnings">
            <div className="rest-warning">
              <span className="rest-warning-icon">⚠️</span>
              <span className="rest-warning-text">
                Vous ne pouvez bénéficier que d'un repos long par période de 24 heures.
              </span>
            </div>
            
            {!canComplete && (
              <div className="rest-warning">
                <span className="rest-warning-icon">⏰</span>
                <span className="rest-warning-text">
                  Annuler maintenant vous fera perdre les bénéfices du repos long.
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="long-rest-manager__actions">
            <ButtonGroup>
              <Button
                variant="primary"
                disabled={!canComplete}
                onClick={onCompleteRest}
              >
                {canComplete ? '✅ Terminer le repos' : `⏳ Repos en cours... ${Math.floor(100 - progressPercentage)}%`}
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

export default LongRestManager