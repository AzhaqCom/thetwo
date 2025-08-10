import { spells } from '../../data/spells';
import { weapons } from '../../data/weapons';
import { getModifier } from './utils';

/**
 * Gets all available actions for a character (spells, weapons, abilities)
 */
export const getAvailableActions = (character) => {
    const actions = [];

    // Add spell actions (if character can cast spells)
    if (character.spellcasting) {
        const spellActions = getOffensiveSpells(character);
        actions.push(...spellActions);
    }

    // Add weapon actions
    if (character.weapons && character.weapons.length > 0) {
        const weaponActions = character.weapons.map((weaponId, index) => {
            const weapon = weapons[weaponId];
            if (weapon) {
                return {
                    ...weapon,
                    actionType: 'weapon',
                    id: `${weaponId}-${index}`
                };
            }
            return null;
        }).filter(Boolean);
        actions.push(...weaponActions);
    }

    // Add class abilities (future implementation)
    if (character.abilities) {
        // TODO: Implement class abilities
    }

    return actions;
};

/**
 * Gets offensive spells available to the character
 */
export const getOffensiveSpells = (character) => {
    if (!character.spellcasting) return [];

    const allSpells = [
        ...(character.spellcasting.cantrips || []),
        ...(character.spellcasting.preparedSpells || [])
    ];

    return allSpells
        .map(spellName => {
            const spell = spells[spellName];
            if (spell && spell.damage) {
                return {
                    ...spell,
                    actionType: 'spell',
                    id: spellName
                };
            }
            return null;
        })
        .filter(Boolean);
};

/**
 * Gets the primary combat stat for a character class
 */
export const getPrimaryCombatStat = (character) => {
    switch (character.class) {
        case 'Roublard':
            return 'dexterite';
        case 'Magicien':
            return 'intelligence'; // For spell attacks
        case 'Guerrier':
            return 'force';
        default:
            return 'force'; // Default fallback
    }
};

/**
 * Gets the spellcasting ability for a character class
 */
export const getSpellcastingAbility = (character) => {
    if (!character.spellcasting) return null;
    
    return character.spellcasting.ability || (() => {
        switch (character.class) {
            case 'Magicien':
                return 'intelligence';
            case 'Clerc':
                return 'sagesse';
            case 'Barde':
                return 'charisme';
            case 'Rôdeur':
            case 'Paladin':
                return 'sagesse';
            case 'Sorcier':
            case 'Occultiste':
                return 'charisme';
            default:
                return 'intelligence';
        }
    })();
};

/**
 * Calculates attack bonus for an action
 */
export const calculateAttackBonus = (action, character) => {
    const proficiencyBonus = character.proficiencyBonus || 2;

    switch (action.actionType) {
        case 'spell':
            const spellcastingAbility = getSpellcastingAbility(character);
            return getModifier(character.stats[spellcastingAbility]) + proficiencyBonus;

        case 'weapon':
            // Determine which stat to use
            let statToUse = action.stat || 'force';
            
            // Handle finesse weapons - can choose between Force and Dexterity
            if (action.properties?.includes('finesse')) {
                const forceBonus = getModifier(character.stats.force);
                const dexBonus = getModifier(character.stats.dexterite);
                statToUse = dexBonus > forceBonus ? 'dexterite' : 'force';
            }

            // Check weapon proficiency
            const isProficient = isWeaponProficient(action, character);
            const profBonus = isProficient ? proficiencyBonus : 0;

            return getModifier(character.stats[statToUse]) + profBonus;

        default:
            return 0;
    }
};

/**
 * Calculates damage for an action
 */
export const calculateActionDamage = (action, character) => {
    switch (action.actionType) {
        case 'spell':
            // Spell damage is handled by existing spell system
            return {
                dice: action.damage.dice,
                bonus: action.damage.bonus || 0,
                type: action.damage.type
            };

        case 'weapon':
            // Determine which stat to use for damage bonus
            let statToUse = action.stat || 'force';
            
            // Handle finesse weapons
            if (action.properties?.includes('finesse')) {
                const forceBonus = getModifier(character.stats.force);
                const dexBonus = getModifier(character.stats.dexterite);
                statToUse = dexBonus > forceBonus ? 'dexterite' : 'force';
            }

            const statBonus = getModifier(character.stats[statToUse]);

            return {
                dice: action.damage,
                bonus: statBonus,
                type: action.damageType
            };

        default:
            return { dice: '1d4', bonus: 0, type: 'contondant' };
    }
};

/**
 * Gets the range of an action
 */
export const getActionRange = (action) => {
    switch (action.actionType) {
        case 'spell':
            // Convert spell ranges to grid squares (5 feet = 1 square)
            if (typeof action.range === 'string') {
                if (action.range.includes('mètres')) {
                    const meters = parseInt(action.range);
                    return Math.floor(meters / 1.5); // 1.5m = 1 square in D&D
                }
                if (action.range === 'Toucher') return 1;
                return 12; // Default ranged
            }
            return action.range || 12;

        case 'weapon':
            if (action.category === 'melee') {
                return action.range?.melee || 1;
            } else if (action.category === 'ranged') {
                // Parse range like "80/320" - use short range
                const rangeStr = action.range?.ranged || '80/320';
                const shortRange = parseInt(rangeStr.split('/')[0]);
                return Math.floor(shortRange / 5); // Convert feet to squares
            }
            return 1;

        default:
            return 1;
    }
};

/**
 * Checks if character is proficient with a weapon
 */
export const isWeaponProficient = (weapon, character) => {
    if (!character.weaponProficiencies) return false;

    // Check specific weapon proficiency
    if (character.weaponProficiencies.includes(weapon.id)) return true;

    // Check category proficiency (simple weapons, martial weapons)
    const isSimple = ['dagger', 'club', 'quarterstaff', 'lightCrossbow', 'shortbow'].includes(weapon.id);
    const isMartial = !isSimple;

    if (isSimple && character.weaponProficiencies.includes('simple')) return true;
    if (isMartial && character.weaponProficiencies.includes('martial')) return true;

    return false;
};

/**
 * Determines if an action requires an attack roll
 */
export const requiresAttackRoll = (action) => {
    switch (action.actionType) {
        case 'spell':
            return action.requiresAttackRoll || false;
        case 'weapon':
            return true; // All weapon attacks require attack rolls
        default:
            return false;
    }
};

/**
 * Determines if an action has area of effect
 */
export const hasAreaOfEffect = (action) => {
    return action.actionType === 'spell' && action.areaOfEffect;
};