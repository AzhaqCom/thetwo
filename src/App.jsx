import React, { useState, useCallback, useEffect } from 'react';
import { scenes } from './data/scenes';
import { character as initialCharacter, spellSlotsByLevel } from './data/character';
import CharacterSheet from './components/CharacterSheet';
import CompanionSheet from './components/CompanionSheet';
import InventoryPanel from './components/InventoryPanel';
import SpellcastingPanel from './components/SpellcastingPanel';
import CombatLog from './components/CombatLog';
import Scene from './components/Scene';
import CombatPanel from './components/combat/CombatPanel';
import ShortRestPanel from './components/ShortRestPanel';
import LongRestPanel from './components/LongRestPanel';
import { items } from './data/items';
import { levels } from './data/levels';
import { enemyTemplates } from './data/enemies';
import { spells } from './data/spells';
import { companions } from './data/companions';
import { getModifier } from './components/utils/utils';
import CompanionDisplay from './components/combat/CompanionDisplay';
import './App.css';

const skillToStat = {
    acrobaties: "dexterite",
    arcane: "intelligence",
    athletisme: "force",
    discretion: "dexterite",
    dressage: "sagesse",
    escamotage: "dexterite",
    histoire: "intelligence",
    intimidation: "charisme",
    intuition: "sagesse",
    investigation: "intelligence",
    medecine: "sagesse",
    nature: "intelligence",
    perception: "sagesse",
    persuasion: "charisme",
    religion: "intelligence",
    representation: "charisme",
    survie: "sagesse",
    tromperie: "charisme"
};

function App() {
    const [currentScene, setCurrentScene] = useState("scene1");
    const [playerCharacter, setPlayerCharacter] = useState(initialCharacter);
    const [playerCompanion, setPlayerCompanion] = useState(null);
    const [combatLog, setCombatLog] = useState([]);
    const [isShortResting, setIsShortResting] = useState(false);
    const [isLongResting, setIsLongResting] = useState(false);
    const [nextSceneAfterRest, setNextSceneAfterRest] = useState(null);
    const [combatKey, setCombatKey] = useState(0);

    const addCombatMessage = useCallback((message, type = 'default') => {
        setCombatLog(prevLog => [...prevLog, { message, type }]);
    }, []);

    useEffect(() => {
        const getSpellSlotsForLevel = (level) => {
            const slots = spellSlotsByLevel[level];
            if (!slots) {
                return {};
            }

            const newSlots = {};
            for (const spellLevel in slots) {
                newSlots[spellLevel] = { total: slots[spellLevel], used: 0 };
            }
            return newSlots;
        };

        const getKnownSpells = (level) => {
            const slots = spellSlotsByLevel[level];
            const maxSpellLevel = slots ? Math.max(...Object.keys(slots).map(Number)) : 0;
            const cantrips = Object.values(spells).filter(spell => spell.level === 0).map(spell => spell.name);
            const leveledSpells = Object.values(spells)
                .filter(spell => spell.level > 0 && spell.level <= maxSpellLevel)
                .map(spell => spell.name);
            return [...cantrips, ...leveledSpells];
        };

        setPlayerCharacter(prev => ({
            ...prev,
            spellcasting: {
                ...prev.spellcasting,
                spellSlots: getSpellSlotsForLevel(prev.level),
                knownSpells: getKnownSpells(prev.level)
            }
        }));
    }, [playerCharacter.level]);
    const handleCombatEnd = useCallback((hasWon) => {

        if (hasWon) {
        
            const nextScene = scenes[currentScene].next || "sceneFallback";
            setCurrentScene(nextScene);
        } else {
          
            addCombatMessage("Défaite... Tu as perdu connaissance.", 'defeat');
           
        }
    }, [currentScene, addCombatMessage, scenes]);

    const handleCombatVictory = useCallback((defeatedEncounterData) => {
        const totalXPGained = defeatedEncounterData.reduce((sum, encounter) => {
            const enemyTemplate = enemyTemplates[encounter.type];
            if (enemyTemplate) {
                return sum + (enemyTemplate.xp * encounter.count);
            }
            return sum;
        }, 0);

        let newXP = playerCharacter.currentXP + totalXPGained;
        let newLevel = playerCharacter.level;

        const levelUpMessages = [];
        while (levels[newLevel + 1] && newXP >= levels[newLevel + 1].xpRequired) {
            newLevel++;
            levelUpMessages.push(`Tu as atteint le niveau ${newLevel} !`);
        }

        if (totalXPGained > 0) {
            addCombatMessage(`Tu as gagné ${totalXPGained} points d'expérience.`, 'experience');
        }
        levelUpMessages.forEach(msg => addCombatMessage(msg, 'levelup'));
        setPlayerCharacter(prevCharacter => ({
            ...prevCharacter,
            currentXP: newXP,
            level: newLevel,
        }));

        const nextScene = currentScene.next || "sceneFallback";
        setCurrentScene(nextScene);
    }, [currentScene, playerCharacter, addCombatMessage]);

   
    const handlePlayerTakeDamage = useCallback((damage, message) => {
        addCombatMessage(message, 'enemy-damage');
        setPlayerCharacter(prev => {
            const newHP = Math.max(0, prev.currentHP - damage);
            if (newHP <= 0) {
         
                handleCombatEnd(false); 
            }
            return { ...prev, currentHP: newHP };
        });
    }, [addCombatMessage, handleCombatEnd]);

    const handleCompanionTakeDamage = useCallback((damage, message) => {
        addCombatMessage(message, 'enemy-damage');
        setPlayerCompanion(prev => {
            if (!prev) return null;
            const newHP = Math.max(0, prev.currentHP - damage);
            return { ...prev, currentHP: newHP };
        });
    }, [addCombatMessage]);

    const handleItemGain = useCallback((itemNames) => {
        const itemsToProcess = Array.isArray(itemNames) ? itemNames : [itemNames];

        itemsToProcess.forEach(itemName => {
            const itemToAdd = items[itemName];
            if (itemToAdd) {
                setPlayerCharacter(prev => ({
                    ...prev,
                    inventory: [...prev.inventory, { ...itemToAdd, id: Date.now() + Math.random() }]
                }));
                addCombatMessage(`Tu as trouvé un(e) ${itemToAdd.name} ! Il a été ajouté à ton inventaire.`, 'bag');
            }
        });
    }, [addCombatMessage, items, setPlayerCharacter]);

    const handleUseItem = useCallback((itemToUse) => {
        if (itemToUse.type === 'consumable') {
            const updatedCharacter = itemToUse.use(playerCharacter);
            setPlayerCharacter({
                ...updatedCharacter,
                inventory: playerCharacter.inventory.filter(item => item.id !== itemToUse.id)
            });

            const message = itemToUse.message(updatedCharacter.currentHP - playerCharacter.currentHP);
            addCombatMessage(message, itemToUse.iconType);
        } else {
            addCombatMessage(`L'objet ${itemToUse.name} ne peut pas être utilisé.`, itemToUse.iconType);
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

        setPlayerCompanion(prev => {
            if (prev) {
                return { ...prev, currentHP: prev.maxHP, hitDice: prev.level };
            }
            return null;
        });
    }, [setPlayerCharacter]);

    const handleReplayCombat = useCallback(() => {
        resetCharacter();
        setCombatLog([]);
        setCombatKey(prevKey => prevKey + 1);
    }, [resetCharacter, setCombatLog]);

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

    const handleCastSpellOutOfCombat = useCallback((spellName) => {
        const spell = spells[spellName];

        if (!spell) {
            addCombatMessage(`Sort "${spellName}" introuvable.`, 'error');
            return;
        }

        if (!spell.castableOutOfCombat) {
            addCombatMessage(`${spell.name} ne peut pas être lancé hors combat.`, 'info');
            return;
        }

        if (spell.level > 0) {
            const spellSlots = playerCharacter.spellcasting.spellSlots[spell.level];
            if (!spellSlots || spellSlots.used >= spellSlots.total) {
                addCombatMessage(`Tu n'as plus d'emplacement de sort de niveau ${spell.level} disponible pour lancer ${spell.name}.`, 'info');
                return;
            }
        }

        let updatedCharacter = { ...playerCharacter };
        let castSuccess = true;

        switch (spellName) {
            case "Armure du Mage":
                const dexModifier = Math.floor((playerCharacter.stats.dexterite - 10) / 2);
                updatedCharacter.ac = 13 + dexModifier;
                addCombatMessage(`Tu as lancé ${spell.name} ! Ta Classe d'Armure est maintenant de ${updatedCharacter.ac}.`, 'upgrade');
                updatedCharacter.activeSpells = { ...updatedCharacter.activeSpells, "Armure du Mage": true };
                break;
            default:
                addCombatMessage(`${spell.name} a été lancé. (Effet non implémenté hors combat)`, 'spell-cast');
                break;
        }

        if (spell.level > 0 && castSuccess) {
            const newSpellSlots = { ...updatedCharacter.spellcasting.spellSlots };
            newSpellSlots[spell.level] = {
                ...newSpellSlots[spell.level],
                used: newSpellSlots[spell.level].used + 1
            };
            updatedCharacter.spellcasting = {
                ...updatedCharacter.spellcasting,
                spellSlots: newSpellSlots
            };
        }

        setPlayerCharacter(updatedCharacter);

    }, [playerCharacter, addCombatMessage, setPlayerCharacter]);

    const handlePrepareSpell = useCallback((spellName) => {
        const spell = spells[spellName];
        if (!spell) {
            addCombatMessage(`Sort "${spellName}" introuvable.`, 'error');
            return;
        }

        if (!playerCharacter.spellcasting.preparedSpells.includes(spellName)) {
            setPlayerCharacter(prev => ({
                ...prev,
                spellcasting: {
                    ...prev.spellcasting,
                    preparedSpells: [...prev.spellcasting.preparedSpells, spellName]
                }
            }));
            addCombatMessage(`${spell.name} a été ajouté à tes sorts préparés.`, 'spell');
        } else {
            addCombatMessage(`${spell.name} est déjà préparé.`);
        }
    }, [playerCharacter, addCombatMessage, setPlayerCharacter]);


    const startShortRest = useCallback((nextScene) => {
        addCombatMessage("Tu as commencé un repos court pour te soigner.", 'duration');
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

            addCombatMessage(`Tu as dépensé un dé de vie (d${playerCharacter.hitDiceType}) et récupères ${healedHP} PV.`, 'heal');
        }
    }, [playerCharacter, addCombatMessage, setPlayerCharacter]);

    const endShortRest = useCallback(() => {
        addCombatMessage("Le repos est terminé.");
        setIsShortResting(false);
        setCurrentScene(nextSceneAfterRest);
        setNextSceneAfterRest(null);
    }, [addCombatMessage, nextSceneAfterRest]);

    const startLongRest = useCallback((nextScene) => {
        addCombatMessage("Tu as trouvé un endroit sûr et te prépares pour un long repos.", 'duration');
        setIsLongResting(true);
        setNextSceneAfterRest(nextScene);
    }, [addCombatMessage]);

    const handleLongRest = useCallback(() => {
        addCombatMessage("Tu te sens revigoré ! Tous tes PV et emplacements de sorts ont été restaurés.", 'heal');
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

        setPlayerCompanion(prev => {
            if (prev) {
                return { ...prev, currentHP: prev.maxHP, hitDice: prev.level };
            }
            return null;
        });

        setIsLongResting(false);
        setCurrentScene(nextSceneAfterRest);
        setNextSceneAfterRest(null);
    }, [addCombatMessage, nextSceneAfterRest]);

    const handleSkillCheck = useCallback((skill, dc, onSuccess, onPartialSuccess, onFailure) => {
        const statName = skillToStat[skill];
        const statValue = playerCharacter.stats[statName];
        const statModifier = getModifier(statValue);
        const isProficient = playerCharacter.proficiencies.skills.includes(skill);
        const proficiencyBonus = isProficient ? playerCharacter.proficiencyBonus : 0;
        const skillBonus = statModifier + proficiencyBonus;
        const roll = Math.floor(Math.random() * 20) + 1;
        const totalRoll = roll + skillBonus;

        addCombatMessage(`Tu lances un dé pour la compétence ${skill} (${statName}). Ton résultat est de ${roll} + ${skillBonus} (bonus de compétence) = ${totalRoll}. Le DD était de ${dc}.`, 'skill-check');

        let nextScene = onFailure;
        if (totalRoll >= dc) {
            nextScene = onSuccess;
            addCombatMessage("Réussite ! Tu as réussi le test de compétence.");
        } else if (totalRoll >= (dc - 5) && onPartialSuccess) {
            nextScene = onPartialSuccess;
            addCombatMessage("Réussite partielle. Tu n'as pas réussi totalement, mais tu as un indice ou une petite récompense.");
        } else {
            nextScene = onFailure;
            addCombatMessage("Échec. Tu n'as pas réussi le test de compétence.");
        }

        setCurrentScene(nextScene);
    }, [playerCharacter, addCombatMessage]);

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
                    playerCompanion={playerCompanion}
                    onCompanionTakeDamage={handleCompanionTakeDamage}
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

                        if (typeof action === 'string') {
                            setCurrentScene(action);
                        } else if (typeof action === 'object') {
                            switch (action.type) {
                                case 'combat':
                                    setCurrentScene({ ...action, next: action.next });
                                    break;
                                case 'longRest':
                                    startLongRest(action.nextScene);
                                    break;
                                case 'shortRest':
                                    startShortRest(action.nextScene);
                                    break;
                                case 'item':
                                    handleItemGain(action.item);
                                    if (action.nextScene) {
                                        setCurrentScene(action.nextScene);
                                    }
                                    break;
                                case 'ally':
                                    const companionToAdd = companions[action.ally];
                                    if (companionToAdd) {
                                        setPlayerCompanion(companionToAdd);
                                        addCombatMessage(`${companionToAdd.name} te rejoint dans ton aventure !`, 'upgrade');
                                        setCurrentScene(action.nextScene);
                                    } else {
                                        console.error(`Compagnon '${action.ally}' introuvable.`);
                                    }
                                    break;
                                case 'skillCheck':
                                    handleSkillCheck(
                                        action.skill,
                                        action.dc,
                                        action.onSuccess,
                                        action.onPartialSuccess,
                                        action.onFailure
                                    );
                                    break;
                                default:
                                    console.warn("Type d'action inconnu :", action.type);
                                    break;
                            }
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
                <InventoryPanel characterInventory={playerCharacter.inventory} onUseItem={handleUseItem} />
                <SpellcastingPanel
                    character={playerCharacter}
                    onCastSpell={handleCastSpellOutOfCombat}
                    onPrepareSpell={handlePrepareSpell}
                />
            </div>
            <div className="main-content">
                {renderCurrentScene()}
                <CombatLog logMessages={combatLog} />
            </div>
            <div className="sidebar right-sidebar">
                <CharacterSheet character={playerCharacter} />
                {playerCompanion && <CompanionSheet companion={playerCompanion} />}
            </div>
        </div>
    );
}

export default App;
