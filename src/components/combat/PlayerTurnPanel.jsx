import React, { useMemo, useCallback } from 'react';
import { getAvailableActions } from '../utils/actionUtils';
import ActionButton from './ActionButton';

const PlayerTurnPanel = ({
  playerCharacter,
  onSelectAction,
  onPassTurn,
  selectedAction,
  selectedTargets = []
}) => {
  const availableActions = useMemo(() => {
    return getAvailableActions(playerCharacter);
  }, [playerCharacter]);

  const spellActions = useMemo(() =>
    availableActions.filter(action => action.actionType === 'spell'),
    [availableActions]
  );

  const weaponActions = useMemo(() =>
    availableActions.filter(action => action.actionType === 'weapon'),
    [availableActions]
  );

  const handleCancelAction = useCallback(() => {
    onSelectAction(null);
  }, [onSelectAction]);

  // If an action is selected, show target selection UI
  if (selectedAction) {
    // For AoE spells, show different message
    if (selectedAction.areaOfEffect) {
      return (
        <div>
          <p>Choisis une zone cible pour ton sort {selectedAction.name}.</p>
          <p>Clique sur n'importe quelle case pour centrer l'effet.</p>
          <button onClick={handleCancelAction}>
            Annuler le sort
          </button>
        </div>
      );
    }

    const maxTargets = selectedAction.projectiles || 1;
    return (
      <div>
        <p>
          {maxTargets > 1
            ? `Choisis les ${maxTargets} cibles de ton ${selectedAction.actionType === 'spell' ? 'sort' : 'attaque'} (tu peux sélectionner plusieurs fois la même créature).`
            : `Choisis une cible pour ton ${selectedAction.actionType === 'spell' ? 'sort' : 'attaque'}.`}
        </p>
        <p>(Cibles sélectionnées : {selectedTargets.length}/{maxTargets})</p>
        <button onClick={handleCancelAction}>
          Annuler {selectedAction.actionType === 'spell' ? 'le sort' : 'l\'attaque'}
        </button>
      </div>
    );
  }

  // Show action selection
  return (
    <div>
      <p>C'est ton tour ! Que veux-tu faire ?</p>
      <div className='flex flex--row  gap20 flex--wrap'>
        {weaponActions.length > 0 && (
          <div className="action-group flex flex--row">
            <h4 className="self-center">Attaques d'Armes</h4>
            {weaponActions.map(action => (
              <ActionButton
                key={action.id}
                action={action}
                onSelectAction={onSelectAction}
              />
            ))}
          </div>
        )}

        {spellActions.length > 0 && (
          <div className="action-group flex flex--row">
            <h4 className="self-center">Sorts</h4>
            {spellActions.map(action => (
              <ActionButton
                key={action.id}
                action={action}
                onSelectAction={onSelectAction}
              />
            ))}
          </div>
        )}

        {availableActions.length === 0 && (
          <p>Aucune action offensive disponible.</p>
        )}

        <button onClick={onPassTurn}>Passer le tour</button>
      </div>
    </div>
  );
};

export default React.memo(PlayerTurnPanel);