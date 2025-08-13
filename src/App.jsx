import React, { useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { scenes } from './data/scenes';

// Modern feature components
import {
  CharacterSheet,
  CharacterSelection,
  SpecialAbilitiesPanel,
  CompanionDisplay
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

// Legacy components (TODO: will be migrated in next phases)
import Scene from './components/game/Scene';

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
import { processSceneAction } from './components/utils/sceneUtils';
import { items } from './data/items';
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
        playerCompanion,
        setPlayerCharacter,
        setPlayerCompanion,
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
        setPlayerCharacter(selectedCharacter);
        setGamePhase('game');
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
            const itemData = items[itemId];
            if (itemData) {
                const itemToAdd = {
                    ...itemData,
                    id: itemId
                };
                addItemToInventory(itemToAdd);
                addCombatMessage(`Objet obtenu : ${itemData.name}`, 'item');
            } else {
                console.error(`❌ Item non trouvé : ${itemId}`);
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
                            const restoredCompanion = playerCompanion ? { ...playerCompanion, currentHP: playerCompanion.maxHP } : null;
                            initializeCombat(currentScene, restoredPlayer, restoredCompanion);
                        }, 100);
                    }}
                />
            );
        }

        const currentSceneData = scenes[currentScene];
        if (currentSceneData) {
            return (
                <div className='scene-textuel'>
                    <Scene
                        text={currentSceneData.text}
                        choices={currentSceneData.choices}
                        onChoice={(nextAction) => {
                            const action = typeof nextAction === 'function' ? nextAction() : nextAction;

                            const result = processSceneAction(action, {
                                startLongRest,
                                startShortRest,
                                handleItemGain,
                                setPlayerCompanion,
                                addCombatMessage,
                                handleSkillCheck
                            });

                            if (result) {
                                setCurrentScene(result);
                            }
                        }}
                    />
                    <CombatLog title="Journal" compact={true} />
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
                    {playerCompanion && <CompanionDisplay companion={playerCompanion} />}
                    <InventoryPanel 
                        characterInventory={playerCharacter.inventory} 
                        onUseItem={(itemId) => {
                            const success = useItem(itemId);
                            if (success) {
                                const item = playerCharacter.inventory.find(i => i.id === itemId);
                                addCombatMessage(`Utilisation de ${item?.name}`, 'item');
                            }
                        }} 
                    />
                    {shouldShowSpellcasting && (
                        <SpellPanel
                            character={playerCharacter}
                            onCastSpell={handleCastSpellOutOfCombat}
                            isOutOfCombat={true}
                        />
                    )}
                    {shouldShowWeapons && (
                        <div className="weapons-section">
                            {/* TODO: Create modern WeaponPanel component */}
                            <h3>Armes</h3>
                            <p>Panel d'armes à moderniser</p>
                        </div>
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
