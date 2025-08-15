import React, { useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { scenes } from './data/scenes';
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

// Legacy components (TODO: will be migrated in next phases)
// import Scene from './components/game/Scene'; // OBSOLÈTE: Plus utilisé avec le nouveau système

// Zustand stores
import {
  useGameStore,
  useCharacterStore,
  useCombatStore,
  useUIStore,
  gameSelectors,
  characterSelectors,
  combatSelectors,
  initializeStores
} from './stores';

// Utils
import { processSceneAction, processChoice, getGameStateForStory, isNewSceneFormat } from './components/utils/sceneUtils';
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
        combatLog,
        isShortResting,
        isLongResting,
        nextSceneAfterRest,
        combatKey,
        gameFlags,
        setGamePhase,
        setCurrentScene,
        addCombatMessage,
        handleSkillCheck,
        startShortRest,
        startLongRest,
        endShortRest,
        endLongRest,
        applyConsequences
    } = useGameStore();

    const {
        playerCharacter,
        playerCompanion,
        playerCompanions,
        activeCompanions,
        setPlayerCharacter,
        setPlayerCompanion,
        addCompanion,
        setActiveCompanions,
        getActiveCompanions,
        takeDamagePlayer,
        takeDamageCompanion,
        addItemToInventory,
        useItem,
        castSpellPlayer,
        shortRestPlayer,
        longRestPlayer,
        longRestAll,
        addExperience
    } = useCharacterStore();

    const {
        isActive: isInCombat,
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
      
      // Si il y a un compagnon, lui donner aussi l'XP
      if (playerCompanion) {
        addExperience(xpGained, 'companion')
        addCombatMessage(`${playerCompanion.name} gagne aussi ${xpGained} points d'expérience !`, 'victory')
      }
    }

    // 3. Récupérer l'action post-victoire depuis la scène de combat actuelle
    const nextAction = currentScene.next;

    // 4. Réinitialiser l'état du combat
    resetCombat();
    addCombatMessage('Combat terminé ! Victoire !', 'victory');

    // 3. Utiliser processSceneAction pour gérer la suite
 
    if (nextAction) {
        const result = processSceneAction(nextAction, {
            startLongRest,
            startShortRest,
            handleItemGain,
            setPlayerCompanion,
            addCompanion,
            setActiveCompanions,
            addCombatMessage,
            handleSkillCheck
        });

        if (result) {
            setCurrentScene(result);
        }
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
    const isInCombatScene = typeof currentScene === 'object' && currentScene.type === 'combat';
    const containerClass = `game-container ${isInCombatScene ? 'combat-mode' : ''}`;
    const mainContentClass = `main-content ${isInCombatScene ? 'combat-mode' : ''}`;
    const sidebarClass = `sidebar ${isInCombatScene ? 'combat-mode' : ''}`;

    // === NOUVELLES FONCTIONS POUR LES TYPES DE SCÈNES ===
    
    // Obtenir l'état du jeu avec le personnage actuel
    const getGameStateWithCharacter = () => {
        const gameState = getGameStateForStory();
        gameState.character = playerCharacter;
        return gameState;
    };

    // Gestionnaire de choix unifié pour le nouveau système
    const handleNewChoice = async (choice) => {
        const gameState = getGameStateWithCharacter();
        const result = await processChoice(choice, gameState, {
            startLongRest,
            startShortRest,
            handleItemGain,
            setPlayerCompanion,
            addCompanion,
            setActiveCompanions,
            addCombatMessage,
            handleSkillCheck
        });

        if (result) {
            setCurrentScene(result);
        }
    };

    // Gestionnaire pour les hotspots des scènes interactives
    const handleHotspotClick = (hotspot) => {
        if (hotspot.action) {
            const result = processSceneAction(hotspot.action, {
                startLongRest,
                startShortRest,
                handleItemGain,
                setPlayerCompanion,
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

    // Gestionnaire pour les achats
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

    // Gestionnaire pour les ventes
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

    // Rendu des nouvelles scènes selon leur type
    const renderNewSceneFormat = (scene) => {
        const gameState = getGameStateWithCharacter();

        // Vérifier si la scène doit être affichée
        if (!StoryService.shouldShowScene(scene, gameState)) {
            return <p>Cette scène n'est pas disponible actuellement.</p>;
        }

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
                                if (scene.metadata.nextScene) {
                                    setCurrentScene(scene.metadata.nextScene);
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
                                if (scene.metadata.nextScene) {
                                    setCurrentScene(scene.metadata.nextScene);
                                }
                            }}
                        />
                        <CombatLog title="Journal" compact={true} />
                    </div>
                );

            case SCENE_TYPES.COMBAT:
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
                            playerCompanion={playerCompanion}
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
                                
                                if (playerCompanion) {
                                    setPlayerCompanion({
                                        ...playerCompanion,
                                        currentHP: playerCompanion.maxHP
                                    });
                                }

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

            case SCENE_TYPES.TEXT:
            default:
                // Scène textuelle avec le nouveau format
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

    // SUPPRIMÉ: renderLegacyScene - remplacé par le système unifié

    const renderCurrentScene = () => {
        if (isLongResting) {
            return (
                <div className='long-rest-panel'>
                    <RestPanel
                        type="long"
                        character={playerCharacter}
                        onRestComplete={handleLongRest}
                    />
                    <CombatLog title="Journal" compact={true} />
                </div>
            );
        }

        if (isShortResting) {
            return (
                <div className='short-rest-panel'>
                    <RestPanel
                        type="short"
                        character={playerCharacter}
                        onRestComplete={handleShortRest}
                    />
                    <CombatLog title="Journal" compact={true} />
                </div>
            );
        }

        if (typeof currentScene === 'object' && currentScene.type === 'combat') {
            return (
                <CombatPanel
                    key={combatKey}
                    playerCharacter={playerCharacter}
                    playerCompanion={playerCompanion}
                    activeCompanions={getActiveCompanions()}
                    encounterData={currentScene}
                    onCombatEnd={handleCombatVictory}
                    onReplayCombat={() => {
                        // 1. Restaurer les PV du joueur et du compagnon pour le rejeu
                        if (playerCharacter) {
                            setPlayerCharacter({
                                ...playerCharacter,
                                currentHP: playerCharacter.maxHP
                            });
                        }
                        
                        if (playerCompanion) {
                            setPlayerCompanion({
                                ...playerCompanion,
                                currentHP: playerCompanion.maxHP
                            });
                        }

                        // 2. Réinitialiser complètement le combat
                        resetCombat();
                        incrementCombatKey();
                        addCombatMessage('🔄 Combat réinitialisé !', 'info');
                        
                        // 3. Attendre un tick pour que les changements soient appliqués
                        setTimeout(() => {
                            // Utiliser les personnages avec les PV restaurés
                            const restoredPlayer = { ...playerCharacter, currentHP: playerCharacter.maxHP };
                            const restoredCompanions = getActiveCompanions().map(companion => ({
                                ...companion,
                                currentHP: companion.maxHP
                            }));
                            
                            initializeCombat(currentScene, restoredPlayer, restoredCompanions);
                        }, 100);
                    }}
                />
            );
        }

        // Nouveau système : vérifier d'abord dans les nouvelles scènes
        const newSceneData = newScenes[currentScene];
        if (newSceneData) {
            return renderNewSceneFormat(newSceneData);
        }

        // OBSOLÈTE: Ancien système supprimé
        // Toutes les scènes doivent être migrées vers le nouveau format
        const currentSceneData = scenes[currentScene];
        if (currentSceneData) {
            console.error(`❌ Scène legacy non migrée: ${currentScene} - Veuillez la migrer vers le nouveau format`);
            return (
                <div className="scene-error">
                    <h3>⚠️ Scène non migrée</h3>
                    <p>La scène "{currentScene}" utilise l'ancien format et doit être migrée.</p>
                    <p>Veuillez contacter les développeurs pour migrer cette scène.</p>
                </div>
            );
        }

        return <p>Fin du jeu</p>;
    };
    // Determine which panels to show based on character class and abilities
    const shouldShowSpellcasting = playerCharacter?.spellcasting;
    const shouldShowWeapons = playerCharacter?.weapons && playerCharacter.weapons.length > 0;
    const shouldShowSpecialAbilities = playerCharacter?.specialAbilities;

    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            <div className={containerClass}>
                <div className={mainContentClass}>
                    {renderCurrentScene()}
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
                    {!getActiveCompanions().length && playerCompanion && (
                        <CompanionDisplay companion={playerCompanion} />
                    )}
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
