import React, { useCallback } from 'react';

const ActionButton = ({ action, onSelectAction, disabled = false }) => {
  const handleClick = useCallback(() => {
    if (!disabled) {
      onSelectAction(action);
    }
  }, [action, onSelectAction, disabled]);

  const getActionLabel = () => {
    switch (action.actionType) {
      case 'spell':
        return `${action.name}${action.level > 0 ? ` (Niv. ${action.level})` : ''}`;
      case 'weapon':
        return `${action.name} (${action.damage})`;
        case 'ability':
        return `${action.name} (${action.damage})`;
      default:
        return action.name;
    }
  };

  const getActionDescription = () => {
    switch (action.actionType) {
      case 'spell':
        return action.description;
      case 'weapon':
        return `${action.description} Dégâts: ${action.damage} ${action.damageType}`;
      case 'ability':
        return `${action.description} Dégâts: ${action.damage} ${action.damageType}`;
      default:
        return action.description || '';
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`action-button ${action.actionType}-action ${disabled ? 'disabled' : ''}`}
      title={getActionDescription()}
    >
      {getActionLabel()}
    </button>
  );
};

export default React.memo(ActionButton);