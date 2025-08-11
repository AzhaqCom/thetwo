import React from 'react';
import { scenes } from './data/scenes';
import CharacterSheet from './components/character/CharacterSheet';
import CharacterSelection from './components/character/CharacterSelection';
import InventoryPanel from './components/inventory/InventoryPanel';
import SpellcastingPanel from './components/spells/SpellcastingPanel';
import WeaponPanel from './components/inventory/WeaponPanel';
import CombatLog from './components/ui/CombatLog';
import Scene from './components/game/Scene';
import CombatPanel from './components/combat/CombatPanel';
import ShortRestPanel from './components/rest/ShortRestPanel';
import LongRestPanel from './components/rest/LongRestPanel';
import CompanionDisplay from './components/combat/CompanionDisplay';
import { useGameState } from './hooks/useGameState';
import { useCombatActions } from './hooks/useCombatActions';
import { useInventoryActions } from './hooks/useInventoryActions';
import { useSpellActions } from './hooks/useSpellActions';
import { useRestActions } from './hooks/useRestActions';
import { processSceneAction } from './components/utils/sceneUtils';
import './App.css';

function App() {
    // Use custom hooks for state management
    const gameState = useGameState();
    const {
        gamePhase,
        setGamePhase,
        currentScene,
        setCurrentScene,
        playerCharacter,
        setPlayerCharacter,
        playerCompanion,
        setPlayerCompanion,
        combatLog,
        setCombatLog,
        isShortResting,
        isLongResting,
        nextSceneAfterRest,
        combatKey,
        addCombatMessage,
        handleSkillCheck
    } = gameState;

    // Use custom hooks for actions
    const combatActions = useCombatActions(
        playerCharacter,
        setPlayerCharacter,
        playerCompanion,
        setPlayerCompanion,
        addCombatMessage,
        currentScene,
        setCurrentScene,
        setCombatLog,
        gameState.setCombatKey
    );

    const inventoryActions = useInventoryActions(
        playerCharacter,
        setPlayerCharacter,
        addCombatMessage
    );

    const spellActions = useSpellActions(
        playerCharacter,
        setPlayerCharacter,
        addCombatMessage
    );

    const restActions = useRestActions(
        playerCharacter,
        setPlayerCharacter,
        playerCompanion,
        setPlayerCompanion,
        addCombatMessage,
        gameState.setIsShortResting,
        gameState.setIsLongResting,
        gameState.setNextSceneAfterRest,
        setCurrentScene,
        nextSceneAfterRest
    );

    const handleCharacterSelect = (selectedCharacter) => {
        setPlayerCharacter(selectedCharacter);
        setGamePhase('game');
    };

    // Show character selection if no character is selected
    if (gamePhase === 'character-selection') {
        return <CharacterSelection onCharacterSelect={handleCharacterSelect} />;
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

    // Determine if we're in combat mode
    const isInCombat = typeof currentScene === 'object' && currentScene.type === 'combat';
    const containerClass = `game-container ${isInCombat ? 'combat-mode' : ''}`;
    const mainContentClass = `main-content ${isInCombat ? 'combat-mode' : ''}`;
    const sidebarClass = `sidebar ${isInCombat ? 'combat-mode' : ''}`;

    const renderCurrentScene = () => {
        if (isLongResting) {
            return (
                <LongRestPanel
                    onRestComplete={restActions.handleLongRest}
                />
            );
        }

        if (isShortResting) {
            return (
                <ShortRestPanel
                    playerCharacter={playerCharacter}
                    handleSpendHitDie={restActions.handleSpendHitDie}
                    onEndRest={restActions.endShortRest}
                />
            );
        }

        if (typeof currentScene === 'object' && currentScene.type === 'combat') {
            return (
                <CombatPanel
                    key={combatKey}
                    playerCharacter={playerCharacter}
                    onPlayerTakeDamage={combatActions.handlePlayerTakeDamage}
                    onCombatEnd={combatActions.handleCombatVictory}
                    addCombatMessage={addCombatMessage}
                    combatLog={combatLog}
                    encounterData={currentScene}
                    onPlayerCastSpell={spellActions.handlePlayerCastSpell}
                    onReplayCombat={combatActions.handleReplayCombat}
                    combatKey={combatKey}
                    playerCompanion={playerCompanion}
                    onCompanionTakeDamage={combatActions.handleCompanionTakeDamage}
                />
            );
        }

        const currentSceneData = scenes[currentScene];
        if (currentSceneData) {
            return (
                <Scene
                    text={currentSceneData.text}
                    choices={currentSceneData.choices}
                    onChoice={(nextAction) => {
                        const action = typeof nextAction === 'function' ? nextAction() : nextAction;

                        const result = processSceneAction(action, {
                            startLongRest: restActions.startLongRest,
                            startShortRest: restActions.startShortRest,
                            handleItemGain: inventoryActions.handleItemGain,
                            setPlayerCompanion,
                            addCombatMessage,
                            handleSkillCheck
                        });

                        if (result) {
                            setCurrentScene(result);
                        }
                    }}
                />
            );
        }

        return <p>Fin du jeu</p>;
    };
    // Determine which panels to show based on character class and abilities
    const shouldShowSpellcasting = playerCharacter?.spellcasting;
    const shouldShowWeapons = playerCharacter?.weapons && playerCharacter.weapons.length > 0;
    const shouldShowSpecialAbilities = playerCharacter?.specialAbilities;

    return (
        <div className={containerClass}>
            <div className={mainContentClass}>
                {renderCurrentScene()}
                <CombatLog logMessages={combatLog} />
            </div>
            <div className={`${sidebarClass} right-sidebar`}>

                <CharacterSheet character={playerCharacter} />
                {playerCompanion && <CompanionDisplay companion={playerCompanion} />}
                <InventoryPanel characterInventory={playerCharacter.inventory} onUseItem={inventoryActions.handleUseItem} />
                {shouldShowSpellcasting && (
                    <SpellcastingPanel
                        character={playerCharacter}
                        onCastSpell={spellActions.handleCastSpellOutOfCombat}
                        onPrepareSpell={spellActions.handlePrepareSpell}
                        onUnprepareSpell={spellActions.handleUnprepareSpell}
                    />
                )}
                {shouldShowWeapons && (
                    <WeaponPanel character={playerCharacter} />
                )}
                {shouldShowSpecialAbilities && (
                    <SpecialAbilitiesPanel character={playerCharacter} />
                )}
            </div>
        </div>
    );
}

export default App;
