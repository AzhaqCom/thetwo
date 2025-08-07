import React from 'react';

const InitiativePanel = ({ onStartCombat }) => {
    return (
        <div>
            <p>Les jets d'initiative ont été lancés. Clique pour commencer le combat !</p>
            <button onClick={onStartCombat}>Commencer le combat</button>
        </div>
    );
};

export default InitiativePanel;