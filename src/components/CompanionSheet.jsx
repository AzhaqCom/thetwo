import React from 'react';

const CompanionSheet = ({ companion }) => {
    if (!companion) {
        return null; // N'affiche rien si il n'y a pas de compagnon
    }

    return (
        <div className="character-sheet">
            <h3>{companion.name}</h3>
            <div className="sheet-row">
                <p>Niveau: {companion.level}</p>
                <p>PV: {companion.currentHP} / {companion.maxHP}</p>
            </div>
            <div className="sheet-row">
                <p>Classe d'Armure: {companion.ac}</p>
                <p>Bonus de Maîtrise: +{companion.proficiencyBonus}</p>
            </div>
            <h4>Statistiques</h4>
            <div className="stats-container">
                {Object.entries(companion.stats).map(([stat, value]) => (
                    <div className="stat-item" key={stat}>
                        <span className="stat-name">{stat.slice(0, 3).toUpperCase()}</span>
                        <span className="stat-value">{value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CompanionSheet;