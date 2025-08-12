import React from 'react';
import { getModifier } from '../utils/utils';

const AbilityScore = React.memo(({ statName, score }) => (
  <div className="ability-score">
    <h4>{statName.slice(0, 3).toUpperCase()}</h4>
    <span>{score}</span>
    <p>Mod: {getModifier(score) >= 0 ? `+${getModifier(score)}` : getModifier(score)}</p>
  </div>
));

export const AbilityScores = ({ stats }) => (
  <div className="abilities">
    {Object.entries(stats).map(([statName, score]) => (
      <AbilityScore 
        key={statName} 
        statName={statName} 
        score={score} 
      />
    ))}
  </div>
);