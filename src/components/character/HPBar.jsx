import React from 'react';

export const HPBar = ({ currentHP, maxHP }) => {
  const hpPercentage = maxHP > 0 ? Math.max(0, (currentHP / maxHP) * 100) : 0;

  return (
    <div className="stat-block hp-bar-container">
      <div className="hp-text">
        <span>❤️ PV: {currentHP}/{maxHP}</span>
      </div>
      <div className="hp-bar-background">
        <div
          className="hp-bar-fill"
          style={{ width: `${hpPercentage}%` }}
        />
      </div>
    </div>
  );
};