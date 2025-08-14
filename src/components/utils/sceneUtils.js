import { companions } from '../../data/companions';
import { useCharacterStore } from '../../stores';

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
                    // Nouveau système multi-compagnons
                    const companionWithId = { 
                        ...companionToAdd, 
                        id: action.ally.toLowerCase() 
                    };
                    
                    // Ajouter au nouveau système
                    if (handlers.addCompanion) {
                        handlers.addCompanion(companionWithId);
                        
                        // Mettre à jour les compagnons actifs
                        const currentStore = useCharacterStore.getState();
                        const newActiveCompanions = [...currentStore.activeCompanions, companionWithId.id];
                        handlers.setActiveCompanions(newActiveCompanions);
                    }
                    
                    // Compatibilité avec l'ancien système (pour le premier compagnon)
                    if (handlers.setPlayerCompanion && !useCharacterStore.getState().playerCompanion) {
                        handlers.setPlayerCompanion(companionToAdd);
                    }
                    
                    handlers.addCombatMessage(`${companionToAdd.name} te rejoint dans ton aventure !`, 'upgrade');
                    console.log(`✅ RECRUIT: ${companionToAdd.name} (${companionToAdd.role}) avec ID=${companionWithId.id}`);
                    
                    return action.nextScene;
                } else {
                    console.error(`Compagnon '${action.ally}' introuvable.`);
                    return null;
                }
            case 'skillCheck':
                // Récupérer le personnage actuel depuis le store
                const playerCharacter = useCharacterStore.getState().playerCharacter;
                if (!playerCharacter) {
                    console.error('Aucun personnage joueur trouvé pour le test de compétence');
                    return null;
                }
                
                handlers.handleSkillCheck(
                    action.skill,
                    action.dc,
                    action.onSuccess,
                    action.onPartialSuccess,
                    action.onFailure,
                    playerCharacter
                );
                return null;
            default:
                console.warn("Type d'action inconnu :", action.type);
                return null;
        }
    }

    return null;
};