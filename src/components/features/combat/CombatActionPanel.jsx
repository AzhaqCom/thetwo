import React from 'react'
import { Card, CardHeader, CardBody, CardFooter, Button } from '../../ui'
import { ActionButton } from '../../ui/ActionButton'
import { weapons } from '../../../data/weapons'
import { spells } from '../../../data/spells'

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
  const attackActions = (playerCharacter.weapons || [])
    .map(weaponId => weapons[weaponId])
    .filter(weapon => weapon) // Filtrer les armes inexistantes
    .map(weapon => ({
      id: `attack_${weapon.id}`,
      type: 'attack',
      name: weapon.name,
      description: `Attaque avec ${weapon.name}`,
      damage: weapon.damage,
      damageType: weapon.damageType,
      range: weapon.range?.melee || 1,
      stat: weapon.stat,
      icon: weapon.category === 'ranged' ? '🏹' : '⚔️'
    }))

  // Actions de sort disponibles (cantrips et sorts préparés avec emplacements)
  const spellActions = []
  
  if (playerCharacter.spellcasting) {
    // Ajouter les cantrips (niveau 0, utilisables à volonté)
    const cantrips = (playerCharacter.spellcasting.cantrips || []).map(spellName => {
      // Récupérer les données du sort depuis spells.js
      const spellData = spells[spellName] || {}
      
      return {
        id: `cantrip_${spellName}`,
        type: 'spell',
        name: spellName,
        description: `Cantrip: ${spellName}`,
        level: 0,
        range: spellData.range || 60,
        projectiles: spellData.projectiles || 1,
        damage: spellData.damage,
        requiresAttackRoll: spellData.requiresAttackRoll,
        icon: '✨'
      }
    })
    
    // Ajouter les sorts préparés (si l'on a des emplacements)
    const preparedSpells = (playerCharacter.spellcasting.preparedSpells || [])
      .filter(spellName => {
        // Vérifier qu'on a des emplacements de niveau 1 ou plus
        const spellSlots = playerCharacter.spellcasting.spellSlots || {}
        return Object.keys(spellSlots).some(level => {
          const slot = spellSlots[level]
          return level > 0 && slot && slot.used < slot.total
        })
      })
      .map(spellName => {
        // Récupérer les données du sort depuis spells.js
        const spellData = spells[spellName] || {}
        return {
          id: `spell_${spellName}`,
          type: 'spell',
          name: spellName,
          description: `Sort: ${spellName}`,
          level: spellData.level || 1,
          range: spellData.range || 30,
          projectiles: spellData.projectiles || 1,
          damage: spellData.damage,
          requiresAttackRoll: spellData.requiresAttackRoll,
          icon: '🔮'
        }
      })
    
    spellActions.push(...cantrips, ...preparedSpells)
  }

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
            {action.damage?.dice && (
              <span className="action-button__damage">
                Dégâts: {action.damage.dice}
                {action.damage.bonus > 0 && `+${action.damage.bonus}`}
              </span>
            )}
            {action.level > 0 && (
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
                ? `Sélectionnez ${maxTargets - selectedTargets.length} cible(s) pour exécuter l'action`
                : "Action prête à être exécutée"}
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