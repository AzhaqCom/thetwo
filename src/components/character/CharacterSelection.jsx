import React, { useState } from 'react';
import { characterTemplates } from '../../data/characterTemplates';
import CharacterSelectionCard from './CharacterSelectionCard';

const CharacterSelection = ({ onCharacterSelect }) => {
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  const availableCharacters = [
    characterTemplates.wizard,
    characterTemplates.warrior,
    characterTemplates.rogue
  ];

  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character);
  };

  const handleConfirmSelection = () => {
    if (selectedCharacter) {
      onCharacterSelect(selectedCharacter);
    }
  };

  const getCharacterDescription = (character) => {
    switch (character.class) {
      case 'Magicien':
        return "Maître des arcanes, Elarion utilise des sorts puissants pour vaincre ses ennemis. Fragile mais redoutable à distance.";
      case 'Guerrier':
        return "Combattant expérimenté, Gareth excelle au corps-à-corps avec ses armes. Robuste et polyvalent au combat.";
      case 'Roublard':
        return "Experte en furtivité, Lyra frappe avec précision et évite les coups. Agile et mortelle par surprise.";
      default:
        return "";
    }
  };

  return (
    <div className="character-selection-screen">
      <div className="selection-header">
        <h1>Choisis ton Héros</h1>
        <p>Sélectionne le personnage avec lequel tu veux vivre cette aventure épique !</p>
      </div>

      <div className="character-grid">
        {availableCharacters.map((character, index) => (
          <CharacterSelectionCard
            key={`${character.name}-${index}`}
            character={character}
            onSelect={handleCharacterSelect}
            isSelected={selectedCharacter?.name === character.name}
          />
        ))}
      </div>

      {selectedCharacter && (
        <div className="character-details">
          <h3>À propos de {selectedCharacter.name}</h3>
          <p>{getCharacterDescription(selectedCharacter)}</p>
          
          <div className="character-stats-detailed">
            <div className="stats-column">
              <h4>Caractéristiques</h4>
              <ul>
                <li>Force: {selectedCharacter.stats.force}</li>
                <li>Dextérité: {selectedCharacter.stats.dexterite}</li>
                <li>Constitution: {selectedCharacter.stats.constitution}</li>
                <li>Intelligence: {selectedCharacter.stats.intelligence}</li>
                <li>Sagesse: {selectedCharacter.stats.sagesse}</li>
                <li>Charisme: {selectedCharacter.stats.charisme}</li>
              </ul>
            </div>
            
            <div className="equipment-column">
              <h4>Équipement</h4>
              <ul>
                {selectedCharacter.weapons?.map((weapon, idx) => (
                  <li key={idx}>🗡️ {weapon}</li>
                ))}
                {selectedCharacter.spellcasting?.cantrips?.map((spell, idx) => (
                  <li key={idx}>✨ {spell}</li>
                ))}
              </ul>
            </div>
          </div>

          <button 
            className="confirm-selection-btn"
            onClick={handleConfirmSelection}
          >
            Commencer l'Aventure avec {selectedCharacter.name}
          </button>
        </div>
      )}
    </div>
  );
};

export default CharacterSelection;