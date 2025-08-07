// src/App.jsx

import { useState, useCallback } from 'react';
import { scenes } from './data/scenes';
import { character as initialCharacter } from './data/character';
import CharacterSheet from './components/CharacterSheet';
import CombatLog from './components/CombatLog';
import Scene from './components/Scene';
import CombatPanel from './components/combat/CombatPanel';
import ShortRestPanel from './components/ShortRestPanel';
import LongRestPanel from './components/LongRestPanel';
import { items } from './data/items';
import { levels } from './data/levels';
import { enemyTemplates } from './data/enemies';
import './App.css';

function App() {
    const [currentScene, setCurrentScene] = useState("scene1");
    const [playerCharacter, setPlayerCharacter] = useState(initialCharacter);
    const [combatLog, setCombatLog] = useState([]);
    const [isShortResting, setIsShortResting] = useState(false);
    const [isLongResting, setIsLongResting] = useState(false);
    const [nextSceneAfterRest, setNextSceneAfterRest] = useState(null);
    const [combatKey, setCombatKey] = useState(0);
    const addCombatMessage = useCallback((message, type = 'default') => {
        setCombatLog(prevLog => [...prevLog, { message, type }]);
    }, []);

    const handleCombatVictory = useCallback((defeatedEncounterData) => {

        const totalXPGained = defeatedEncounterData.reduce((sum, encounter) => {
            const enemyTemplate = enemyTemplates[encounter.type];
            if (enemyTemplate) {
                return sum + (enemyTemplate.xp * encounter.count);
            }
            return sum;
        }, 0);

        setPlayerCharacter(prevCharacter => {
            let newXP = prevCharacter.currentXP + totalXPGained;
            let newLevel = prevCharacter.level;

            const nextLevelXP = levels[newLevel + 1]?.xpRequired;
            if (nextLevelXP && newXP >= nextLevelXP) {
                newLevel++;
                addCombatMessage(`Tu as atteint le niveau ${newLevel} !`, 'level-up');
            }

            return {
                ...prevCharacter,
                currentXP: newXP,
                level: newLevel,
            };
        });

        if (totalXPGained > 0) {
            addCombatMessage(`Tu as gagné ${totalXPGained} points d'expérience.`, 'xp-gain');
        }

        const nextScene = currentScene.next || "sceneFallback";
        setCurrentScene(nextScene);
    }, [currentScene, addCombatMessage]);
    const handlePlayerTakeDamage = useCallback((damage, message) => {
        setPlayerCharacter(prev => {
            const newHP = Math.max(0, prev.currentHP - damage);
            addCombatMessage(message, 'enemy-damage');
            return { ...prev, currentHP: newHP };
        });
    }, [addCombatMessage]);
    const handleItemGain = useCallback((itemName) => {
        const itemToAdd = items[itemName];
        if (itemToAdd) {
            setPlayerCharacter(prev => ({
                ...prev,
                inventory: [...prev.inventory, { ...itemToAdd, id: Date.now() + Math.random() }] // Ajout d'un ID unique
            }));
            addCombatMessage(`Tu as trouvé un(e) ${itemToAdd.name} ! Il a été ajouté à ton inventaire.`, 'item-gain');
        }
    }, [addCombatMessage]);

    const handleUseItem = useCallback((itemToUse) => {
        if (itemToUse.type === 'consumable') {
            // Applique l'effet de l'objet
            const updatedCharacter = itemToUse.use(playerCharacter);
            setPlayerCharacter({
                ...updatedCharacter,
                // Supprime l'objet de l'inventaire
                inventory: playerCharacter.inventory.filter(item => item.id !== itemToUse.id)
            });

            const message = itemToUse.message(updatedCharacter.currentHP - playerCharacter.currentHP);
            addCombatMessage(message, 'item-use');
        } else {
            addCombatMessage(`L'objet ${itemToUse.name} ne peut pas être utilisé.`, 'info');
        }
    }, [playerCharacter, addCombatMessage]);
    const resetCharacter = useCallback(() => {
        setPlayerCharacter(prev => {
            const healedCharacter = {
                ...prev,
                currentHP: prev.maxHP,
                hitDice: prev.level,
                spellcasting: {
                    ...prev.spellcasting,
                    spellSlots: Object.fromEntries(
                        Object.entries(prev.spellcasting.spellSlots).map(([level, slots]) => [
                            level,
                            { ...slots, used: 0 }
                        ])
                    )
                }
            };
            return healedCharacter;
        });
    }, [setPlayerCharacter]);
    const handleReplayCombat = useCallback(() => {
        resetCharacter();
        setCombatLog([]);
        setCombatKey(prevKey => prevKey + 1);
    }, [resetCharacter, setCombatLog, currentScene]);

    const handlePlayerCastSpell = useCallback((spell) => {
        if (spell.level > 0) {
            const newSpellSlots = { ...playerCharacter.spellcasting.spellSlots };
            const spellSlots = newSpellSlots[spell.level];

            if (spellSlots && spellSlots.used < spellSlots.total) {
                newSpellSlots[spell.level] = { ...spellSlots, used: spellSlots.used + 1 };
                setPlayerCharacter(prev => ({
                    ...prev,
                    spellcasting: { ...prev.spellcasting, spellSlots: newSpellSlots }
                }));
                return true;
            } else {
                addCombatMessage(`Tu n'as plus d'emplacement de sort de niveau ${spell.level} disponible.`);
                return false;
            }
        }
        return true;
    }, [playerCharacter, addCombatMessage, setPlayerCharacter]);

    // Fonction unifiée pour démarrer un repos court
    const startShortRest = useCallback((nextScene) => {
        addCombatMessage("Tu as commencé un repos court pour te soigner.");
        setIsShortResting(true);
        setNextSceneAfterRest(nextScene);
    }, [addCombatMessage]);

    const handleSpendHitDie = useCallback(() => {
        if (playerCharacter.hitDice > 0 && playerCharacter.currentHP < playerCharacter.maxHP) {
            const conModifier = Math.floor((playerCharacter.stats.constitution - 10) / 2);
            const rollResult = Math.floor(Math.random() * playerCharacter.hitDiceType) + 1;
            const healedHP = rollResult + conModifier;

            setPlayerCharacter(prev => ({
                ...prev,
                currentHP: Math.min(prev.maxHP, prev.currentHP + healedHP),
                hitDice: prev.hitDice - 1
            }));

            addCombatMessage(`Tu as dépensé un dé de vie (d${playerCharacter.hitDiceType}) et récupères ${healedHP} PV.`);
        }
    }, [playerCharacter, addCombatMessage, setPlayerCharacter]);

    const endShortRest = useCallback(() => {
        addCombatMessage("Le repos est terminé.");
        setIsShortResting(false);
        setCurrentScene(nextSceneAfterRest);
        setNextSceneAfterRest(null);
    }, [addCombatMessage, nextSceneAfterRest]);

    // Fonction unifiée pour démarrer un repos long
    const startLongRest = useCallback((nextScene) => {
        addCombatMessage("Tu as trouvé un endroit sûr et te prépares pour un long repos.");
        setIsLongResting(true);
        setNextSceneAfterRest(nextScene);
    }, [addCombatMessage]);

    // Fonction qui gère la guérison et la transition de scène du repos long
    const handleLongRest = useCallback(() => {
        setPlayerCharacter(prev => {
            const healedCharacter = {
                ...prev,
                currentHP: prev.maxHP,
                hitDice: prev.level,
                spellcasting: {
                    ...prev.spellcasting,
                    spellSlots: Object.fromEntries(
                        Object.entries(prev.spellcasting.spellSlots).map(([level, slots]) => [
                            level,
                            { ...slots, used: 0 }
                        ])
                    )
                }
            };
            return healedCharacter;
        });

        addCombatMessage("Tu te sens revigoré ! Tous tes PV et emplacements de sorts ont été restaurés.", 'heal');
        setIsLongResting(false);
        setCurrentScene(nextSceneAfterRest);
        setNextSceneAfterRest(null);
    }, [addCombatMessage, nextSceneAfterRest]);

    const renderCurrentScene = () => {
        if (isLongResting) {
            return (
                <LongRestPanel
                    onRestComplete={handleLongRest}
                />
            );
        }

        if (isShortResting) {
            return (
                <ShortRestPanel
                    playerCharacter={playerCharacter}
                    handleSpendHitDie={handleSpendHitDie}
                    onEndRest={endShortRest}
                />
            );
        }

        if (typeof currentScene === 'object' && currentScene.type === 'combat') {
            return (
                <CombatPanel
                    key={combatKey}
                    playerCharacter={playerCharacter}
                    onPlayerTakeDamage={handlePlayerTakeDamage}
                    onCombatEnd={handleCombatVictory}
                    addCombatMessage={addCombatMessage}
                    setCombatLog={setCombatLog}
                    encounterData={currentScene.enemies}
                    onPlayerCastSpell={handlePlayerCastSpell}
                    onReplayCombat={handleReplayCombat}
                    combatKey={combatKey}
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
                        if (typeof nextAction === 'string') {
                            setCurrentScene(nextAction);
                        } else if (typeof nextAction === 'object' && nextAction.type === 'combat') {
                            setCurrentScene(nextAction);
                        } else if (typeof nextAction === 'object' && nextAction.type === 'longRest') {
                            startLongRest(nextAction.nextScene);
                        } else if (typeof nextAction === 'object' && nextAction.type === 'shortRest') {
                            startShortRest(nextAction.nextScene);
                        } else if (typeof nextAction === 'object' && nextAction.type === 'item') { // NOUVEAU : Gère le gain d'objet
                            handleItemGain(nextAction.item);
                            if (nextAction.nextScene) {
                                setCurrentScene(nextAction.nextScene);
                            }
                        } else if (typeof nextAction === 'function') {
                            nextAction(setCurrentScene, startShortRest, startLongRest, handleItemGain); // PASSE la nouvelle fonction
                        }
                    }}
                />
            );
        }

        return <p>Fin du jeu :)</p>;
    };

    return (
        <div className="game-container">
            <div className="main-content">
                {renderCurrentScene()}
                <CombatLog logMessages={combatLog} />
            </div>
            <div className="sidebar">
                <CharacterSheet character={playerCharacter} onUseItem={handleUseItem} />
            </div>
        </div>
    );
}

export default App;