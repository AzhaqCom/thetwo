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
  CombatPanel,
  CombatLog
} from './components/features/combat';
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
        longRestAll
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
        resetCombat();
        setCurrentScene('scene1'); // Or next scene
        addCombatMessage('Combat terminé ! Victoire !', 'victory');
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
        addCombatMessage('Repos court terminé', 'rest');
    };

    const handleLongRest = () => {
        longRestAll();
        endLongRest();
        addCombatMessage('Repos long terminé - PV et sorts restaurés', 'rest');
    };

    // Spell casting out of combat
    const handleCastSpellOutOfCombat = (spell) => {
        try {
            castSpellPlayer(spell);
            addCombatMessage(`Sort lancé : ${spell.name}`, 'spell');
        } catch (error) {
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
                        onRestComplete={handleLongRest}
                    />
                    <CombatLog logMessages={combatLog} />
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
                    <CombatLog logMessages={combatLog} />
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
                        incrementCombatKey();
                        initializeCombat(currentScene, playerCharacter, playerCompanion);
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
                    <CombatLog logMessages={combatLog} />
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
