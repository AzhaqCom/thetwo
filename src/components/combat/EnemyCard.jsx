import React from 'react';
import { HeartIcon } from '../ui/Icons';

const EnemyCard = ({ enemy, isCurrentTurn, isSelected, targetable }) => {
  const hpPercentage = enemy.maxHP > 0 
    ? Math.max(0, (enemy.currentHP / enemy.maxHP) * 100) 
    : 0;

  return (
    <div className={`character-card enemy-card ${isCurrentTurn ? 'current-turn' : ''} ${isSelected ? 'selected' : ''} ${targetable ? 'targetable' : 'not-targetable'}`}>
      {enemy.image && (
        <img
          src={enemy.image}
          alt={enemy.name}
          className="enemy-image-small"
        />
      )}
      <div className="character-name">
        {enemy.name}
      </div>
      <div className="character-hp">
        <HeartIcon />
        <span>{Math.max(0, enemy.currentHP)} PV</span>
      </div>
      <div className="character-hp-bar">
        <div
          className="character-hp-bar-fill"
          style={{ width: `${hpPercentage}%` }}
        />
      </div>
      <div className="character-ac">
        CA: {enemy.ac}
      </div>
    </div>
  );
};

export default React.memo(EnemyCard);