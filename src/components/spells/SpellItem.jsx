import React, { useCallback } from 'react';
import { spells } from '../../data/spells';

export const SpellItem = React.memo(({ 
  spellName, 
  character, 
  onPrepareSpell, 
  onCastSpell, 
  showPrepareButton, 
  showCastButton 
}) => {
  const spell = spells[spellName];
  
  if (!spell) return null;

  const isSpellActive = character.activeSpells?.[spellName];
  
  const handlePrepare = useCallback(() => {
    onPrepareSpell?.(spellName);
  }, [onPrepareSpell, spellName]);

  const handleCast = useCallback(() => {
    onCastSpell?.(spellName);
  }, [onCastSpell, spellName]);

  const renderActionButton = () => {
    // For cantrips, always show cast button if showCastButton is true
    if (showCastButton && (spell.level === 0 || spell.castableOutOfCombat)) {
      if (isSpellActive) {
        return (
          <span className="ml-4 px-3 py-1 bg-gray-500 text-white rounded-md shadow-lg">
            Sort actif
          </span>
        );
      }
      return (
        <button
          onClick={handleCast}
          className="ml-4 px-3 py-1 bg-green-600 text-white rounded-md shadow-lg hover:bg-green-700 transition-colors duration-200"
        >
          Lancer
        </button>
      );
    }

    // Only show prepare button for non-cantrips
    if (showPrepareButton && spell.level > 0) {
      return (
        <button
          onClick={handlePrepare}
          className="ml-4 px-3 py-1 bg-blue-600 text-white rounded-md shadow-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Préparer
        </button>
      );
    }

    return null;
  };

  return (
    <li className="text-gray-200 mb-2">
      <div className="flex justify-between items-center">
        <span>
          <strong className="text-white">{spell.name}</strong> 
          ({spell.level > 0 ? `Niv. ${spell.level}` : 'Cantrip'}, {spell.school})
        </span>
        {renderActionButton()}
      </div>
      <p className="text-sm text-gray-400 mt-1">{spell.description}</p>
    </li>
  );
});