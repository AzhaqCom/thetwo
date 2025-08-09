import React from 'react';
import { getModifier } from '../utils/utils';

const StatItem = React.memo(({ stat, value }) => (
  <div className="stat-item">
    <span className="stat-name">{stat.slice(0, 3).toUpperCase()}</span>
    <span className="stat-value">{value}</span>
  </div>
));

const CompanionSheet = ({ companion }) => {
  if (!companion) {
    return null;
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
          <StatItem key={stat} stat={stat} value={value} />
        ))}
      </div>
    </div>
  );
};

export default React.memo(CompanionSheet);