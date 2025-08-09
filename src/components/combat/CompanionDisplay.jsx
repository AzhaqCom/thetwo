import React from 'react';
import { HeartIcon } from '../ui/Icons';

const CompanionDisplay = ({ companion }) => {
  if (!companion) {
    return null;
  }

  const hpPercentage = companion.maxHP > 0 
    ? Math.max(0, (companion.currentHP / companion.maxHP) * 100) 
    : 0;
  
  return (
    <div className="companion-display-container">
      <div
        className="companion-card"
        title={`${companion.name} - CA: ${companion.ac}`}
      >
        {companion.image && (
          <img
            src={companion.image}
            alt={companion.name}
            className="companion-image"
          />
        )}
        <div className="companion-name-initiative">
          <span className="companion-name">{companion.name}</span>
          <span className="companion-ac">CA: {companion.ac}</span>
        </div>
        <div className="companion-hp">
          <HeartIcon />
          <span>{Math.max(0, companion.currentHP)} PV</span>
        </div>
        <div className="companion-hp-bar">
          <div
            className="companion-hp-bar-fill"
            style={{ width: `${hpPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(CompanionDisplay);