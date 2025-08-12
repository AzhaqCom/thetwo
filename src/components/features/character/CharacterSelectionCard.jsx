import React from 'react'
import { Card, CardHeader, CardBody, CardFooter, Button } from '../../ui'
import { getModifier } from '../../../utils/calculations'

/**
 * Carte de sélection de personnage avec preview
 */
export const CharacterSelectionCard = ({
  character,
  isSelected = false,
  onSelect,
  onPreview,
  icon,
  description,
  showStats = true,
  className = ''
}) => {
  const cardClass = [
    'character-selection-card',
    isSelected && 'character-selection-card--selected',
    className
  ].filter(Boolean).join(' ')

  const handleCardClick = (e) => {
    // Éviter de sélectionner si on clique sur un bouton
    if (e.target.closest('button')) return
    onSelect?.(character)
  }

  const getStatColor = (statValue) => {
    if (statValue >= 16) return 'stat--high'
    if (statValue >= 14) return 'stat--good'
    if (statValue >= 12) return 'stat--average'
    return 'stat--low'
  }

  const primaryStats = [
    { name: 'Force', value: character.stats.force, short: 'FOR' },
    { name: 'Dextérité', value: character.stats.dexterite, short: 'DEX' },
    { name: 'Constitution', value: character.stats.constitution, short: 'CON' },
    { name: 'Intelligence', value: character.stats.intelligence, short: 'INT' },
    { name: 'Sagesse', value: character.stats.sagesse, short: 'SAG' },
    { name: 'Charisme', value: character.stats.charisme, short: 'CHA' }
  ]

  return (
    <Card 
      className={cardClass}
      onClick={handleCardClick}
      variant={isSelected ? 'primary' : 'default'}
    >
      <CardHeader>
        <div className="character-selection-card__header">
          <div className="character-selection-card__icon">
            {icon}
          </div>
          
          <div className="character-selection-card__identity">
            <h3 className="character-selection-card__name">{character.name}</h3>
            <p className="character-selection-card__class">
              {character.race} {character.class}
            </p>
            <p className="character-selection-card__level">
              Niveau {character.level}
            </p>
          </div>

          {isSelected && (
            <div className="character-selection-card__selected-indicator">
              ✓
            </div>
          )}
        </div>
      </CardHeader>

      <CardBody>
        {description && (
          <p className="character-selection-card__description">
            {description}
          </p>
        )}

        {/* Stats principales visibles */}
        <div className="character-selection-card__main-stats">
          <div className="main-stat">
            <span className="main-stat__label">❤️</span>
            <span className="main-stat__value">{character.maxHP} PV</span>
          </div>
          <div className="main-stat">
            <span className="main-stat__label">🛡️</span>
            <span className="main-stat__value">CA {character.ac}</span>
          </div>
        </div>

        {showStats && (
          <div className="character-selection-card__stats">
            <div className="character-selection-card__stats-grid">
              {primaryStats.map(stat => (
                <div 
                  key={stat.short} 
                  className={`character-stat ${getStatColor(stat.value)}`}
                  title={`${stat.name}: ${stat.value} (${getModifier(stat.value) >= 0 ? '+' : ''}${getModifier(stat.value)})`}
                >
                  <span className="character-stat__label">{stat.short}</span>
                  <span className="character-stat__value">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Points forts du personnage */}
        <div className="character-selection-card__highlights">
          {character.class === 'Magicien' && (
            <div className="character-highlight">
              🔮 Sorts puissants
            </div>
          )}
          {character.class === 'Guerrier' && (
            <div className="character-highlight">
              ⚔️ Combat rapproché
            </div>
          )}
          {character.class === 'Roublard' && (
            <div className="character-highlight">
              🎯 Attaques précises
            </div>
          )}
        </div>
      </CardBody>

      <CardFooter>
        <div className="character-selection-card__actions">
          <Button
            variant="ghost"
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              onPreview?.(character)
            }}
          >
            👁️ Détails
          </Button>

          <Button
            variant={isSelected ? 'primary' : 'secondary'}
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              onSelect?.(character)
            }}
          >
            {isSelected ? '✓ Sélectionné' : 'Choisir'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

/**
 * Version compacte pour les listes
 */
export const CompactCharacterSelectionCard = ({ 
  character, 
  isSelected, 
  onSelect,
  showIcon = true 
}) => {
  const cardClass = [
    'character-selection-card',
    'character-selection-card--compact',
    isSelected && 'character-selection-card--selected'
  ].filter(Boolean).join(' ')

  return (
    <Card 
      className={cardClass}
      onClick={() => onSelect?.(character)}
      variant={isSelected ? 'primary' : 'default'}
    >
      <CardBody>
        <div className="character-selection-card__compact-content">
          {showIcon && (
            <span className="character-selection-card__compact-icon">
              {character.class === 'Magicien' ? '🧙‍♂️' : 
               character.class === 'Guerrier' ? '⚔️' : '🗡️'}
            </span>
          )}
          
          <div className="character-selection-card__compact-info">
            <strong>{character.name}</strong>
            <span>{character.class} {character.level}</span>
          </div>

          {isSelected && (
            <span className="character-selection-card__compact-check">✓</span>
          )}
        </div>
      </CardBody>
    </Card>
  )
}

export default CharacterSelectionCard