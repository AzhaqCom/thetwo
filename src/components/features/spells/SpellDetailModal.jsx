import React, { useState } from 'react'
import { Modal, Button, Card, CardHeader, CardBody, CardFooter, ButtonGroup } from '../../ui'

/**
 * Modal de détails d'un sort
 */
export const SpellDetailModal = ({
  spell,
  character,
  spellSlots = {},
  onClose,
  onCast,
  onPrepare,
  onUnprepare
}) => {
  const [selectedCastingLevel, setSelectedCastingLevel] = useState(null)

  if (!spell) return null

  // Obtenir l'icône du sort selon l'école
  const getSpellIcon = () => {
    switch (spell.school) {
      case 'Évocation':
        return '🔥'
      case 'Abjuration':
        return '🛡️'
      case 'Enchantement':
        return '🧠'
      case 'Illusion':
        return '🌟'
      case 'Divination':
        return '👁️'
      case 'Invocation':
        return '👹'
      case 'Nécromancie':
        return '💀'
      case 'Transmutation':
        return '🔄'
      default:
        return '✨'
    }
  }

  // Obtenir la couleur selon le niveau
  const getLevelColor = () => {
    const colors = {
      0: '#9e9e9e',
      1: '#4caf50',
      2: '#2196f3',
      3: '#ff9800',
      4: '#9c27b0',
      5: '#f44336',
      6: '#795548',
      7: '#607d8b',
      8: '#e91e63',
      9: '#ffc107'
    }
    return colors[spell.level] || '#9e9e9e'
  }

  // Vérifier si le sort peut être lancé
  const canBeCast = () => {
    // Les cantrips peuvent toujours être lancés
    if (spell.level === 0) return true
    
    // Vérifier les emplacements disponibles
    for (let level = spell.level; level <= 9; level++) {
      const slot = spellSlots[level]
      if (slot && slot.available > 0) return true
    }
    
    return false
  }

  // Obtenir les niveaux de lancement disponibles
  const getAvailableCastingLevels = () => {
    if (spell.level === 0) return []
    
    const levels = []
    for (let level = spell.level; level <= 9; level++) {
      const slot = spellSlots[level]
      if (slot && slot.available > 0) {
        levels.push(level)
      }
    }
    return levels
  }

  // Calculer l'effet d'upcast
  const getUpcastEffect = (castingLevel) => {
    if (!spell.upcast || castingLevel <= spell.level) return null
    
    const levelDifference = castingLevel - spell.level
    return spell.upcast.replace(/\{level\}/g, levelDifference.toString())
  }

  // Gestionnaires d'événements
  const handleCast = () => {
    const castingLevel = selectedCastingLevel || spell.level
    onCast?.(spell, castingLevel > 0 ? castingLevel : null)
    onClose()
  }

  const availableLevels = getAvailableCastingLevels()
  const isCantrip = spell.level === 0

  return (
    <Modal onClose={onClose} size="large">
      <Card className="spell-detail-modal">
        <CardHeader>
          <div className="spell-detail-header">
            <div className="spell-detail-icon-container">
              <span 
                className="spell-detail-icon"
                style={{ color: getLevelColor() }}
              >
                {getSpellIcon()}
              </span>
            </div>
            
            <div className="spell-detail-title">
              <h2 className="spell-detail-name">{spell.name}</h2>
              <div className="spell-detail-meta">
                <span 
                  className="spell-detail-level"
                  style={{ color: getLevelColor() }}
                >
                  {isCantrip ? 'Tour de magie' : `Sort de niveau ${spell.level}`}
                </span>
                <span className="spell-detail-school">{spell.school}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardBody>
          {/* Description */}
          <div className="spell-detail-section">
            <h4>Description</h4>
            <p className="spell-detail-description">{spell.description}</p>
          </div>

          {/* Propriétés de lancement */}
          <div className="spell-detail-section">
            <h4>Lancement</h4>
            <div className="spell-detail-casting-properties">
              <div className="spell-casting-property">
                <span className="property-icon">⏱️</span>
                <span className="property-label">Temps d'incantation:</span>
                <span className="property-value">{spell.castingTime || 'Action'}</span>
              </div>
              
              <div className="spell-casting-property">
                <span className="property-icon">📏</span>
                <span className="property-label">Portée:</span>
                <span className="property-value">{spell.range || 'Personnel'}</span>
              </div>
              
              <div className="spell-casting-property">
                <span className="property-icon">🧪</span>
                <span className="property-label">Composants:</span>
                <span className="property-value">
                  {spell.components ? spell.components.join(', ') : 'Aucun'}
                </span>
              </div>
              
              <div className="spell-casting-property">
                <span className="property-icon">⏳</span>
                <span className="property-label">Durée:</span>
                <span className="property-value">{spell.duration || 'Instantané'}</span>
              </div>
              
              {spell.concentration && (
                <div className="spell-casting-property">
                  <span className="property-icon">🧘</span>
                  <span className="property-label">Concentration:</span>
                  <span className="property-value">Oui</span>
                </div>
              )}
              
              {spell.ritual && (
                <div className="spell-casting-property">
                  <span className="property-icon">🕯️</span>
                  <span className="property-label">Rituel:</span>
                  <span className="property-value">Oui</span>
                </div>
              )}
            </div>
          </div>

          {/* Effets de combat */}
          {(spell.damage || spell.healing || spell.effect) && (
            <div className="spell-detail-section">
              <h4>Effets</h4>
              <div className="spell-detail-effects">
                {spell.damage && (
                  <div className="spell-effect">
                    <span className="effect-icon">⚔️</span>
                    <span className="effect-label">Dégâts:</span>
                    <span className="effect-value">{spell.damage}</span>
                  </div>
                )}
                
                {spell.healing && (
                  <div className="spell-effect">
                    <span className="effect-icon">💚</span>
                    <span className="effect-label">Soins:</span>
                    <span className="effect-value">{spell.healing}</span>
                  </div>
                )}
                
                {spell.effect && (
                  <div className="spell-effect">
                    <span className="effect-icon">✨</span>
                    <span className="effect-label">Effet:</span>
                    <span className="effect-value">{spell.effect}</span>
                  </div>
                )}

                {spell.areaOfEffect && (
                  <div className="spell-effect">
                    <span className="effect-icon">💥</span>
                    <span className="effect-label">Zone d'effet:</span>
                    <span className="effect-value">
                      {spell.areaOfEffect.shape} de {spell.areaOfEffect.radius || spell.areaOfEffect.size} 
                      {spell.areaOfEffect.shape === 'sphere' ? ' pieds de rayon' : ' pieds'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Upcast */}
          {spell.upcast && !isCantrip && (
            <div className="spell-detail-section">
              <h4>Aux niveaux supérieurs</h4>
              <p className="spell-detail-upcast">{spell.upcast}</p>
            </div>
          )}

          {/* Options de lancement */}
          {canBeCast() && !isCantrip && availableLevels.length > 1 && (
            <div className="spell-detail-section">
              <h4>Niveau de lancement</h4>
              <div className="spell-casting-levels">
                <ButtonGroup>
                  {availableLevels.map(level => (
                    <Button
                      key={level}
                      variant={selectedCastingLevel === level ? 'primary' : 'secondary'}
                      size="small"
                      onClick={() => setSelectedCastingLevel(level)}
                    >
                      Niveau {level}
                      <span className="level-slots">
                        ({spellSlots[level]?.available} empl.)
                      </span>
                    </Button>
                  ))}
                </ButtonGroup>
                
                {selectedCastingLevel && selectedCastingLevel > spell.level && (
                  <div className="upcast-preview">
                    <h5>Effet au niveau {selectedCastingLevel}:</h5>
                    <p>{getUpcastEffect(selectedCastingLevel)}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Classes qui peuvent apprendre ce sort */}
          {spell.classes && (
            <div className="spell-detail-section">
              <h4>Classes</h4>
              <div className="spell-detail-classes">
                {spell.classes.map(className => (
                  <span key={className} className="spell-class-tag">
                    {className}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardBody>

        <CardFooter>
          <div className="spell-detail-actions">
            <Button
              variant="ghost"
              onClick={onClose}
            >
              Fermer
            </Button>

            {canBeCast() && (
              <Button
                variant="primary"
                onClick={handleCast}
                disabled={!isCantrip && availableLevels.length === 0}
              >
                🔮 Lancer{selectedCastingLevel ? ` (Niv. ${selectedCastingLevel})` : ''}
              </Button>
            )}

            {onPrepare && (
              <Button
                variant="secondary"
                onClick={() => {
                  onPrepare(spell)
                  onClose()
                }}
              >
                📋 Préparer
              </Button>
            )}

            {onUnprepare && (
              <Button
                variant="ghost"
                onClick={() => {
                  onUnprepare(spell)
                  onClose()
                }}
              >
                ❌ Retirer
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </Modal>
  )
}

export default SpellDetailModal