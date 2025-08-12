import React from 'react'
import { Card, CardHeader, CardBody, CardFooter, Button } from '../../ui'
import { ActionButton } from '../../ui/ActionButton'

/**
 * Panneau d'actions de combat pour le joueur
 */
export const CombatActionPanel = ({
  playerCharacter,
  selectedAction,
  selectedTargets,
  onSelectAction,
  onExecuteAction,
  onPassTurn,
  canMove = true,
  onMoveToggle
}) => {
  // Actions d'attaque disponibles
  const attackActions = playerCharacter.equipement?.armes?.map(weapon => ({
    id: `attack_${weapon.nom}`,
    type: 'attack',
    name: weapon.nom,
    description: `Attaque avec ${weapon.nom}`,
    damage: weapon.degats,
    range: weapon.portee || 5,
    icon: '⚔️'
  })) || []

  // Actions de sort disponibles (sorts préparés avec emplacements)
  const spellActions = playerCharacter.spells
    ?.filter(spell => spell.prepared && playerCharacter.spellSlots?.[spell.level] > 0)
    ?.map(spell => ({
      id: `spell_${spell.id}`,
      type: 'spell', 
      name: spell.name,
      description: spell.description,
      level: spell.level,
      range: spell.range,
      areaOfEffect: spell.areaOfEffect,
      icon: '🔮'
    })) || []

  const allActions = [...attackActions, ...spellActions]

  const renderActionButton = (action) => (
    <ActionButton
      key={action.id}
      variant={selectedAction?.id === action.id ? 'primary' : 'secondary'}
      onClick={() => onSelectAction(action)}
      disabled={selectedAction && selectedAction.id !== action.id}
    >
      <div className="action-button__content">
        <span className="action-button__icon">{action.icon}</span>
        <div className="action-button__details">
          <span className="action-button__name">{action.name}</span>
          {action.damage && (
            <span className="action-button__damage">Dégâts: {action.damage}</span>
          )}
          {action.level && (
            <span className="action-button__level">Niveau {action.level}</span>
          )}
        </div>
      </div>
    </ActionButton>
  )

  const canExecute = selectedAction && selectedTargets.length > 0
  const maxTargets = selectedAction?.projectiles || 1
  const needsMoreTargets = selectedTargets.length < maxTargets

  return (
    <Card className="combat-action-panel">
      <CardHeader>
        <h3>🎯 Actions de {playerCharacter.name}</h3>
        <div className="combat-action-panel__status">
          {selectedAction && (
            <span className="selected-action">
              {selectedAction.name} sélectionné
              {needsMoreTargets && (
                <span className="target-count">
                  ({selectedTargets.length}/{maxTargets} cibles)
                </span>
              )}
            </span>
          )}
        </div>
      </CardHeader>

      <CardBody>
        {/* Actions de mouvement */}
        {canMove && (
          <div className="combat-action-section">
            <h4>Mouvement</h4>
            <ActionButton
              variant="ghost"
              onClick={onMoveToggle}
              disabled={!!selectedAction}
            >
              <div className="action-button__content">
                <span className="action-button__icon">🏃</span>
                <span className="action-button__name">Se déplacer</span>
              </div>
            </ActionButton>
          </div>
        )}

        {/* Actions d'attaque */}
        {attackActions.length > 0 && (
          <div className="combat-action-section">
            <h4>Attaques</h4>
            <div className="combat-actions-grid">
              {attackActions.map(renderActionButton)}
            </div>
          </div>
        )}

        {/* Actions de sort */}
        {spellActions.length > 0 && (
          <div className="combat-action-section">
            <h4>Sorts</h4>
            <div className="combat-actions-grid">
              {spellActions.map(renderActionButton)}
            </div>
          </div>
        )}

        {/* Instructions */}
        {selectedAction && (
          <div className="combat-action-instructions">
            <p>
              {selectedAction.areaOfEffect
                ? "Cliquez sur une case pour cibler la zone d'effet"
                : needsMoreTargets
                ? `Sélectionnez ${maxTargets - selectedTargets.length} cible(s) supplémentaire(s)`
                : "Cliquez sur 'Exécuter' pour lancer l'action"}
            </p>
          </div>
        )}

        {/* Cibles sélectionnées */}
        {selectedTargets.length > 0 && (
          <div className="combat-selected-targets">
            <h5>Cibles sélectionnées:</h5>
            <ul>
              {selectedTargets.map((target, index) => (
                <li key={index} className="selected-target">
                  {target.name} (PV: {target.currentHP}/{target.maxHP})
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardBody>

      <CardFooter>
        <div className="combat-action-panel__controls">
          {selectedAction && (
            <Button
              variant="ghost"
              onClick={() => onSelectAction(null)}
            >
              Annuler
            </Button>
          )}

          <Button
            variant="primary"
            onClick={onExecuteAction}
            disabled={!canExecute}
          >
            {canExecute ? 'Exécuter' : 'Sélectionner une action'}
          </Button>

          <Button
            variant="secondary"
            onClick={onPassTurn}
          >
            Passer le tour
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

export default CombatActionPanel