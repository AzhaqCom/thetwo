import React, { useCallback } from 'react';

const CombatEndPanel = ({ onContinue, hasWon }) => {
  const handleContinue = useCallback(() => {
    onContinue();
  }, [onContinue]);

  return (
    <div>
      <h3>Combat terminé !</h3>
      {hasWon && (
        <button onClick={handleContinue}>Continuer l'aventure</button>
      )}
    </div>
  );
};

export default React.memo(CombatEndPanel);