import React, { useCallback } from 'react';

const ShortRestPanel = ({ playerCharacter, handleSpendHitDie, onEndRest }) => {
  const canSpendHitDie = playerCharacter.hitDice > 0 && playerCharacter.currentHP < playerCharacter.maxHP;

  const handleSpendDie = useCallback(() => {
    handleSpendHitDie();
  }, [handleSpendHitDie]);

  const handleEndRest = useCallback(() => {
    onEndRest();
  }, [onEndRest]);

  return (
    <div className="short-rest-panel rest-panel-container">
      <h2>Repos court</h2>
      <p>
        Tu te reposes pendant une heure. Tu as actuellement {playerCharacter.currentHP} / {playerCharacter.maxHP} PV.
      </p>
      <p>
        Dés de vie disponibles : {playerCharacter.hitDice} (d{playerCharacter.hitDiceType})
      </p>
      
      {canSpendHitDie && (
        <button onClick={handleSpendDie}>
          Dépenser un dé de vie
        </button>
      )}
      
      <button onClick={handleEndRest}>
        Terminer le repos
      </button>
    </div>
  );
};

export default React.memo(ShortRestPanel);