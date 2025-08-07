// src/components/combat/EnemyDisplay.jsx

import React from 'react';
// Importez le composant d'icône créé
import { HeartIcon } from '../Icons';

const EnemyDisplay = ({ combatEnemies, onSelectTarget, selectedTargets }) => {
  if (!combatEnemies || combatEnemies.length === 0) {
    return null;
  }

  const isTargetable = (enemy) => enemy.currentHP > 0;

  return (
    <div className="enemy-display-container">
      {combatEnemies.map((enemy, index) => {
        const selected = selectedTargets.some((t) => t.name === enemy.name);
        const targetable = isTargetable(enemy);

        return (
          <div
            key={`${enemy.name}-${index}`}
            className={`enemy-card ${selected ? 'selected' : ''} ${targetable ? 'targetable' : 'not-targetable'}`}
            onClick={() => {
              if (onSelectTarget && targetable) {
                onSelectTarget(enemy);
              }
            }}
            title={`${enemy.name} - Initiative: ${enemy.initiative}`}
          >
            {enemy.image && (
              <img
                src={enemy.image}
                alt={enemy.name}
                className="enemy-image"
              />
            )}
            <div className="enemy-name-initiative">
              <span className="enemy-name">{enemy.name}</span>
              <span className="enemy-initiative">Init: {enemy.initiative}</span>
            </div>
            <div className="enemy-hp">

              <HeartIcon />
              <span>{Math.max(0, enemy.currentHP)} PV</span>
            </div>
            <div className="enemy-hp-bar">
              <div
                className="enemy-hp-bar-fill"
                style={{
                  width: `${enemy.maxHP > 0 ? Math.max(0, (enemy.currentHP / enemy.maxHP) * 100) : 0}%`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EnemyDisplay;