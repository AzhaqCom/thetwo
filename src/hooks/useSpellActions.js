import { useCallback } from 'react';
import { spells } from '../data/spells';
import { getModifier } from '../components/utils/utils';

export const useSpellActions = (
    playerCharacter,
    setPlayerCharacter,
    addCombatMessage
) => {
    const handlePlayerCastSpell = useCallback((spell) => {
        // Check if character has spellcasting abilities
        if (!playerCharacter.spellcasting) {
            addCombatMessage(`${playerCharacter.name} ne peut pas lancer de sorts.`, 'info');
            return false;
        }

        if (spell.level > 0) {
            const newSpellSlots = { ...playerCharacter.spellcasting.spellSlots };
            const spellSlots = newSpellSlots[spell.level];

            if (spellSlots && spellSlots.used < spellSlots.total) {
                newSpellSlots[spell.level] = { ...spellSlots, used: spellSlots.used + 1 };
                setPlayerCharacter(prev => ({
                    ...prev,
                    spellcasting: { ...prev.spellcasting, spellSlots: newSpellSlots }
                }));
                return true;
            } else {
                addCombatMessage(`${playerCharacter.name} n'a plus d'emplacement de sort de niveau ${spell.level} disponible.`);
                return false;
            }
        }
        return true;
    }, [playerCharacter, addCombatMessage, setPlayerCharacter]);

    const handleCastSpellOutOfCombat = useCallback((spellName) => {
        // Check spellcasting ability
        if (!playerCharacter.spellcasting) {
            addCombatMessage(`${playerCharacter.name} ne peut pas lancer de sorts.`, 'info');
            return;
        }

        const spell = spells[spellName];

        if (!spell) {
            addCombatMessage(`Sort "${spellName}" introuvable.`, 'error');
            return;
        }

        if (!spell.castableOutOfCombat) {
            addCombatMessage(`${playerCharacter.name} ne peut pas lancer ${spell.name} hors combat.`, 'info');
            return;
        }

        if (spell.level > 0) {
            const spellSlots = playerCharacter.spellcasting.spellSlots[spell.level];
            if (!spellSlots || spellSlots.used >= spellSlots.total) {
                addCombatMessage(`${playerCharacter.name} n'a plus d'emplacement de sort de niveau ${spell.level} disponible pour lancer ${spell.name}.`, 'info');
                return;
            }
        }

        let updatedCharacter = { ...playerCharacter };
        let castSuccess = true;

        switch (spellName) {
            case "Armure du Mage":
                const dexModifier = getModifier(playerCharacter.stats.dexterite);
                updatedCharacter.ac = 13 + dexModifier;
                addCombatMessage(`${playerCharacter.name} a lancé ${spell.name} ! Sa Classe d'Armure est maintenant de ${updatedCharacter.ac}.`, 'upgrade');
                updatedCharacter.activeSpells = { ...updatedCharacter.activeSpells, "Armure du Mage": true };
                break;
            default:
                addCombatMessage(`${playerCharacter.name} a lancé ${spell.name}. (Effet non implémenté hors combat)`, 'spell-cast');
                break;
        }

        if (spell.level > 0 && castSuccess) {
            const newSpellSlots = { ...updatedCharacter.spellcasting.spellSlots };
            newSpellSlots[spell.level] = {
                ...newSpellSlots[spell.level],
                used: newSpellSlots[spell.level].used + 1
            };
            updatedCharacter.spellcasting = {
                ...updatedCharacter.spellcasting,
                spellSlots: newSpellSlots
            };
        }

        setPlayerCharacter(updatedCharacter);
    }, [playerCharacter, addCombatMessage, setPlayerCharacter]);

    const handlePrepareSpell = useCallback((spellName) => {
        // Check spellcasting ability
        if (!playerCharacter.spellcasting) {
            addCombatMessage(`${playerCharacter.name} ne peut pas préparer de sorts.`, 'info');
            return;
        }

        const spell = spells[spellName];
        if (!spell) {
            addCombatMessage(`Sort "${spellName}" introuvable.`, 'error');
            return;
        }

        // Check if it's a cantrip (cantrips don't need to be prepared)
        if (spell.level === 0) {
            addCombatMessage(`Les cantrips n'ont pas besoin d'être préparés.`, 'info');
            return;
        }

        // Calculate maximum prepared spells based on spellcasting ability
        const spellcastingAbility = playerCharacter.spellcasting.ability || 'intelligence';
        const abilityModifier = getModifier(playerCharacter.stats[spellcastingAbility]);
        const maxPreparedSpells = intModifier + playerCharacter.level;
        const currentPreparedCount = playerCharacter.spellcasting.preparedSpells.length;

        // Check if already at maximum
        if (currentPreparedCount >= maxPreparedSpells && !playerCharacter.spellcasting.preparedSpells.includes(spellName)) {
            addCombatMessage(`${playerCharacter.name} ne peut préparer que ${maxPreparedSpells} sorts (${spellcastingAbility} + niveau). Il en a déjà ${currentPreparedCount} préparés.`, 'info');
            return;
        }

        if (!playerCharacter.spellcasting.preparedSpells.includes(spellName)) {
            setPlayerCharacter(prev => ({
                ...prev,
                spellcasting: {
                    ...prev.spellcasting,
                    preparedSpells: [...prev.spellcasting.preparedSpells, spellName]
                }
            }));
            addCombatMessage(`${spell.name} a été ajouté aux sorts préparés de ${playerCharacter.name}. (${currentPreparedCount + 1}/${maxPreparedSpells})`, 'spell');
        } else {
            addCombatMessage(`${spell.name} est déjà préparé.`);
        }
    }, [playerCharacter, addCombatMessage, setPlayerCharacter]);

    const handleUnprepareSpell = useCallback((spellName) => {
        // Check spellcasting ability
        if (!playerCharacter.spellcasting) {
            addCombatMessage(`${playerCharacter.name} ne peut pas retirer de sorts préparés.`, 'info');
            return;
        }

        const spell = spells[spellName];
        if (!spell) {
            addCombatMessage(`Sort "${spellName}" introuvable.`, 'error');
            return;
        }

        if (playerCharacter.spellcasting.preparedSpells.includes(spellName)) {
            setPlayerCharacter(prev => ({
                ...prev,
                spellcasting: {
                    ...prev.spellcasting,
                    preparedSpells: prev.spellcasting.preparedSpells.filter(s => s !== spellName)
                }
            }));
            const spellcastingAbility = playerCharacter.spellcasting.ability || 'intelligence';
            const abilityModifier = getModifier(playerCharacter.stats[spellcastingAbility]);
            const maxPreparedSpells = intModifier + playerCharacter.level;
            const newCount = playerCharacter.spellcasting.preparedSpells.length - 1;
            addCombatMessage(`${spell.name} a été retiré des sorts préparés de ${playerCharacter.name}. (${newCount}/${maxPreparedSpells})`, 'spell');
        } else {
            addCombatMessage(`${spell.name} n'est pas préparé.`);
        }
    }, [playerCharacter, addCombatMessage, setPlayerCharacter]);

    return {
        handlePlayerCastSpell,
        handleCastSpellOutOfCombat,
        handlePrepareSpell,
        handleUnprepareSpell
    };
};