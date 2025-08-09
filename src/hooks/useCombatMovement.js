import { useState, useCallback } from 'react';
import { calculateEnemyMovement, GRID_WIDTH, GRID_HEIGHT } from '../components/utils/combatUtils';
import { calculateDamage } from '../components/utils/combatUtils';

export const useCombatMovement = (
    playerCharacter,
    companionCharacter,
    combatEnemies,
    addCombatMessage,
    onPlayerTakeDamage,
    onCompanionTakeDamage
) => {
    const [combatPositions, setCombatPositions] = useState({});
    const [showMovementFor, setShowMovementFor] = useState(null);
    const [showTargetingFor, setShowTargetingFor] = useState(null);
    const [hasMovedThisTurn, setHasMovedThisTurn] = useState(false);
    const [selectedAoESquares, setSelectedAoESquares] = useState([]);
    const [aoeCenter, setAoECenter] = useState(null);

    // Initialize combat positions when enemies are set up
    const initializeCombatPositions = useCallback((enemies, hasCompanion) => {
        const positions = {};
        
        // Place player at bottom-left
        positions.player = { x: 0, y: 5 };
        
        // Place companion next to player if exists
        if (hasCompanion) {
            positions.companion = { x: 1, y: 5 };
        }
        
        // Place enemies at the top, spread out
        enemies.forEach((enemy, index) => {
            const x = 6 + (index % 2); // Start from right side
            const y = Math.floor(index / 2); // Stack vertically if more than 2
            positions[enemy.name] = { x, y };
        });
        
        console.log('Initialized combat positions:', positions);
        setCombatPositions(positions);
    }, []);

    const handleMoveCharacter = useCallback((characterId, newPosition) => {
        const oldPosition = combatPositions[characterId];
        
        // Check for opportunity attacks
        if (characterId === 'player' || characterId === 'companion') {
            const opportunityAttacks = checkOpportunityAttacks(characterId, oldPosition, newPosition);
            opportunityAttacks.forEach(attack => {
                executeOpportunityAttack(attack.attacker, attack.target);
            });
        }
        
        setCombatPositions(prev => ({
            ...prev,
            [characterId]: newPosition
        }));
        setShowMovementFor(null);
        setHasMovedThisTurn(true);
    }, [combatPositions]);

    const updateEnemyPosition = useCallback((enemyName, newPosition) => {
        const oldPosition = combatPositions[enemyName];
        
        // Check for opportunity attacks when enemy moves
        const opportunityAttacks = checkOpportunityAttacks(enemyName, oldPosition, newPosition);
        opportunityAttacks.forEach(attack => {
            executeOpportunityAttack(attack.attacker, attack.target);
        });
        
        setCombatPositions(prev => ({
            ...prev,
            [enemyName]: newPosition
        }));
    }, [combatPositions]);

    const checkOpportunityAttacks = useCallback((movingCharacterId, oldPos, newPos) => {
        if (!oldPos || !newPos) return [];
        
        const attacks = [];
        
        if (movingCharacterId === 'player' || movingCharacterId === 'companion') {
            // Player/companion moving - check for enemy opportunity attacks
            const livingEnemies = combatEnemies.filter(e => e.currentHP > 0);
            
            livingEnemies.forEach(enemy => {
                const enemyPos = combatPositions[enemy.name];
                if (!enemyPos) return;
                
                const wasAdjacent = Math.abs(oldPos.x - enemyPos.x) <= 1 && Math.abs(oldPos.y - enemyPos.y) <= 1;
                const isStillAdjacent = Math.abs(newPos.x - enemyPos.x) <= 1 && Math.abs(newPos.y - enemyPos.y) <= 1;
                
                if (wasAdjacent && !isStillAdjacent) {
                    attacks.push({
                        attacker: enemy,
                        target: movingCharacterId
                    });
                }
            });
        } else {
            // Enemy moving - check for player/companion opportunity attacks
            const playerPos = combatPositions.player;
            const companionPos = combatPositions.companion;
            
            if (playerPos && playerCharacter.currentHP > 0) {
                const wasAdjacent = Math.abs(oldPos.x - playerPos.x) <= 1 && Math.abs(oldPos.y - playerPos.y) <= 1;
                const isStillAdjacent = Math.abs(newPos.x - playerPos.x) <= 1 && Math.abs(newPos.y - playerPos.y) <= 1;
                
                if (wasAdjacent && !isStillAdjacent) {
                    attacks.push({
                        attacker: 'player',
                        target: movingCharacterId
                    });
                }
            }
            
            if (companionPos && companionCharacter && companionCharacter.currentHP > 0) {
                const wasAdjacent = Math.abs(oldPos.x - companionPos.x) <= 1 && Math.abs(oldPos.y - companionPos.y) <= 1;
                const isStillAdjacent = Math.abs(newPos.x - companionPos.x) <= 1 && Math.abs(newPos.y - companionPos.y) <= 1;
                
                if (wasAdjacent && !isStillAdjacent) {
                    attacks.push({
                        attacker: 'companion',
                        target: movingCharacterId
                    });
                }
            }
        }
        
        return attacks;
    }, [combatEnemies, combatPositions, playerCharacter, companionCharacter]);

    const executeOpportunityAttack = useCallback((attacker, targetId) => {
        const attack = attacker.attacks?.[0];
        if (!attack) return;
        
        const attackBonus = attack.attackBonus || 0;
        const attackRoll = Math.floor(Math.random() * 20) + 1 + attackBonus;
        
        let targetAC = 10;
        if (targetId === 'player') targetAC = playerCharacter.ac;
        else if (targetId === 'companion' && companionCharacter) targetAC = companionCharacter.ac;
        
        if (attackRoll >= targetAC) {
            const { damage, message } = calculateDamage(attack);
            addCombatMessage(`Attaque d'opportunité ! ${attacker.name} touche avec ${attack.name} et inflige ${message}.`, 'enemy-damage');
            
            if (targetId === 'player') {
                onPlayerTakeDamage(damage, `Attaque d'opportunité de ${attacker.name} !`);
            } else if (targetId === 'companion') {
                onCompanionTakeDamage(damage, `Attaque d'opportunité de ${attacker.name} sur ${companionCharacter.name} !`);
            }
        } else {
            addCombatMessage(`Attaque d'opportunité ! ${attacker.name} rate son attaque.`, 'miss');
        }
    }, [playerCharacter, companionCharacter, addCombatMessage, onPlayerTakeDamage, onCompanionTakeDamage]);

    const calculateEnemyMovementPosition = useCallback((enemy) => {
        let currentPos;
        
        // Handle companion positioning
        if (enemy.type === 'companion') {
            currentPos = combatPositions.companion;
            if (!currentPos) return null;
            
            // Debug: Log companion movement calculation
            console.log('Calculating companion movement from:', currentPos);
            console.log('Available enemies:', combatEnemies.filter(e => e.currentHP > 0).map(e => ({ name: e.name, pos: combatPositions[e.name] })));
            
            return calculateEnemyMovement(enemy, currentPos, {
                combatPositions,
                playerCharacter,
                companionCharacter,
                combatEnemies
            });
        }
        
        // Handle enemy positioning
        currentPos = combatPositions[enemy.name];
        if (!currentPos) return null;
        
        return calculateEnemyMovement(enemy, currentPos, {
            combatPositions,
            playerCharacter,
            companionCharacter,
            combatEnemies
        });
    }, [combatPositions, playerCharacter, companionCharacter, combatEnemies]);

    return {
        // State
        combatPositions,
        setCombatPositions,
        showMovementFor,
        setShowMovementFor,
        showTargetingFor,
        setShowTargetingFor,
        hasMovedThisTurn,
        setHasMovedThisTurn,
        selectedAoESquares,
        setSelectedAoESquares,
        aoeCenter,
        setAoECenter,
        
        // Functions
        initializeCombatPositions,
        handleMoveCharacter,
        updateEnemyPosition,
        checkOpportunityAttacks,
        executeOpportunityAttack,
        calculateEnemyMovementPosition
    };
};