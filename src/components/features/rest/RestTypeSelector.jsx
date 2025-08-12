import React from 'react'
import { Card, Button } from '../../ui'

/**
 * Sélecteur de type de repos
 */
export const RestTypeSelector = ({
  character,
  restData,
  onSelect,
  className = ''
}) => {
  const renderRestOption = (type, title, icon, duration, benefits, canTake = true) => (
    <Card 
      className={`rest-option ${!canTake ? 'rest-option--disabled' : ''}`}
      key={type}
    >
      <div className="rest-option__header">
        <span className="rest-option__icon">{icon}</span>
        <h4 className="rest-option__title">{title}</h4>
        <span className="rest-option__duration">{duration}</span>
      </div>
      
      <div className="rest-option__benefits">
        <h5>Bénéfices :</h5>
        <ul className="rest-benefits-list">
          {benefits.map((benefit, index) => (
            <li key={index} className="rest-benefit">
              {benefit}
            </li>
          ))}
        </ul>
      </div>
      
      <div className="rest-option__actions">
        <Button
          variant="primary"
          disabled={!canTake}
          onClick={() => onSelect(type)}
        >
          {canTake ? `Commencer le ${title.toLowerCase()}` : 'Indisponible'}
        </Button>
      </div>
    </Card>
  )

  // Bénéfices du repos court
  const shortRestBenefits = []
  
  if (restData.hitDiceAvailable > 0 && restData.currentHP < restData.maxHP) {
    shortRestBenefits.push(`Dépenser jusqu'à ${restData.hitDiceAvailable} dé${restData.hitDiceAvailable > 1 ? 's' : ''} de vie pour récupérer des PV`)
  }
  
  if (character.class === 'Magicien' && character.level >= 1) {
    const maxLevel = Math.ceil(character.level / 2)
    shortRestBenefits.push(`Récupération arcanique (1 emplacement ≤ niv. ${maxLevel})`)
  }
  
  if (character.class === 'Guerrier' && character.level >= 2) {
    shortRestBenefits.push('Récupération de l\'Action Surge')
  }
  
  if (character.class === 'Ensorceleur') {
    shortRestBenefits.push('Récupération des points de sorcellerie')
  }

  if (shortRestBenefits.length === 0) {
    shortRestBenefits.push('Moment de récupération et de planification')
  }

  // Bénéfices du repos long
  const longRestBenefits = [
    'Récupération complète des points de vie',
    `Récupération de ${Math.max(1, Math.floor(character.level / 2))} dé${Math.floor(character.level / 2) > 1 ? 's' : ''} de vie`
  ]
  
  if (character.spellcasting) {
    longRestBenefits.push('Récupération de tous les emplacements de sorts')
  }
  
  longRestBenefits.push('Récupération de toutes les capacités de classe')
  
  if (character.class === 'Magicien') {
    longRestBenefits.push('Préparation de nouveaux sorts')
  }

  return (
    <div className={`rest-type-selector ${className}`}>
      <div className="rest-type-selector__intro">
        <p>
          Choisissez le type de repos que vous souhaitez prendre. 
          Un repos permet de récupérer des forces et des capacités.
        </p>
      </div>
      
      <div className="rest-options">
        {renderRestOption(
          'short',
          'Repos court',
          '🌅',
          '1 heure',
          shortRestBenefits,
          restData.canTakeShortRest
        )}
        
        {renderRestOption(
          'long',
          'Repos long',
          '🌙',
          '8 heures',
          longRestBenefits,
          restData.canTakeLongRest
        )}
      </div>
      
      {/* Informations contextuelles */}
      <div className="rest-type-selector__info">
        <div className="rest-info-section">
          <h5>État actuel :</h5>
          <ul>
            <li>
              Points de vie : {restData.currentHP}/{restData.maxHP}
              {restData.currentHP < restData.maxHP && (
                <span className="rest-info-highlight"> (récupération nécessaire)</span>
              )}
            </li>
            <li>
              Dés de vie : {restData.hitDiceAvailable} disponible{restData.hitDiceAvailable > 1 ? 's' : ''} 
              (d{restData.hitDiceType})
            </li>
            {character.spellcasting && (
              <li>
                Emplacements de sorts : 
                {Object.entries(character.spellcasting.spellSlots || {}).some(([, slot]) => slot.used > 0) 
                  ? ' certains utilisés'
                  : ' tous disponibles'
                }
              </li>
            )}
          </ul>
        </div>
        
        <div className="rest-info-section">
          <h5>Conseils :</h5>
          <ul>
            <li>Les repos courts sont idéaux pour une récupération rapide entre les combats</li>
            <li>Les repos longs restaurent toutes vos capacités mais prennent plus de temps</li>
            <li>Vous ne pouvez bénéficier que d'un repos long par période de 24 heures</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default RestTypeSelector