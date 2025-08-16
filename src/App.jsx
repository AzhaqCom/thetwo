import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { newScenes } from './data/scenes_examples';

// Modern feature components
import {
    CharacterSheet,
    CharacterSelection,
    SpecialAbilitiesPanel,
    CompanionDisplay,
    CompanionParty
} from './components/features/character';
import {
    CombatPanel
} from './components/features/combat';
import { CombatLog } from './components/ui/CombatLog';
import {
    InventoryPanel
} from './components/features/inventory';
import {
    SpellPanel
} from './components/features/spells';
import {
    RestPanel
} from './components/features/rest';

// New scene components
import DialogueScene from './components/game/DialogueScene';
import InteractiveScene from './components/game/InteractiveScene';
import MerchantScene from './components/game/MerchantScene';


// Zustand stores
import {
    useGameStore,
    useCharacterStore,
    useCombatStore,
    useUIStore,
} from './stores';

// Utils
import { processSceneAction, processChoice, getGameStateForStory } from './components/utils/sceneUtils';
import { 
    createVirtualRestScene, 
 
    getContainerClasses 
} from './components/utils/sceneRendering';
import { StoryService } from './services/StoryService';
import { SCENE_TYPES } from './types/story';
import { items } from './data/items';
import { weapons } from './data/weapons';
import './App.css';

// Error fallback component
function ErrorFallback({ error, resetErrorBoundary }) {
    return (
        <div className="error-boundary">
            <h2>Quelque chose s'est mal passé :</h2>
            <pre>{error.message}</pre>
            <button onClick={resetErrorBoundary}>Réessayer</button>
        </div>
    );
}

function App() {
    // Zustand stores
    const {
        gamePhase,
        currentScene,
        isShortResting,
        isLongResting,
        nextSceneAfterRest,
        combatKey,
        setGamePhase,
        setCurrentScene,
        addCombatMessage,
        handleSkillCheck,
        startShortRest,
        startLongRest,
        endShortRest,
        endLongRest
    } = useGameStore();

    const {
        playerCharacter,
        setPlayerCharacter,
        addCompanion,
        setActiveCompanions,
        getActiveCompanions,
        addItemToInventory,
        castSpellPlayer,
        shortRestPlayer,
        longRestAll,
        addExperience
    } = useCharacterStore();

    const {
        initializeCombat,
        resetCombat,
        incrementCombatKey
    } = useCombatStore();

    const {
        showError
    } = useUIStore();


    // Character selection handler
    const handleCharacterSelect = (selectedCharacter) => {
        // Ajouter de l'or de départ si pas défini
        const characterWithGold = {
            ...selectedCharacter,
            gold: selectedCharacter.gold || 100 // Or de départ par défaut
        };

        setPlayerCharacter(characterWithGold);
        setGamePhase('game');
        addCombatMessage('La fortune sourit aux audacieux')
    };

    // Combat victory handler
    const handleCombatVictory = () => {
        // 1. Récupérer l'XP gagné depuis le combat
        const { totalXpGained, combatEnemies } = useCombatStore.getState()
        const xpGained = totalXpGained || combatEnemies.reduce((total, enemy) => total + (enemy.xp || 0), 0)

        // 2. Donner l'expérience au joueur
        if (xpGained > 0) {
            addExperience(xpGained, 'player')
            addCombatMessage(`Vous gagnez ${xpGained} points d'expérience !`, 'victory')

            // Donner l'XP aux compagnons actifs
            const activeCompanions = getActiveCompanions()
            activeCompanions.forEach(companion => {
                addCombatMessage(`${companion.name} gagne aussi ${xpGained} points d'expérience !`, 'victory')
            })
        }

        // 3. Récupérer la scène suivante depuis la scène de combat actuelle
        const currentSceneData = newScenes[currentScene];
        const nextAction = currentSceneData?.metadata?.next || currentSceneData?.next;

        // 4. Réinitialiser l'état du combat
        resetCombat();
        addCombatMessage('Combat terminé ! Victoire !', 'victory');

        // 5. Naviguer vers la scène suivante après victoire
        if (nextAction) {
            setCurrentScene(nextAction);
        } else {
            // S'il n'y a pas de scène suivante définie, on peut aller à une scène par défaut ou terminer le jeu.
            console.warn("Aucune scène suivante n'est définie après le combat.");
            setCurrentScene('fin_du_jeu'); // ou une autre scène par défaut
        }
    };

    // Item gain handler
    const handleItemGain = (itemIdOrArray) => {
        const itemIds = Array.isArray(itemIdOrArray) ? itemIdOrArray : [itemIdOrArray];

        itemIds.forEach(itemId => {
            // Chercher d'abord dans items.js (consommables)
            let itemData = items[itemId];

            // Si pas trouvé dans items.js, chercher dans weapons.js
            if (!itemData) {
                itemData = weapons[itemId];
            }

            if (itemData) {
                const itemToAdd = {
                    ...itemData,
                    id: itemId
                };
                addItemToInventory(itemToAdd);
                console.log(`Objet obtenu : ${itemData.name}`, 'item');
                addCombatMessage(`Objet obtenu : ${itemData.name}`, 'item');
            } else {
                console.error(`❌ Item non trouvé dans items.js ou weapons.js : ${itemId}`);
            }
        });
    };

    // Rest handlers
    const handleShortRest = () => {
        shortRestPlayer();
        endShortRest();

    };

    const handleLongRest = () => {
        longRestAll();
        endLongRest();
        addCombatMessage('Repos long terminé - PV et sorts restaurés', 'rest');
    };

    // Spell casting out of combat
    const handleCastSpellOutOfCombat = (spell, level = null) => {
        try {
            const options = level ? { spellLevel: level } : {};
            castSpellPlayer(spell, options);
            addCombatMessage(`Sort lancé : ${spell.name}`, 'spell');
        } catch (error) {
            console.error('Erreur lors du lancement du sort:', error);
            showError(`Impossible de lancer le sort : ${error.message}`);
        }
    };

    // Error boundary wrapper
    if (gamePhase === 'character-selection') {
        return (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
                <CharacterSelection onCharacterSelect={handleCharacterSelect} />
            </ErrorBoundary>
        );
    }

    // Show loading if character is being set up
    if (!playerCharacter) {
        return (
            <div className="game-container">
                <div className="main-content">
                    <p>Chargement de ton personnage...</p>
                </div>
            </div>
        );
    }

    // Determine UI layout based on game state
    const { container: containerClass, mainContent: mainContentClass, sidebar: sidebarClass } = getContainerClasses(currentScene);

    // ===== SYSTÈME DE RENDU UNIFIÉ DES SCÈNES =====
    // Toutes les scènes utilisent désormais renderNewSceneFormat exclusivement
    // Fini les doubles systèmes de rendu - un seul pipeline pour tous les types

    /**
     * Obtient l'état du jeu avec le personnage actuel
     * Utilisé par le StoryService pour évaluer les conditions et variations
     */
    const getGameStateWithCharacter = () => {
        const gameState = getGameStateForStory();
        gameState.character = playerCharacter;
        return gameState;
    };

    /**
     * Gestionnaire de choix unifié pour toutes les scènes
     * Traite les choix via le StoryService et processChoice
     */
    const handleNewChoice = async (choice) => {
        const gameState = getGameStateWithCharacter();
        const result = await processChoice(choice, gameState, {
            startLongRest,
            startShortRest,
            handleItemGain,
            addCompanion,
            setActiveCompanions,
            addCombatMessage,
            handleSkillCheck
        });

        if (result) {
            setCurrentScene(result);
        }
    };

    /**
     * Gestionnaire pour les hotspots des scènes interactives
     * Permet l'interaction avec les éléments cliquables dans les scènes
     */
    const handleHotspotClick = (hotspot) => {
        if (hotspot.action) {
            const result = processSceneAction(hotspot.action, {
                startLongRest,
                startShortRest,
                handleItemGain,
                addCompanion,
                setActiveCompanions,
                addCombatMessage,
                handleSkillCheck
            });

            if (result) {
                setCurrentScene(result);
            }
        }
    };

    /**
     * Gestionnaire pour les achats dans les scènes de marchand
     * Met à jour l'or et l'inventaire du joueur
     */
    const handlePurchase = (purchaseResult) => {
        if (purchaseResult.success) {
            // Déduire l'or
            const newCharacter = {
                ...playerCharacter,
                gold: (playerCharacter.gold || 0) + purchaseResult.effects.gold
            };
            setPlayerCharacter(newCharacter);

            // Ajouter les items
            if (purchaseResult.effects.items) {
                handleItemGain(purchaseResult.effects.items);
            }

            addCombatMessage(purchaseResult.message, 'success');
        } else {
            addCombatMessage(purchaseResult.message, 'error');
        }
    };

    /**
     * Gestionnaire pour les ventes dans les scènes de marchand
     * Met à jour l'or et retire les items vendus
     */
    const handleSell = (sellResult) => {
        if (sellResult.success) {
            // Ajouter l'or
            const newCharacter = {
                ...playerCharacter,
                gold: (playerCharacter.gold || 0) + sellResult.effects.gold
            };
            setPlayerCharacter(newCharacter);

            // Retirer les items (logique à implémenter dans characterStore)
            if (sellResult.effects.removeItems) {
                // TODO: Implémenter removeItemFromInventory
                console.log('Items to remove:', sellResult.effects.removeItems);
            }

            addCombatMessage(sellResult.message, 'success');
        } else {
            addCombatMessage(sellResult.message, 'error');
        }
    };

    /**
     * ===== MOTEUR DE RENDU UNIFIÉ =====
     * Cette fonction gère TOUS les types de scènes du jeu
     * - Dialogue, Combat, Repos, Interactif, Marchand, Texte
     * - Un seul pipeline de rendu pour toute l'application
     */
    const renderNewSceneFormat = (scene) => {
        const gameState = getGameStateWithCharacter();

        // Vérifier si la scène doit être affichée selon ses conditions
        if (!StoryService.shouldShowScene(scene, gameState)) {
            return <p>Cette scène n'est pas disponible actuellement.</p>;
        }

        // === DISPATCH SELON LE TYPE DE SCÈNE ===
        switch (scene.metadata.type) {
            case SCENE_TYPES.DIALOGUE:
                return (
                    <div className='scene-dialogue'>
                        <DialogueScene
                            scene={scene}
                            gameState={gameState}
                            onChoice={handleNewChoice}
                        />
                        <CombatLog title="Journal" compact={true} />
                    </div>
                );

            case SCENE_TYPES.INTERACTIVE:
                return (
                    <div className='scene-interactive'>
                        <InteractiveScene
                            scene={scene}
                            gameState={gameState}
                            onHotspotClick={handleHotspotClick}
                            onChoice={handleNewChoice}
                        />
                        <CombatLog title="Journal" compact={true} />
                    </div>
                );

            case SCENE_TYPES.MERCHANT:
                return (
                    <div className='scene-merchant'>
                        <MerchantScene
                            scene={scene}
                            gameState={gameState}
                            onChoice={handleNewChoice}
                            onPurchase={handlePurchase}
                            onSell={handleSell}
                        />
                        <CombatLog title="Journal" compact={true} />
                    </div>
                );

            case SCENE_TYPES.REST_LONG:
                return (
                    <div className='scene-rest-long'>
                        <RestPanel
                            type="long"
                            character={playerCharacter}
                            onRestComplete={() => {
                                handleLongRest();
                                if (scene.next) {
                                    setCurrentScene(scene.next);
                                } else {
                                    console.warn('Pas de scène suivante définie après le repos long');
                                }
                            }}
                        />
                        <CombatLog title="Journal" compact={true} />
                    </div>
                );

            case SCENE_TYPES.REST_SHORT:
                return (
                    <div className='scene-rest-short'>
                        <RestPanel
                            type="short"
                            character={playerCharacter}
                            onRestComplete={() => {
                                handleShortRest();
                                if (scene.next) {
                                    setCurrentScene(scene.next);
                                } else {
                                    console.warn('Pas de scène suivante définie après le repos court');
                                }
                            }}
                        />
                        <CombatLog title="Journal" compact={true} />
                    </div>
                );

            case SCENE_TYPES.REST_CHOICE:
                // Permet au joueur de choisir entre repos court et long + bouton retour
                return (
                    <div className='scene-rest-choice'>
                        <RestPanel
                            // Pas de type = affiche le sélecteur avec choix
                            character={playerCharacter}
                            onRestComplete={(restType) => {
                                if (restType === 'long') {
                                    handleLongRest();
                                } else {
                                    handleShortRest();
                                }
                                
                                // Navigation simple - même scène après tous les repos
                                if (scene.next) {
                                    setCurrentScene(scene.next);
                                } else {
                                    console.warn('Pas de scène suivante définie après le repos');
                                }
                            }}
                            // Bouton retour pour REST_CHOICE uniquement
                            onCancel={() => {
                                if (scene.back) {
                                    setCurrentScene(scene.back);
                                } else {
                                    console.warn('Pas de scène de retour définie');
                                }
                            }}
                        />
                        <CombatLog title="Journal" compact={true} />
                    </div>
                );

            case SCENE_TYPES.COMBAT: {
                // Convertir les positions d'ennemis du format tableau vers le format objet attendu
                const enemyPositions = {};
                if (scene.enemyPositions && Array.isArray(scene.enemyPositions)) {
                    scene.enemyPositions.forEach((pos, index) => {
                        // Pour chaque type d'ennemi, créer les noms correspondants
                        if (scene.enemies && scene.enemies[0]) {
                            const enemyType = scene.enemies[0].type;
                            const template = { name: enemyType.charAt(0).toUpperCase() + enemyType.slice(1) };
                            const enemyName = `${template.name} ${index + 1}`;
                            enemyPositions[enemyName] = pos;
                        }
                    });
                }

                // Préparer les données de combat dans le bon format
                const combatData = {
                    type: 'combat',
                    enemies: scene.enemies || [],
                    enemyPositions: enemyPositions,
                    // Nouvelles propriétés pour positions personnalisées
                    playerPosition: scene.playerPosition || null,
                    companionPositions: scene.companionPositions || null,
                    next: scene.metadata.nextScene || scene.next
                };

                console.log('🎯 Combat scene data:', scene);
                console.log('🎯 Combat data for CombatPanel:', combatData);
                console.log('🎯 Enemy positions converted:', enemyPositions);

                return (

                    <CombatPanel
                        key={combatKey}
                        playerCharacter={playerCharacter}
                        activeCompanions={getActiveCompanions()}
                        encounterData={combatData}
                        onCombatEnd={() => {
                            handleCombatVictory();
                            if (scene.metadata.nextScene) {
                                setCurrentScene(scene.metadata.nextScene);
                            }
                        }}
                        onReplayCombat={() => {
                            // Restaurer les PV du joueur et du compagnon pour le rejeu
                            if (playerCharacter) {
                                setPlayerCharacter({
                                    ...playerCharacter,
                                    currentHP: playerCharacter.maxHP
                                });
                            }

                            // Restaurer les HP des compagnons actifs
                            const activeCompanions = getActiveCompanions()
                            activeCompanions.forEach(companion => {
                                // La restauration sera gérée par le système multi-compagnons
                            })

                            // Réinitialiser complètement le combat
                            resetCombat();
                            incrementCombatKey();
                            addCombatMessage('🔄 Combat réinitialisé !', 'info');

                            // Attendre un tick pour que les changements soient appliqués
                            setTimeout(() => {
                                const restoredPlayer = { ...playerCharacter, currentHP: playerCharacter.maxHP };
                                const restoredCompanions = getActiveCompanions().map(companion => ({
                                    ...companion,
                                    currentHP: companion.maxHP
                                }));

                                initializeCombat(scene, restoredPlayer, restoredCompanions);
                            }, 100);
                        }}
                    />

                );
            }

            case 'error':
                // === GESTION DES ERREURS ===
                return (
                    <div className="scene-error">
                        <h3>⚠️ Scène introuvable</h3>
                        <p>{scene.content.text}</p>
                        <button onClick={() => setCurrentScene('introduction')}>Retour au début</button>
                    </div>
                );

            case SCENE_TYPES.TEXT:
            default:
                // === RENDU DES SCÈNES TEXTUELLES ===
                // Format unifié pour toutes les scènes textuelles
                return (
                    <div className='scene-textuel-new'>
                        <div className="scene-content">
                            <h3>{scene.metadata.title}</h3>
                            <div className="scene-text">
                                {StoryService.getSceneText(scene, gameState).split('\n').map((line, index) => (
                                    line.trim() === '' ?
                                        <br key={index} /> :
                                        <p key={index}>{line}</p>
                                ))}
                            </div>
                        </div>
                        <div className="scene-choices">
                            {StoryService.getAvailableChoices(scene, gameState).map((choice, index) => (
                                <button
                                    key={index}
                                    className="choice-button"
                                    onClick={() => handleNewChoice(choice)}
                                >
                                    {choice.text}
                                </button>
                            ))}
                        </div>
                        <CombatLog title="Journal" compact={true} />
                    </div>
                );
        }
    };

    /**
     * Obtient la scène à rendre selon le contexte actuel
     * Gère les états spéciaux (repos) et les scènes normales
     */
    const getCurrentSceneToRender = () => {
        // === GESTION DES REPOS ===
        if (isLongResting) {
            return createVirtualRestScene('long', nextSceneAfterRest);
        }

        if (isShortResting) {
            return createVirtualRestScene('short', nextSceneAfterRest);
        }


        // === SYSTÈME UNIFIÉ ===
        const sceneData = newScenes[currentScene];
        if (sceneData) {
            return sceneData;
        }

        // === SCÈNE NON TROUVÉE ===
        return {
            metadata: { type: 'error', title: 'Erreur' },
            content: { 
                text: `La scène "${currentScene}" n'existe pas dans newScenes.`,
                error: true
            }
        };
    };
    // Determine which panels to show based on character class and abilities
    const shouldShowSpellcasting = playerCharacter?.spellcasting;
    const shouldShowSpecialAbilities = playerCharacter?.specialAbilities;

    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            <div className={containerClass}>
                <div className={mainContentClass}>
                    {renderNewSceneFormat(getCurrentSceneToRender())}
                </div>
                <div className={`${sidebarClass} right-sidebar`}>
                    <CharacterSheet
                        character={playerCharacter}
                        variant="interactive"
                    />

                    {/* Affichage des compagnons - nouveau système */}
                    <CompanionParty
                        companions={getActiveCompanions()}
                        variant="default"
                        showRoles={true}
                    />

                    {/* Fallback pour compatibilité */}
                    <InventoryPanel />
                    {shouldShowSpellcasting && (
                        <SpellPanel
                            character={playerCharacter}
                            onCastSpell={handleCastSpellOutOfCombat}
                            isOutOfCombat={true}
                        />
                    )}

                    {shouldShowSpecialAbilities && (
                        <SpecialAbilitiesPanel character={playerCharacter} />
                    )}
                </div>
            </div>
        </ErrorBoundary>
    );
}

export default App;
