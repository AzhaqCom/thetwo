import React, { useMemo, useCallback } from 'react';
import { spells } from '../../data/spells';

const SpellButton = React.memo(({ spell, onSelectSpell }) => {
  const handleClick = useCallback(() => {
    onSelectSpell(spell);
  }, [spell, onSelectSpell]);

  return (
    <button onClick={handleClick}>
      {spell.name}
      {spell.level > 0 && ` (Niv. ${spell.level})`}
    </button>
  );
});

const PlayerTurnPanel = ({ 
  playerCharacter, 
  onSelectSpell, 
  onPassTurn, 
  selectedSpell, 
  selectedTargets = [] 
}) => {
  const offensiveSpells = useMemo(() => {
    const allSpells = [
      ...playerCharacter.spellcasting.cantrips,
      ...playerCharacter.spellcasting.preparedSpells
    ];
    
    return allSpells
      .map(spellName => spells[spellName])
      .filter(spell => spell && spell.damage);
  }, [playerCharacter.spellcasting]);

  const handleCancelSpell = useCallback(() => {
    onSelectSpell(null);
  }, [onSelectSpell]);

  // If a spell is selected, show target selection UI
  if (selectedSpell) {
    const maxTargets = selectedSpell.projectiles || 1;

    return (
      <div>
        <p>
          {maxTargets > 1
            ? `Choisis les ${maxTargets} cibles de ton sort (tu peux sélectionner plusieurs fois la même créature).`
            : `Choisis une cible pour ton sort.`}
        </p>
        <p>(Cibles sélectionnées : {selectedTargets.length}/{maxTargets})</p>
        <button onClick={handleCancelSpell}>Annuler le sort</button>
      </div>
    );
  }

  // Show spell selection
  return (
    <div>
      <p>C'est ton tour ! Quel sort veux-tu lancer ?</p>
      {offensiveSpells.map(spell => (
        <SpellButton 
          key={spell.name} 
          spell={spell} 
          onSelectSpell={onSelectSpell} 
        />
      ))}
      <button onClick={onPassTurn}>Passer le tour</button>
    </div>
  );
};

export default React.memo(PlayerTurnPanel);