import React from 'react';

const CharacterSelectionCard = ({ character, onSelect, isSelected = false }) => {
  const handleClick = () => {
    onSelect(character);
  };

  return (
    <div 
      className={`character-selection-card ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
    >
      <div className="character-portrait">
        <div className="character-avatar">
          {character.class === 'Magicien' && '🧙‍♂️'}
          {character.class === 'Guerrier' && '⚔️'}
          {character.class === 'Roublard' && '🗡️'}
        </div>
      </div>
      
      <div className="character-info">
        <h3>{character.name}</h3>
        <p className="character-class-race">{character.race} {character.class}</p>
        <p className="character-background">{character.historic}</p>
        
        <div className="character-stats-preview">
          <div className="stat-preview">
            <span>❤️ {character.maxHP} PV</span>
          </div>
          <div className="stat-preview">
            <span>🛡️ CA {character.ac}</span>
          </div>
        </div>
        
        <div className="character-specialties">
          {character.class === 'Magicien' && (
            <span className="specialty">🔮 Sorts et Magie</span>
          )}
          {character.class === 'Guerrier' && (
            <span className="specialty">⚔️ Combat et Résistance</span>
          )}
          {character.class === 'Roublard' && (
            <span className="specialty">🎯 Furtivité et Précision</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CharacterSelectionCard;