import React from 'react';

const CombatEndPanel = ({ onContinue,hasWon }) => {
    return (
        <div>
            <h3>Combat terminé !</h3>
            {hasWon && (
                <button onClick={onContinue}>Continuer l'aventure</button>
            )}
        </div>
    );
};

export default CombatEndPanel;