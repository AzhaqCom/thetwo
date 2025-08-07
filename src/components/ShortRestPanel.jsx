// src/components/ShortRestPanel.jsx

import React from 'react';

const ShortRestPanel = ({ playerCharacter, handleSpendHitDie, onEndRest }) => {
    return (
        <div className="short-rest-panel">
            <h2>Repos court</h2>
            <p>Tu te reposes pendant une heure. Tu as actuellement {playerCharacter.currentHP} / {playerCharacter.maxHP} PV.</p>
            <p>Dés de vie disponibles : {playerCharacter.hitDice} (d{playerCharacter.hitDiceType})</p>
            
            {playerCharacter.hitDice > 0 && playerCharacter.currentHP < playerCharacter.maxHP && (
                <button onClick={handleSpendHitDie}>Dépenser un dé de vie</button>
            )}
            
            <button onClick={onEndRest}>Terminer le repos</button>
        </div>
    );
};

export default ShortRestPanel;