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
    const initializeCombatPositions = useCallback((enemies, hasCompanion, customEnemyPositions = null) => {
        const positions = {};

        // Place player at bottom-left
        positions.player = { x: 0, y: 5 };

        // Place companion next to player if exists
        if (hasCompanion) {
            positions.companion = { x: 1, y: 5 };
        }

        // Place enemies using custom positions or default logic
        if (customEnemyPositions && Array.isArray(customEnemyPositions)) {
            enemies.forEach((enemy, index) => {
                if (index < customEnemyPositions.length) {
                    // Use custom position if available
                    const customPos = customEnemyPositions[index];
                    if (customPos && typeof customPos.x === 'number' && typeof customPos.y === 'number') {
                        // Validate position is within grid bounds
                        const x = Math.max(0, Math.min(7, customPos.x)); // Clamp to 0-7
                        const y = Math.max(0, Math.min(5, customPos.y)); // Clamp to 0-5
                        positions[enemy.name] = { x, y };
                    } else {
                        // Fallback to default if custom position is invalid
                        const x = 6 + (index % 2);
                        const y = Math.floor(index / 2);
                        positions[enemy.name] = { x, y };
                    }
                } else {
                    // Fallback to default if not enough custom positions
                    const x = 6 + (index % 2);
                    const y = Math.floor(index / 2);
                    positions[enemy.name] = { x, y };
                }
            });
        } else {
            // Default placement logic
            enemies.forEach((enemy, index) => {
                const x = 6 + (index % 2); // Start from right side
                const y = Math.floor(index / 2); // Stack vertically if more than 2
                positions[enemy.name] = { x, y };
            });
        }

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
        // Validate the new position
        if (!newPosition || 
            newPosition.x < 0 || newPosition.x >= 8 || 
            newPosition.y < 0 || newPosition.y >= 6) {
            console.warn(`Invalid position for ${enemyName}:`, newPosition);
            return;
        }
        
        // Check if the enemy is still alive
        const enemy = combatEnemies.find(e => e.name === enemyName);
        if (enemy && enemy.currentHP <= 0) {
            console.log(`Enemy ${enemyName} is dead, not moving`);
            return;
        }
        
        // Remove dead enemy positions from combatPositions to free up space
        setCombatPositions(prev => {
            const updated = { ...prev };
            
            // Remove positions of dead enemies
            combatEnemies.forEach(enemy => {
                if (enemy.currentHP <= 0 && updated[enemy.name]) {
                    delete updated[enemy.name];
                }
            });
            
            return updated;
        });
        
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

                // Triple check that enemy is still alive (already filtered above, but safety check)
                if (enemy.currentHP <= 0) return;

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
            // First check if the moving enemy is still alive - if dead, no opportunity attacks should be triggered
            const movingEnemy = combatEnemies.find(e => e.name === movingCharacterId);
            if (movingEnemy && movingEnemy.currentHP <= 0) return [];

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
        // If attacker is an enemy object, check if it's still alive
        if (typeof attacker === 'object' && attacker.name && attacker.currentHP <= 0) {
            console.log(`Attacker ${attacker.name} is dead (${attacker.currentHP} HP), skipping opportunity attack`);
            return;
        }

        // Get the attack from the attacker
        const attack = attacker.attacks?.[0];
        if (!attack) return;

        const attackBonus = attack.attackBonus || 0;
        const attackRoll = Math.floor(Math.random() * 20) + 1 + attackBonus;

        // Determine target AC
        let targetAC = 10;
        if (targetId === 'player') targetAC = playerCharacter.ac;
        else if (targetId === 'companion' && companionCharacter) targetAC = companionCharacter.ac;
        else {
            // If targeting an enemy, find its AC
            const targetEnemy = combatEnemies.find(e => e.name === targetId);
            if (targetEnemy) targetAC = targetEnemy.ac;
        }

        if (attackRoll >= targetAC) {
            const { damage, message } = calculateDamage(attack);
            const attackerName = typeof attacker === 'string' ? 
                (attacker === 'player' ? playerCharacter.name : companionCharacter?.name) : 
                attacker.name;
            
            addCombatMessage(`Attaque d'opportunité ! ${attackerName} touche avec ${attack.name} et inflige ${message}.`, 'enemy-damage');

            if (targetId === 'player') {
                onPlayerTakeDamage(damage, `Attaque d'opportunité de ${attackerName} !`);
            } else if (targetId === 'companion') {
                onCompanionTakeDamage(damage, `Attaque d'opportunité de ${attackerName} sur ${companionCharacter.name} !`);
            }
        } else {
            const attackerName = typeof attacker === 'string' ? 
                (attacker === 'player' ? playerCharacter.name : companionCharacter?.name) : 
                attacker.name;
            addCombatMessage(`Attaque d'opportunité ! ${attackerName} rate son attaque.`, 'miss');
        }
    }, [playerCharacter, companionCharacter, addCombatMessage, onPlayerTakeDamage, onCompanionTakeDamage]);

    const calculateEnemyMovementPosition = useCallback((enemy) => {
        let currentPos;

        // Handle companion positioning
        if (enemy.type === 'companion') {
            currentPos = combatPositions.companion;
            if (!currentPos) return null;
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