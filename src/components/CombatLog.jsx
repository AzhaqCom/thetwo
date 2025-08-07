// src/components/CombatLog.jsx

import React, { useEffect, useRef } from 'react';
import { HeartIcon, SwordIcon, MagicIcon, MissIcon, SkullIcon, DiceIcon ,VictoryIcon} from './Icons';
import './CombatLog.css'; // N'oubliez pas d'importer le fichier CSS

const getIconForType = (type) => {
    switch (type) {
        case 'player-damage': // Dégâts infligés par le joueur
            return <MagicIcon className="magic-icon" />;
        case 'enemy-damage':
            return <SwordIcon className="damage-icon" />;
        case 'victory': 
            return <VictoryIcon className="victory-icon" />;
        case 'heal':
            return <HeartIcon className="heal-icon" />;
        case 'miss':
            return <MissIcon className="miss-icon" />;
        case 'defeat':
            return <SkullIcon className="defeat-icon" />;
        case 'initiative':
            return <DiceIcon />;
        default:
            return null;
    }
};

const CombatLog = ({ logMessages }) => {
    const logRef = useRef(null);

    useEffect(() => {
        if (logRef.current) {
            logRef.current.scrollTop = logRef.current.scrollHeight;
        }
    }, [logMessages]);

    return (
        <div id="combat-log" style={{ display: logMessages.length > 0 ? 'block' : 'none' }}>

            <div id="log-entries" ref={logRef}>
                <strong>Journal :</strong>
                {logMessages.map((entry, index) => (
                    <p key={index} className={entry.type}>
                        {getIconForType(entry.type)}
                        {entry.message}
                    </p>
                ))}
            </div>
        </div>
    );
};

export default CombatLog;