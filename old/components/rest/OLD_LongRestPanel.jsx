import React, { useCallback } from 'react';

const LongRestPanel = ({ onRestComplete }) => {
  const handleRestComplete = useCallback(() => {
    onRestComplete();
  }, [onRestComplete]);

  return (
    <div className="rest-panel rest-panel-container">
      <h2>Repos Long</h2>
      <p>
        Tu te reposes pendant la nuit pour te remettre sur pied. 
        Tous tes points de vie et tes emplacements de sorts seront restaurés.
      </p>
      <button onClick={handleRestComplete}>
        Terminer le repos
      </button>
    </div>
  );
};

export default React.memo(LongRestPanel);