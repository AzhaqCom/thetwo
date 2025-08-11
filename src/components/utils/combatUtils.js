/**
 * Rolls dice based on a dice string format (e.g., "2d6", "1d4")
 * @param {string} diceString - The dice notation (e.g., "2d6")
 * @returns {number} The total rolled value
 */
export const rollDice = (diceString) => {
    if (!diceString || !diceString.includes('d')) return 0;
    const [num, size] = diceString.split('d').map(Number);
    let totalDamage = 0;
    for (let i = 0; i < num; i++) {
        totalDamage += Math.floor(Math.random() * size) + 1;
    }
    return totalDamage;
};

/**
 * Calculates damage from an attack object
 * @param {Object} attack - Attack object with damage dice and bonuses
 * @returns {Object} Object containing damage amount and message
 */
export const calculateDamage = (attack) => {
    let totalDamage = rollDice(attack.damageDice) + (attack.damageBonus || 0);
    let message = `${totalDamage} dégâts ${attack.damageType}`;

    if (attack.secondaryDamageDice) {
        const secondaryDamage = rollDice(attack.secondaryDamageDice) + (attack.secondaryDamageBonus || 0);
        totalDamage += secondaryDamage;
        message += ` + ${secondaryDamage} dégâts ${attack.secondaryDamageType} (${totalDamage}dmg)`;
    }
    return { damage: totalDamage, message };
};

/**
 * Rolls a d20 with modifier
 * @param {number} modifier - The modifier to add to the roll
 * @returns {number} The total roll result
 */
export const rollD20WithModifier = (modifier = 0) => {
    return Math.floor(Math.random() * 20) + 1 + modifier;
};

/**
 * Checks if an attack hits based on attack roll vs AC
 * @param {number} attackRoll - The attack roll result
 * @param {number} targetAC - The target's Armor Class
 * @returns {boolean} Whether the attack hits
 */
export const doesAttackHit = (attackRoll, targetAC) => {
    return attackRoll >= targetAC;
};

// Grid constants
export const GRID_WIDTH = 8;
export const GRID_HEIGHT = 6;

/**
 * Gets valid targets within range for an attack
 * @param {Object} attacker - The attacking character/enemy
 * @param {Object} attackerPos - Attacker's position {x, y}
 * @param {Object} attack - Attack object with range information
 * @param {Object} combatState - Combat state with all characters
 * @returns {Array} Array of valid targets
 */
export const getTargetsInRange = (attacker, attackerPos, attack, combatState) => {
    const { playerCharacter, companionCharacter, combatEnemies, combatPositions } = combatState;
    const targets = [];

    if (!attackerPos) return targets;

    // Determine attack range
    let maxRange = attack.range || 1; // Use attack.range or default to 1
    if (attack.type === 'ranged') {
        maxRange = attack.range || 6; // Default ranged range
    } else if (attack.type === 'melee') {
        maxRange = attack.range || 1; // Default melee range
    }



    // Check player as target (if attacker is enemy)
    if (attacker.type === 'enemy' && playerCharacter && playerCharacter.currentHP > 0 && combatPositions.player) {
        const playerPos = combatPositions.player;
        const distance = Math.abs(attackerPos.x - playerPos.x) + Math.abs(attackerPos.y - playerPos.y);

        if (distance <= maxRange) {
            targets.push({
                ...playerCharacter,
                type: 'player',
                name: playerCharacter.name,
                ac: playerCharacter.ac
            });

        }
    }

    // Check companion as target (if attacker is enemy)
    if (attacker.type === 'enemy' && companionCharacter && companionCharacter.currentHP > 0 && combatPositions.companion) {
        const companionPos = combatPositions.companion;
        const distance = Math.abs(attackerPos.x - companionPos.x) + Math.abs(attackerPos.y - companionPos.y);

        if (distance <= maxRange) {
            targets.push({
                ...companionCharacter,
                type: 'companion',
                name: companionCharacter.name,
                ac: companionCharacter.ac
            });

        }
    }

    // Check enemies as targets (if attacker is player/companion)
    if (attacker.type === 'player' || attacker.type === 'companion') {
        combatEnemies.forEach(enemy => {
            if (enemy.currentHP > 0) {
                const enemyPos = combatPositions[enemy.name];
                if (enemyPos) {
                    const distance = Math.abs(attackerPos.x - enemyPos.x) + Math.abs(attackerPos.y - enemyPos.y);

                    if (distance <= maxRange) {
                        targets.push({
                            ...enemy,
                            type: 'enemy',
                            name: enemy.name,
                            ac: enemy.ac
                        });

                    }
                }
            }
        });
    }


    return targets;
};

/**
 * Calculates the best movement position for an enemy
 * @param {Object} enemy - The enemy data
 * @param {Object} currentPos - Current position {x, y}
 * @param {Object} combatState - Combat state with positions and characters
 * @returns {Object|null} New position {x, y} or null if no movement needed
 */
export const calculateEnemyMovement = (enemy, currentPos, combatState) => {
    const { combatPositions, playerCharacter, companionCharacter, combatEnemies } = combatState;

    if (!currentPos || !combatPositions) return null;

    // If enemy is dead, don't move
    if (enemy.currentHP <= 0) return null;

    // Find potential targets
    const targets = [];

    if (enemy.type === 'enemy') {
        // Enemies target player and companion
        if (playerCharacter && playerCharacter.currentHP > 0 && combatPositions.player) {
            targets.push({ pos: combatPositions.player, type: 'player' });
        }
        if (companionCharacter && companionCharacter.currentHP > 0 && combatPositions.companion) {
            targets.push({ pos: combatPositions.companion, type: 'companion' });
        }
    } else if (enemy.type === 'companion') {
        // Companions target enemies
        combatEnemies.forEach(combatEnemy => {
         
            if (combatEnemy.currentHP > 0) {
                const enemyPos = combatPositions[combatEnemy.name];
                if (enemyPos) {
                    targets.push({ pos: enemyPos, type: 'enemy', name: combatEnemy.name });
                }
            }
        });
    }
 

    if (targets.length === 0) return null;

    // Find closest target
    let closestTarget = null;
    let closestDistance = Infinity;

    targets.forEach(target => {
        const distance = Math.abs(currentPos.x - target.pos.x) + Math.abs(currentPos.y - target.pos.y);
        if (distance < closestDistance) {
            closestDistance = distance;
            closestTarget = target;
        }
    });

    if (!closestTarget) return null;

    // Determine movement strategy based on enemy attacks
    const hasRangedAttack = enemy.attacks?.some(attack =>
        attack.type === 'ranged' || (typeof attack.range === 'number' && attack.range > 1)
    );
    const hasMeleeAttack = enemy.attacks?.some(attack =>
        attack.type === 'melee' || (typeof attack.range === 'number' && attack.range <= 1)
    );

    let idealDistance;
    if (hasMeleeAttack && !hasRangedAttack) {
        idealDistance = 1; // Get adjacent for melee
    } else if (hasRangedAttack && !hasMeleeAttack) {
        const rangedAttack = enemy.attacks.find(attack => attack.type === 'ranged' || (typeof attack.range === 'number' && attack.range > 1));
        idealDistance = Math.min(4, rangedAttack?.range || 4); // Stay at range but respect max range
    } else {
        idealDistance = 1; // Mixed, prefer melee range
    }


    // If already at ideal distance, don't move
    if (closestDistance <= idealDistance) {

        return null;
    }

    // Calculate movement (up to 6 squares)
    const maxMovement = enemy.movement || 6;
    let bestPosition = null;
    let bestScore = -1;

    // Check all positions within movement range
    for (let dx = -maxMovement; dx <= maxMovement; dx++) {
        for (let dy = -maxMovement; dy <= maxMovement; dy++) {
            const manhattanDistance = Math.abs(dx) + Math.abs(dy);
            if (manhattanDistance === 0 || manhattanDistance > maxMovement) continue;

            const newX = currentPos.x + dx;
            const newY = currentPos.y + dy;

            // Check bounds
            if (!isValidGridPosition(newX, newY)) continue;

            // Check if position is occupied
            if (isPositionOccupied(newX, newY, combatPositions, combatEnemies, enemy.name)) continue;

            // Calculate distance to target from this position
            const distanceToTarget = Math.abs(newX - closestTarget.pos.x) + Math.abs(newY - closestTarget.pos.y);

            // Score this position (prefer positions closer to ideal distance)
            const distanceFromIdeal = Math.abs(distanceToTarget - idealDistance);
            const score = 100 - distanceFromIdeal - manhattanDistance * 0.1; // Slight preference for less movement

            if (score > bestScore) {
                bestScore = score;
                bestPosition = { x: newX, y: newY };
            }
        }
    }

    // Validate the best position one more time and find alternative if needed
    if (bestPosition) {
   
        if (isValidGridPosition(bestPosition.x, bestPosition.y) &&
            !isPositionOccupied(bestPosition.x, bestPosition.y, combatPositions, combatEnemies, enemy.name)) {
         
            return bestPosition;
        } else {
      
            const fallbackPosition = findNearestValidPosition(bestPosition.x, bestPosition.y, combatPositions, combatEnemies, enemy.name);
            
            return fallbackPosition;
        }
    }
  

    return null;
};

/**
 * Checks if a position is occupied by any character
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {Object} combatPositions - All character positions
 * @param {Array} combatEnemies - Array of enemies
 * @param {string} excludeEnemyName - Enemy name to exclude from check
 * @returns {boolean} True if position is occupied
 */
const isPositionOccupied = (x, y, combatPositions, combatEnemies, excludeEnemyName = null) => {
    // Check player
    if (combatPositions.player && combatPositions.player.x === x && combatPositions.player.y === y) {
        return true;
    }

    // Check companion
    if (combatPositions.companion && combatPositions.companion.x === x && combatPositions.companion.y === y) {
        return true;
    }

    // Check other living enemies (dead enemies don't block movement)
    for (const enemy of combatEnemies) {
        if (enemy.name !== excludeEnemyName) {
            // Log pour voir quel ennemi est vérifié et son statut

            if (enemy.currentHP > 0) {
                const enemyPos = combatPositions[enemy.name];
                if (enemyPos && enemyPos.x === x && enemyPos.y === y) {
                  
                    return true;
                }
            } 
        }
    }
 

    return false;
};

/**
 * Validates that a position is within grid bounds
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {boolean} True if position is valid
 */
const isValidGridPosition = (x, y) => {
    return x >= 0 && x < GRID_WIDTH && y >= 0 && y < GRID_HEIGHT;
};

/**
 * Finds the nearest valid position if the given position is invalid or occupied
 * @param {number} targetX - Target X coordinate
 * @param {number} targetY - Target Y coordinate
 * @param {Object} combatPositions - All character positions
 * @param {Array} combatEnemies - Array of enemies
 * @param {string} excludeEnemyName - Enemy name to exclude from check
 * @returns {Object|null} Valid position {x, y} or null if none found
 */
const findNearestValidPosition = (targetX, targetY, combatPositions, combatEnemies, excludeEnemyName = null) => {
    // Check if target position is already valid
    if (isValidGridPosition(targetX, targetY) && !isPositionOccupied(targetX, targetY, combatPositions, combatEnemies, excludeEnemyName)) {
        return { x: targetX, y: targetY };
    }

    // Search in expanding circles around the target position
    for (let radius = 1; radius <= Math.max(GRID_WIDTH, GRID_HEIGHT); radius++) {
        for (let dx = -radius; dx <= radius; dx++) {
            for (let dy = -radius; dy <= radius; dy++) {
                // Only check positions on the edge of the current radius
                if (Math.abs(dx) !== radius && Math.abs(dy) !== radius) continue;

                const x = targetX + dx;
                const y = targetY + dy;

                if (isValidGridPosition(x, y) && !isPositionOccupied(x, y, combatPositions, combatEnemies, excludeEnemyName)) {
                    return { x, y };
                }
            }
        }
    }

    return null; // No valid position found
};