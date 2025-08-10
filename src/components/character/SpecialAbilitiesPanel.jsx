import React from 'react';

const SpecialAbilitiesPanel = ({ character }) => {
  if (!character.specialAbilities || Object.keys(character.specialAbilities).length === 0) {
    return null;
  }

  return (
    <div className="special-abilities-panel">
      <h4 className="text-xl font-bold mb-4">Capacités Spéciales</h4>
      
      <div className="abilities-list">
        {Object.entries(character.specialAbilities).map(([key, ability]) => (
          <div key={key} className="ability-item bg-gray-700 p-4 rounded-lg shadow-md mb-4">
            <div className="ability-header">
              <h5 className="text-lg font-semibold text-white mb-2">{ability.name}</h5>
              {ability.level && (
                <span className="text-sm text-gray-400">Niveau {ability.level}</span>
              )}
            </div>
            
            <p className="text-gray-200 mb-2">{ability.description}</p>
            
            {ability.damage && (
              <div className="ability-stats">
                <span className="text-green-400 font-semibold">
                  Dégâts: {ability.damage}
                </span>
              </div>
            )}
            
            {ability.uses && (
              <div className="ability-uses">
                <span className="text-blue-400">
                  Utilisations: {ability.uses.current || 0}/{ability.uses.max}
                </span>
              </div>
            )}
            
            {ability.skills && (
              <div className="ability-skills">
                <span className="text-purple-400">
                  Compétences affectées: {ability.skills.join(', ')}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(SpecialAbilitiesPanel);