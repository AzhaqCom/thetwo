import React, { useMemo } from 'react';
import { getModifier } from '../utils/utils';
import { spells } from '../../data/spells';
import { SpellSlots } from './SpellSlots';
import { SpellList } from './SpellList';

const SpellcastingPanel = ({ character, onCastSpell, onPrepareSpell }) => {
  const spellStats = useMemo(() => ({
    attackModifier: getModifier(character.stats[character.spellcasting.ability]) + character.proficiencyBonus,
    saveDC: 8 + getModifier(character.stats[character.spellcasting.ability]) + character.proficiencyBonus
  }), [character]);

  const { knownSpells, preparedSpells } = useMemo(() => {
    const prepared = character.spellcasting.preparedSpells || [];
    const known = character.spellcasting.knownSpells || [];
    
    return {
      knownSpells: known.filter(spellName => !prepared.includes(spellName)),
      preparedSpells: prepared
    };
  }, [character.spellcasting]);

  return (
    <div className="spellcasting">
      <h4 className="text-xl font-bold mb-4">Sorts de Magicien</h4>
      
      <SpellSlots spellSlots={character.spellcasting.spellSlots} />
      
      <SpellList
        title="Grimoire"
        spells={knownSpells}
        character={character}
        onPrepareSpell={onPrepareSpell}
        showPrepareButton={true}
      />
      
      <SpellList
        title="Sorts Préparés"
        spells={preparedSpells}
        character={character}
        onCastSpell={onCastSpell}
        showCastButton={true}
      />
    </div>
  );
};

export default React.memo(SpellcastingPanel);