// src/components/combat/PlayerTurnPanel.jsx

import React from 'react';
import { spells } from '../../data/spells';

const PlayerTurnPanel = ({ playerCharacter, onSelectSpell, onPassTurn, selectedSpell, selectedTargets }) => {

    // Si un sort est sélectionné, on demande au joueur de choisir une cible.
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
                <button onClick={() => { onSelectSpell(null); }}>Annuler le sort</button>
            </div>
        );
    }

    // Sinon, on affiche la liste des sorts
    const offensiveSpells = [...playerCharacter.spellcasting.cantrips, ...playerCharacter.spellcasting.preparedSpells]
        .map(spellName => spells[spellName])
        .filter(spell => spell && spell.damage);

    return (
        <div>
            <p>C'est ton tour ! Quel sort veux-tu lancer ?</p>
            {offensiveSpells.map(spell => (
                <button key={spell.name} onClick={() => onSelectSpell(spell)}>
                    {spell.name}
                    {spell.level > 0 && ` (Niv. ${spell.level})`}
                </button>
            ))}
            <button onClick={onPassTurn}>Passer le tour</button>
        </div>
    );
};

export default PlayerTurnPanel;