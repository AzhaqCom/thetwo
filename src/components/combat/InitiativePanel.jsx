import React, { useCallback } from 'react';

const InitiativePanel = ({ onStartCombat }) => {
  const handleStartCombat = useCallback(() => {
    onStartCombat();
  }, [onStartCombat]);

  return (
    <div>
      <p>Les jets d'initiative ont été lancés. Clique pour commencer le combat !</p>
      <button onClick={handleStartCombat}>Commencer le combat</button>
    </div>
  );
};

export default React.memo(InitiativePanel);