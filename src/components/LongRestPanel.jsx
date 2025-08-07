
import React from 'react';


const LongRestPanel = ({ onRestComplete }) => {
    return (
        <div className="rest-panel">
            <h2>Repos Long</h2>
            <p>Tu te reposes pendant la nuit pour te remettre sur pied. Tous tes points de vie et tes emplacements de sorts seront restaurés.</p>
            <button onClick={onRestComplete}>Terminer le repos</button>
        </div>
    );
};

export default LongRestPanel;