import { companions } from '../../data/companions';

/**
 * Processes scene actions and returns the appropriate result
 * @param {Object|string} action - The action to process
 * @param {Object} handlers - Object containing handler functions
 * @returns {Object|string} The processed action result
 */
export const processSceneAction = (action, handlers) => {
    if (typeof action === 'string') {
        return action;
    }

    if (typeof action === 'object') {
        switch (action.type) {
            case 'combat':
                return { 
                    ...action,
                    enemies: action.enemies,
                    enemyPositions: action.enemyPositions,
                    next: action.next,
                };
            case 'longRest':
                handlers.startLongRest(action.nextScene);
                return null;
            case 'shortRest':
                handlers.startShortRest(action.nextScene);
                return null;
            case 'item':
                handlers.handleItemGain(action.item);
                return action.nextScene;
            case 'ally':
                const companionToAdd = companions[action.ally];
                if (companionToAdd) {
                    handlers.setPlayerCompanion(companionToAdd);
                    handlers.addCombatMessage(`${companionToAdd.name} te rejoint dans ton aventure !`, 'upgrade');
                    return action.nextScene;
                } else {
                    console.error(`Compagnon '${action.ally}' introuvable.`);
                    return null;
                }
            case 'skillCheck':
                handlers.handleSkillCheck(
                    action.skill,
                    action.dc,
                    action.onSuccess,
                    action.onPartialSuccess,
                    action.onFailure
                );
                return null;
            default:
                console.warn("Type d'action inconnu :", action.type);
                return null;
        }
    }

    return null;
};