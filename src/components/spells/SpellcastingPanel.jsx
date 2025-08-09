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

  const { knownSpells, preparedSpells, cantrips, maxPreparedSpells } = useMemo(() => {
    const prepared = character.spellcasting.preparedSpells || [];
    const known = character.spellcasting.knownSpells || [];
    const cantrips = character.spellcasting.cantrips || [];
    
    // Calculate max prepared spells
    const intModifier = getModifier(character.stats.intelligence);
    const maxPrepared = intModifier + character.level;
    
    return {
      // Filter out cantrips from known spells and exclude already prepared spells
      knownSpells: known.filter(spellName => {
        const spell = spells[spellName];
        return spell && spell.level > 0 && !prepared.includes(spellName);
      }),
      preparedSpells: prepared,
      cantrips: cantrips,
      maxPreparedSpells: maxPrepared
    };
  }, [character.spellcasting, character.stats.intelligence, character.level]);

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
        title={`Sorts Préparés (${preparedSpells.length}/${maxPreparedSpells})`}
        spells={preparedSpells}
        character={character}
        onCastSpell={onCastSpell}
        showCastButton={true}
      />
    </div>
  );
};

export default React.memo(SpellcastingPanel);