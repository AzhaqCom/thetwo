import React from 'react';
import { getModifier } from './utils/utils';
import { spells } from '../data/spells';

const SpellcastingPanel = ({ character, onCastSpell, onPrepareSpell }) => {
    // Calcul du bonus d'attaque des sorts et du DD de sauvegarde
    const getSpellAttackModifier = (stat) => getModifier(character.stats[stat]) + character.proficiencyBonus;
    const getSpellSaveDC = (stat) => 8 + getModifier(character.stats[stat]) + character.proficiencyBonus;


    // Vérifie si un sort est déjà préparé
    const isSpellPrepared = (spellName) => {
        return character.spellcasting.preparedSpells.includes(spellName);
    };

    return (
        <div className="spellcasting">
            <h4 className="text-xl font-bold mb-4">Sorts de Magicien</h4>
            <h5 className="text-lg font-semibold mt-6 mb-2">Emplacements de sorts</h5>
            <ul className="list-disc list-inside bg-gray-700 p-4 rounded-lg shadow-md mb-4">
                {Object.entries(character.spellcasting.spellSlots).map(([level, slots]) => (
                    <li key={level} className="text-gray-200">
                        Niv. {level}: {slots.used}/{slots.total}
                    </li>
                ))}
            </ul>
            <h5 className="text-lg font-semibold mt-6 mb-2">Grimoire</h5>
            <ul className="list-disc list-inside bg-gray-700 p-4 rounded-lg shadow-md mb-4">
                {character.spellcasting.knownSpells
                    .filter(spellName => !isSpellPrepared(spellName)) // Ajout du filtre
                    .map((spellName, index) => {
                        const spell = spells[spellName];
                        if (spell.level > 0) {
                            return (
                                <li key={index} className="text-gray-200 mb-2">
                                    <div className="flex justify-between items-center">
                                        <span>
                                            <strong className="text-white">{spell.name}</strong> ({spell.level > 0 ? `Niv. ${spell.level}` : 'Cantrip'}, {spell.school})
                                        </span>
                                        {!isSpellPrepared(spell.name) && (
                                            <button
                                                onClick={() => onPrepareSpell(spell.name)}
                                                className="ml-4 px-3 py-1 bg-blue-600 text-white rounded-md shadow-lg hover:bg-blue-700 transition-colors duration-200"
                                            >
                                                Préparer
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-400 mt-1">{spell.description}</p>
                                </li>
                            );
                        }
                        return null;
                    })}
            </ul>

            <h5 className="text-lg font-semibold mt-6 mb-2">Sorts Préparés</h5>
            <ul className="list-disc list-inside bg-gray-700 p-4 rounded-lg shadow-md">
                {character.spellcasting.preparedSpells.map((spellName, index) => {
                    const spell = spells[spellName];
                    const isSpellActive = character.activeSpells?.[spellName];
                    if (spell) {
                        return (
                            <li key={index} className="text-gray-200 mb-2">
                                <div className="flex justify-between items-center">
                                    <span>
                                        <strong className="text-white">{spell.name}</strong> ({spell.level > 0 ? `Niv. ${spell.level}` : 'Cantrip'}, {spell.school})
                                    </span>
                                    {spell.castableOutOfCombat && (

                                        isSpellActive ? (
                                            <span className="ml-4 px-3 py-1 bg-gray-500 text-white rounded-md shadow-lg">
                                                Sort actif
                                            </span>
                                        ) : (
                                            <div>
                                                <button
                                                    onClick={() => onCastSpell(spellName)}
                                                    className="ml-4 px-3 py-1 bg-green-600 text-white rounded-md shadow-lg hover:bg-green-700 transition-colors duration-200"
                                                >
                                                    Lancer
                                                </button>
                                                <p className="text-sm text-gray-400 mt-1">{spell.description}</p>
                                            </div>
                                        )
                                    )}
                                </div>

                            </li>
                        );
                    }
                    return null;
                })}
            </ul>
        </div>
    );
};

export default SpellcastingPanel;
