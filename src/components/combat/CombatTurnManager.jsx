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
    console.log('CombatTurnManager - Phase:', combatPhase, 'Current turn:', currentTurnIndex, 'Turn order length:', turnOrder.length);
    
    // Handle turn progression
    useEffect(() => {
        console.log('CombatTurnManager useEffect - Phase:', combatPhase, 'Turn order:', turnOrder.length);
        
        if (combatPhase === 'initiative-roll' || combatPhase === 'end' || !turnOrder.length) {
            console.log('CombatTurnManager - Skipping, phase:', combatPhase, 'turnOrder length:', turnOrder.length);
            return;
        }

        const currentTurnEntity = turnOrder[currentTurnIndex];
        console.log('CombatTurnManager - Current turn entity:', currentTurnEntity);
        
        if (!currentTurnEntity) {
            console.log('CombatTurnManager - No current turn entity, skipping');
            return;
        }
        
        const isPlayerTurn = currentTurnEntity.type === 'player';
        const isCompanionTurn = currentTurnEntity.type === 'companion';
        const isEnemyTurn = currentTurnEntity.type === 'enemy';

        console.log('CombatTurnManager - Turn types:', { isPlayerTurn, isCompanionTurn, isEnemyTurn });

        let entityInState = null;
        if (isPlayerTurn) {
            entityInState = playerCharacter;
        } else if (isCompanionTurn) {
            entityInState = companionCharacter;
        } else {
            entityInState = combatEnemies.find((e) => e.name === currentTurnEntity.name);
        }

        console.log('CombatTurnManager - Entity in state:', entityInState?.name, 'HP:', entityInState?.currentHP);

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
            console.log('CombatTurnManager - Processing turn for:', currentTurnEntity.name, currentTurnEntity.type);
            
            if (isPlayerTurn) {
                if (playerCharacter.currentHP <= 0) {
                    addCombatMessage("Tu es vaincu et ne peux pas agir. Le combat se termine.");
                    setCombatPhase('end');
                    return;
                }
                console.log('CombatTurnManager - Starting player turn');
                setCombatPhase('player-movement');
                addCombatMessage("C'est ton tour !");
                setShowMovementFor('player');
            } else if (isCompanionTurn) {
                console.log('CombatTurnManager - Starting companion turn');
                addCombatMessage(`C'est le tour de ${currentTurnEntity.name}...`);
                const timer = setTimeout(() => companionAttack(), 400);
                return () => clearTimeout(timer);
            } else if (isEnemyTurn) {
                console.log('CombatTurnManager - Starting enemy turn');
                addCombatMessage(`C'est le tour de ${currentTurnEntity.name}...`);
                const timer = setTimeout(() => enemyAttack(), 400);
                return () => clearTimeout(timer);
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