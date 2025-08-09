import React from 'react';
import { HeartIcon } from '../ui/Icons';

const CompanionCard = ({ companion, isCurrentTurn, isSelected }) => {
  const hpPercentage = companion.maxHP > 0 
    ? Math.max(0, (companion.currentHP / companion.maxHP) * 100) 
    : 0;

  return (
    <div className={`character-card companion-card ${isCurrentTurn ? 'current-turn' : ''} ${isSelected ? 'selected' : ''}`}>
      {companion.image && (
        <img
          src={companion.image}
          alt={companion.name}
          className="companion-image-small"
        />
      )}
      <div className="character-name">
        {companion.name}
      </div>
   
      <div className="character-hp">
        <HeartIcon />
        <span>{Math.max(0, companion.currentHP)} PV</span>
      </div>
      <div className="character-hp-bar">
        <div
          className="character-hp-bar-fill"
          style={{ width: `${hpPercentage}%` }}
        />
      </div>
      <div className="character-ac">
        CA: {companion.ac}
      </div>
    </div>
  );
};

export default React.memo(CompanionCard);