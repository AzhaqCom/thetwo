import React, { useMemo } from 'react';
import { weapons } from '../../data/weapons';
import { getModifier } from '../utils/utils';
import { calculateAttackBonus, calculateActionDamage, isWeaponProficient } from '../utils/actionUtils';

const WeaponItem = React.memo(({ weaponId, character }) => {
  const weapon = weapons[weaponId];

  if (!weapon) return null;

  const attackBonus = calculateAttackBonus({ ...weapon, actionType: 'weapon' }, character);
  const damageInfo = calculateActionDamage({ ...weapon, actionType: 'weapon' }, character);
  const isProficient = isWeaponProficient(weapon, character);

  return (
    <li className="text-gray-200 mb-2">
      <div className="flex justify-between items-center">
        <span>
          <strong className="text-white">{weapon.name}</strong>
          ({weapon.damage} {weapon.damageType})
        </span>
        <span className="text-sm text-gray-400">
          +{attackBonus} att, +{damageInfo.bonus} dég
        </span>
      </div>
      <div className="text-sm text-gray-400 mt-1">
        <p>{weapon.description}</p>
        {weapon.properties && (
          <p className="text-xs">
            Propriétés: {weapon.properties.join(', ')}
          </p>
        )}
        {!isProficient && (
          <p className="text-xs text-yellow-400">⚠️ Non maîtrisé</p>
        )}
      </div>
    </li>
  );
});

const WeaponPanel = ({ character }) => {
  // Don't render if character doesn't have weapons
  if (!character.weapons || character.weapons.length === 0) {
    return null;
  }

  const weaponStats = useMemo(() => {
    const primaryStat = character.class === 'Roublard' ? 'dexterite' : 'force';
    const attackModifier = getModifier(character.stats[primaryStat]) + character.proficiencyBonus;

    return {
      attackModifier,
      primaryStat: primaryStat.charAt(0).toUpperCase() + primaryStat.slice(1)
    };
  }, [character]);

  return (
    <div className="weapon-panel">
      <h4 className="text-xl font-bold mb-4">Arsenal</h4>
      <h5 className="text-lg font-semibold mt-6 mb-2">Armes Équipées</h5>
      <ul className="list-disc list-inside bg-gray-700 p-4 rounded-lg shadow-md mb-4">
        {character.weapons.map((weaponId, index) => (
          <WeaponItem
            key={`${weaponId}-${index}`}
            weaponId={weaponId}
            character={character}
          />
        ))}
      </ul>

      {character.specialAbilities && (
        <>
          <h5 className="text-lg font-semibold mt-6 mb-2">Capacités Spéciales</h5>
          <ul className="list-disc list-inside bg-gray-700 p-4 rounded-lg shadow-md mb-4">
            {Object.entries(character.specialAbilities).map(([key, ability]) => (
              <li key={key} className="text-gray-200 mb-2">
                <div className="flex justify-between items-center">
                  <span>
                    <strong className="text-white">{ability.name}</strong>
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-1">{ability.description}</p>
                {ability.damage && (
                  <p className="text-xs text-green-400">Dégâts: {ability.damage}</p>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default React.memo(WeaponPanel);