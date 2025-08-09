import React from 'react';
import { SpellItem } from './SpellItem';

export const SpellList = ({ 
  title, 
  spells, 
  character, 
  onPrepareSpell, 
  onCastSpell, 
  showPrepareButton = false, 
  showCastButton = false 
}) => (
  <>
    <h5 className="text-lg font-semibold mt-6 mb-2">{title}</h5>
    <ul className="list-disc list-inside bg-gray-700 p-4 rounded-lg shadow-md mb-4">
      {spells.map((spellName, index) => (
        <SpellItem
          key={`${spellName}-${index}`}
          spellName={spellName}
          character={character}
          onPrepareSpell={onPrepareSpell}
          onCastSpell={onCastSpell}
          showPrepareButton={showPrepareButton}
          showCastButton={showCastButton}
        />
      ))}
    </ul>
  </>
);