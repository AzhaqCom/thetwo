import React from 'react';
import { HeartIcon } from '../ui/Icons';

const PlayerCard = ({ character, isCurrentTurn, isSelected }) => {
  const hpPercentage = character.maxHP > 0 
    ? Math.max(0, (character.currentHP / character.maxHP) * 100) 
    : 0;

  return (
    <div className={`character-card player-card ${isCurrentTurn ? 'current-turn' : ''} ${isSelected ? 'selected' : ''}`}>
      <div className="character-name">
        {character.name}
      </div>
      <div className="character-class">
        {character.class}
      </div>
      <div className="character-hp">
        <HeartIcon />
        <span>{Math.max(0, character.currentHP)} PV</span>
      </div>
      <div className="character-hp-bar">
        <div
          className="character-hp-bar-fill"
          style={{ width: `${hpPercentage}%` }}
        />
      </div>
      <div className="character-ac">
        CA: {character.ac}
      </div>
    </div>
  );
};

export default React.memo(PlayerCard);