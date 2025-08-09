import React, { useEffect } from 'react';

const CombatTurnManager = ({
    combatPhase,
    setCombatPhase,
    turnOrder,
    currentTurnIndex,
    playerCharacter,
    companionCharacter,
    combatEnemies,
    handleNextTurn,
    addCombatMessage,
    setShowMovementFor,
    enemyAttack,
    companionAttack
}) => {
    // Handle turn progression
    useEffect(() => {
        if (combatPhase === 'initializing' || combatPhase === 'initiative-display' || combatPhase === 'end' || !turnOrder.length) {
            return;
        }

        const currentTurnEntity = turnOrder[currentTurnIndex];
        
        if (!currentTurnEntity) {
            return;
        }
        
        const isPlayerTurn = currentTurnEntity.type === 'player';
        const isCompanionTurn = currentTurnEntity.type === 'companion';
        const isEnemyTurn = currentTurnEntity.type === 'enemy';


        let entityInState = null;
        if (isPlayerTurn) {
            entityInState = playerCharacter;
        } else if (isCompanionTurn) {
            entityInState = companionCharacter;
        } else {
            entityInState = combatEnemies.find((e) => e.name === currentTurnEntity.name);
        }


        if (entityInState && entityInState.currentHP <= 0) {
            if (isCompanionTurn) {
                addCombatMessage(`${currentTurnEntity.name} est vaincu et ne peut pas agir.`);
            } else {
                addCombatMessage(`${currentTurnEntity.name} est déjà vaincu. On passe au suivant.`);
            }
            handleNextTurn();
            return;
        }

        if (combatPhase === 'turn') {
            if (isPlayerTurn) {
                if (playerCharacter.currentHP <= 0) {
                    addCombatMessage("Tu es vaincu et ne peux pas agir. Le combat se termine.");
                    setCombatPhase('end');
                    return;
                }
                setCombatPhase('player-movement');
                addCombatMessage("C'est ton tour !");
                setShowMovementFor('player');
            } else if (isCompanionTurn) {
                setCombatPhase('executing-turn');
                addCombatMessage(`C'est le tour de ${currentTurnEntity.name}...`);
                setTimeout(() => {
                    companionAttack();
                }, 400);
            } else if (isEnemyTurn) {
                setCombatPhase('executing-turn');
                addCombatMessage(`C'est le tour de ${currentTurnEntity.name}...`);
                setTimeout(() => {
                    enemyAttack();
                }, 400);
            }
        }
    }, [
        currentTurnIndex,
        combatPhase,
        turnOrder,
        addCombatMessage,
        enemyAttack,
        companionAttack,
        combatEnemies,
        handleNextTurn,
        playerCharacter,
        companionCharacter,
        setCombatPhase,
        setShowMovementFor
    ]);

    return null; // This component doesn't render anything
};

export default CombatTurnManager;