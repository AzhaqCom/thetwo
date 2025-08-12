import { useCallback } from 'react';

export const useRestActions = (
    playerCharacter,
    setPlayerCharacter,
    playerCompanion,
    setPlayerCompanion,
    addCombatMessage,
    setIsShortResting,
    setIsLongResting,
    setNextSceneAfterRest,
    setCurrentScene,
    nextSceneAfterRest
) => {
    const startShortRest = useCallback((nextScene) => {
        addCombatMessage("Tu as commencé un repos court pour te soigner.", 'duration');
        setIsShortResting(true);
        setNextSceneAfterRest(nextScene);
    }, [addCombatMessage, setIsShortResting, setNextSceneAfterRest]);

    const handleSpendHitDie = useCallback(() => {
        if (playerCharacter.hitDice > 0 && playerCharacter.currentHP < playerCharacter.maxHP) {
            const conModifier = Math.floor((playerCharacter.stats.constitution - 10) / 2);
            const rollResult = Math.floor(Math.random() * playerCharacter.hitDiceType) + 1;
            const healedHP = rollResult + conModifier;

            setPlayerCharacter(prev => ({
                ...prev,
                currentHP: Math.min(prev.maxHP, prev.currentHP + healedHP),
                hitDice: prev.hitDice - 1
            }));

            addCombatMessage(`Tu as dépensé un dé de vie (d${playerCharacter.hitDiceType}) et récupères ${healedHP} PV.`, 'heal');
        }
    }, [playerCharacter, addCombatMessage, setPlayerCharacter]);

    const endShortRest = useCallback(() => {
        addCombatMessage("Le repos est terminé.");
        setIsShortResting(false);
        setCurrentScene(nextSceneAfterRest);
        setNextSceneAfterRest(null);
    }, [addCombatMessage, setIsShortResting, setCurrentScene, nextSceneAfterRest, setNextSceneAfterRest]);

    const startLongRest = useCallback((nextScene) => {
        addCombatMessage("Tu as trouvé un endroit sûr et te prépares pour un long repos.", 'duration');
        setIsLongResting(true);
        setNextSceneAfterRest(nextScene);
    }, [addCombatMessage, setIsLongResting, setNextSceneAfterRest]);

    const handleLongRest = useCallback(() => {
        addCombatMessage("Tu te sens revigoré ! Tous tes PV et emplacements de sorts ont été restaurés.", 'heal');
        setPlayerCharacter(prev => {
            const healedCharacter = {
                ...prev,
                currentHP: prev.maxHP,
                hitDice: prev.level,
                spellcasting: {
                    ...prev.spellcasting,
                    spellSlots: Object.fromEntries(
                        Object.entries(prev.spellcasting.spellSlots).map(([level, slots]) => [
                            level,
                            { ...slots, used: 0 }
                        ])
                    )
                }
            };
            return healedCharacter;
        });

        setPlayerCompanion(prev => {
            if (prev) {
                return { ...prev, currentHP: prev.maxHP, hitDice: prev.level };
            }
            return null;
        });

        setIsLongResting(false);
        setCurrentScene(nextSceneAfterRest);
        setNextSceneAfterRest(null);
    }, [addCombatMessage, nextSceneAfterRest, setPlayerCharacter, setPlayerCompanion, setIsLongResting, setCurrentScene, setNextSceneAfterRest]);

    return {
        startShortRest,
        handleSpendHitDie,
        endShortRest,
        startLongRest,
        handleLongRest
    };
};