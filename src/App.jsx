import React from 'react';
import { scenes } from './data/scenes';
import CharacterSheet from './components/character/CharacterSheet';
import InventoryPanel from './components/inventory/InventoryPanel';
import SpellcastingPanel from './components/spells/SpellcastingPanel';
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
                    setCombatLog={setCombatLog}
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

    return (
        <div className="game-container">
            <div className="sidebar left-sidebar">
                {playerCompanion && <CompanionDisplay companion={playerCompanion} />}
                <InventoryPanel characterInventory={playerCharacter.inventory} onUseItem={inventoryActions.handleUseItem} />
                <SpellcastingPanel
                    character={playerCharacter}
                    onCastSpell={spellActions.handleCastSpellOutOfCombat}
                    onPrepareSpell={spellActions.handlePrepareSpell}
                    onUnprepareSpell={spellActions.handleUnprepareSpell}
                />
            </div>
            <div className="main-content">
                {renderCurrentScene()}
                <CombatLog logMessages={combatLog} />
            </div>
            <div className="sidebar right-sidebar">
                <CharacterSheet character={playerCharacter} />
            </div>
        </div>
    );
}

export default App;
