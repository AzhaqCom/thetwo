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