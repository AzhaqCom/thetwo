import React, { useCallback } from 'react';
import { HeartIcon } from '../ui/Icons';

const EnemyCard = React.memo(({ enemy, index, selected, targetable, onSelectTarget }) => {
  const handleClick = useCallback(() => {
    if (onSelectTarget && targetable) {
      onSelectTarget(enemy);
    }
  }, [onSelectTarget, targetable, enemy]);

  const hpPercentage = enemy.maxHP > 0 
    ? Math.max(0, (enemy.currentHP / enemy.maxHP) * 100) 
    : 0;

  return (
    <div
      className={`enemy-card ${selected ? 'selected' : ''} ${targetable ? 'targetable' : 'not-targetable'}`}
      onClick={handleClick}
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
          style={{ width: `${hpPercentage}%` }}
        />
      </div>
    </div>
  );
});

const EnemyDisplay = ({ combatEnemies = [], onSelectTarget, selectedTargets = [] }) => {
  if (combatEnemies.length === 0) {
    return null;
  }

  const isTargetable = (enemy) => enemy.currentHP > 0;

  return (
    <div className="enemy-display-container">
      {combatEnemies.map((enemy, index) => {
        const selected = selectedTargets.some((t) => t.name === enemy.name);
        const targetable = isTargetable(enemy);

        return (
          <EnemyCard
            key={`${enemy.name}-${index}`}
            enemy={enemy}
            index={index}
            selected={selected}
            targetable={targetable}
            onSelectTarget={onSelectTarget}
          />
        );
      })}
    </div>
  );
};

export default React.memo(EnemyDisplay);