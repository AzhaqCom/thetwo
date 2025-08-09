import { useCallback } from 'react';
import { spells } from '../data/spells';
import { getModifier } from '../components/utils/utils';

export const useSpellActions = (
    playerCharacter,
    setPlayerCharacter,
    addCombatMessage
) => {
    const handlePlayerCastSpell = useCallback((spell) => {
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
                addCombatMessage(`Tu n'as plus d'emplacement de sort de niveau ${spell.level} disponible.`);
                return false;
            }
        }
        return true;
    }, [playerCharacter, addCombatMessage, setPlayerCharacter]);

    const handleCastSpellOutOfCombat = useCallback((spellName) => {
        const spell = spells[spellName];

        if (!spell) {
            addCombatMessage(`Sort "${spellName}" introuvable.`, 'error');
            return;
        }

        if (!spell.castableOutOfCombat) {
            addCombatMessage(`${spell.name} ne peut pas être lancé hors combat.`, 'info');
            return;
        }

        if (spell.level > 0) {
            const spellSlots = playerCharacter.spellcasting.spellSlots[spell.level];
            if (!spellSlots || spellSlots.used >= spellSlots.total) {
                addCombatMessage(`Tu n'as plus d'emplacement de sort de niveau ${spell.level} disponible pour lancer ${spell.name}.`, 'info');
                return;
            }
        }

        let updatedCharacter = { ...playerCharacter };
        let castSuccess = true;

        switch (spellName) {
            case "Armure du Mage":
                const dexModifier = Math.floor((playerCharacter.stats.dexterite - 10) / 2);
                updatedCharacter.ac = 13 + dexModifier;
                addCombatMessage(`Tu as lancé ${spell.name} ! Ta Classe d'Armure est maintenant de ${updatedCharacter.ac}.`, 'upgrade');
                updatedCharacter.activeSpells = { ...updatedCharacter.activeSpells, "Armure du Mage": true };
                break;
            default:
                addCombatMessage(`${spell.name} a été lancé. (Effet non implémenté hors combat)`, 'spell-cast');
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

        // Calculate maximum prepared spells (Intelligence modifier + wizard level)
        const intModifier = getModifier(playerCharacter.stats.intelligence);
        const maxPreparedSpells = intModifier + playerCharacter.level;
        const currentPreparedCount = playerCharacter.spellcasting.preparedSpells.length;

        // Check if already at maximum
        if (currentPreparedCount >= maxPreparedSpells && !playerCharacter.spellcasting.preparedSpells.includes(spellName)) {
            addCombatMessage(`Tu ne peux préparer que ${maxPreparedSpells} sorts (Intelligence + niveau). Tu en as déjà ${currentPreparedCount} préparés.`, 'info');
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
            addCombatMessage(`${spell.name} a été ajouté à tes sorts préparés. (${currentPreparedCount + 1}/${maxPreparedSpells})`, 'spell');
        } else {
            addCombatMessage(`${spell.name} est déjà préparé.`);
        }
    }, [playerCharacter, addCombatMessage, setPlayerCharacter]);

    const handleUnprepareSpell = useCallback((spellName) => {
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
            const intModifier = getModifier(playerCharacter.stats.intelligence);
            const maxPreparedSpells = intModifier + playerCharacter.level;
            const newCount = playerCharacter.spellcasting.preparedSpells.length - 1;
            addCombatMessage(`${spell.name} a été retiré de tes sorts préparés. (${newCount}/${maxPreparedSpells})`, 'spell');
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