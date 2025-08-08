import React, { useState, useEffect, useCallback } from 'react';
import { enemyTemplates } from '../../data/enemies';
import { spells } from '../../data/spells';
import { getModifier } from '../utils/utils';
import InitiativePanel from './InitiativePanel';
import CombatEndPanel from './CombatEndPanel';
import PlayerTurnPanel from './PlayerTurnPanel';
import EnemyDisplay from './EnemyDisplay';

const rollDice = (diceString) => {
    if (!diceString || !diceString.includes('d')) return 0;
    const [num, size] = diceString.split('d').map(Number);
    let totalDamage = 0;
    for (let i = 0; i < num; i++) {
        totalDamage += Math.floor(Math.random() * size) + 1;
    }
    return totalDamage;
};

const CombatPanel = ({
    playerCharacter,
    playerCompanion,
    onCombatEnd,
    addCombatMessage,
    setCombatLog,
    encounterData,
    onPlayerCastSpell,
    onPlayerTakeDamage,
    onReplayCombat,
    combatKey,
    onCompanionTakeDamage
}) => {

    const [combatEnemies, setCombatEnemies] = useState([]);
    const [companionCharacter, setCompanionCharacter] = useState(playerCompanion ? { ...playerCompanion, currentHP: playerCompanion.maxHP } : null);
    const [turnOrder, setTurnOrder] = useState([]);
    const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
    const [combatPhase, setCombatPhase] = useState('initiative-roll');
    const [playerAction, setPlayerAction] = useState(null);
    const [actionTargets, setActionTargets] = useState([]);
    // Les états `defeated` et `victory` sont maintenant gérés par la logique de fin de combat dans le parent.
    // Cependant, nous les conservons ici pour le rendu du CombatEndPanel
    const [defeated, setDefeated] = useState(false);
    const [victory, setVictory] = useState(false);

    // Reset combat phase when combatKey changes (for replay functionality)
    useEffect(() => {
       
        setCombatPhase('initiative-roll');
        setDefeated(false);
        setVictory(false);
        setCombatEnemies([]);
        setTurnOrder([]);
        setCurrentTurnIndex(0);
        setPlayerAction(null);
        setActionTargets([]);
    }, [combatKey]);


    const resetCombat = () => {
        onReplayCombat();
    };



    const handleNextTurn = useCallback(() => {
        if (playerCharacter.currentHP <= 0) {
            setCombatPhase('end');
            setDefeated(true);
            addCombatMessage("Défaite... Tu as perdu connaissance.", 'defeat');
            return;
        }

        let nextIndex = (currentTurnIndex + 1) % turnOrder.length;
        let safetyCounter = 0;
        while (
            safetyCounter < turnOrder.length &&
            (
                (turnOrder[nextIndex].type === 'enemy' && combatEnemies.find(e => e.name === turnOrder[nextIndex].name)?.currentHP <= 0) ||
                (turnOrder[nextIndex].type === 'player' && playerCharacter.currentHP <= 0) ||
                (turnOrder[nextIndex].type === 'companion' && companionCharacter && companionCharacter.currentHP <= 0)
            )
        ) {
            nextIndex = (nextIndex + 1) % turnOrder.length;
            safetyCounter++;
        }

        if (safetyCounter >= turnOrder.length) {
            return;
        }

        setCurrentTurnIndex(nextIndex);
        setCombatPhase('turn');
        setPlayerAction(null);
        setActionTargets([]);
    }, [currentTurnIndex, turnOrder, combatEnemies, addCombatMessage, playerCharacter.currentHP, companionCharacter]);

    const calculateDamage = (attack) => {
        let totalDamage = rollDice(attack.damageDice) + (attack.damageBonus || 0);
        let message = `${totalDamage} dégâts ${attack.damageType}`;

        if (attack.secondaryDamageDice) {
            const secondaryDamage = rollDice(attack.secondaryDamageDice) + (attack.secondaryDamageBonus || 0);
            totalDamage += secondaryDamage;
            message += ` + ${secondaryDamage} dégâts ${attack.secondaryDamageType} (${totalDamage}dmg)`;
        }
        return { damage: totalDamage, message };
    };

    const enemyAttack = useCallback(() => {
        const currentTurnEntity = turnOrder[currentTurnIndex];
        const enemyData = combatEnemies.find(e => e.name === currentTurnEntity.name);

        if (!enemyData || enemyData.currentHP <= 0) {
            addCombatMessage(`${currentTurnEntity.name} est déjà vaincu et ne peut pas attaquer.`);
            handleNextTurn();
            return;
        }

        const attackSet = enemyData.attackSets?.[Math.floor(Math.random() * enemyData.attackSets.length)] || {
            name: enemyData.attacks?.[0]?.name,
            attacks: [enemyData.attacks?.[0]]
        };

        if (!attackSet.attacks[0]) {
            addCombatMessage(`${currentTurnEntity.name} n'a pas d'attaque définie.`);
            handleNextTurn();
            return;
        }

        for (const attack of attackSet.attacks) {
            const attackRoll = Math.floor(Math.random() * 20) + 1 + (attack.attackBonus || 0);
            const targets = [playerCharacter, companionCharacter].filter(c => c && c.currentHP > 0);
            const randomTarget = targets[Math.floor(Math.random() * targets.length)];

            if (!randomTarget) {
                addCombatMessage(`${currentTurnEntity.name} n'a pas de cible valide à attaquer.`);
                handleNextTurn();
                return;
            }

            if (attackRoll >= randomTarget.ac) {
                const { damage, message } = calculateDamage(attack);
                if (randomTarget.type === 'player') {
                    onPlayerTakeDamage(damage, `${currentTurnEntity.name} touche ${randomTarget.name} avec ${attack.name} ! Il inflige ${message}.`);
                } else if (randomTarget.type === 'companion') {
                    onCompanionTakeDamage(damage, `${currentTurnEntity.name} touche ${randomTarget.name} avec ${attack.name} ! Il inflige ${message}.`);
                }
            } else {
                addCombatMessage(`${currentTurnEntity.name} tente d'attaquer avec ${attack.name}, mais rate son attaque.`, 'miss');
            }
        }
        handleNextTurn();
    }, [addCombatMessage, handleNextTurn, onPlayerTakeDamage, playerCharacter, turnOrder, currentTurnIndex, combatEnemies, companionCharacter, onCompanionTakeDamage]);

    const companionAttack = useCallback(() => {
        if (!companionCharacter || companionCharacter.currentHP <= 0) {
            addCombatMessage("Le compagnon est déjà vaincu et ne peut pas agir.");
            handleNextTurn();
            return;
        }

        const livingEnemies = combatEnemies.filter(e => e.currentHP > 0);
        if (livingEnemies.length === 0) {
            addCombatMessage("Il n'y a plus d'ennemis à attaquer.");
            handleNextTurn();
            return;
        }

        const attack = companionCharacter.attacks?.[0];
        if (!attack) {
            addCombatMessage(`${companionCharacter.name} n'a pas d'attaque définie.`);
            handleNextTurn();
            return;
        }

        const target = livingEnemies[Math.floor(Math.random() * livingEnemies.length)];
        const attackBonus = getModifier(companionCharacter.stats.force || companionCharacter.stats.dexterite);
        const attackRoll = Math.floor(Math.random() * 20) + 1 + attackBonus;
        if (attackRoll >= target.ac) {
            const { damage, message } = calculateDamage(attack);

            const updatedEnemies = combatEnemies.map(enemy => {
                if (enemy.name === target.name) {
                    const newHP = Math.max(0, enemy.currentHP - damage);
                    return { ...enemy, currentHP: newHP };
                }
                return enemy;
            });
            setCombatEnemies(updatedEnemies);
            addCombatMessage(`${companionCharacter.name} touche ${target.name} avec ${attack.name} ! Il inflige ${message}.`, 'player-damage');
            if (updatedEnemies.find(e => e.name === target.name).currentHP <= 0) {
                addCombatMessage(`${target.name} a été vaincu !`);
            }
        } else {
            addCombatMessage(`${companionCharacter.name} tente d'attaquer avec ${attack.name}, mais rate son attaque.`, 'miss');
        }

        handleNextTurn();
    }, [addCombatMessage, handleNextTurn, combatEnemies, companionCharacter]);

    const handleTargetSelection = useCallback(
        (enemy) => {
            const maxTargets = playerAction?.projectiles || 1;
            setActionTargets((prevTargets) => {
                const newTargets = [...prevTargets, enemy];
                return newTargets;
            });
        },
        [playerAction]
    );

    const handleCastSpellClick = useCallback(() => {
        const spell = playerAction;
        const targets = actionTargets;

        const spellUsedSuccessfully = onPlayerCastSpell(spell);
        if (!spellUsedSuccessfully) {
            setPlayerAction(null);
            setActionTargets([]);
            return;
        }

        let updatedEnemies = [...combatEnemies];
        const defeatedThisTurn = new Set();

        targets.forEach((target) => {
            const index = updatedEnemies.findIndex((e) => e.name === target.name);
            if (index !== -1 && updatedEnemies[index].currentHP > 0) {
                let damage = 0;

                if (spell.requiresAttackRoll) {
                    const spellAttackBonus = playerCharacter.proficiencyBonus + getModifier(playerCharacter.stats.intelligence);
                    const attackRoll = Math.floor(Math.random() * 20) + 1 + spellAttackBonus;
                    if (attackRoll >= updatedEnemies[index].ac) {
                        damage = rollDice(spell.damage.dice) + (spell.damage.bonus || 0);
                        updatedEnemies[index].currentHP = Math.max(0, updatedEnemies[index].currentHP - damage);
                        addCombatMessage(
                            `Le sort "${spell.name}" touche ${target.name} (Jet d'attaque: ${attackRoll}) et inflige ${damage} dégâts de ${spell.damage.type} !`, 'player-damage'
                        );
                    } else {
                        addCombatMessage(`Le sort "${spell.name}" rate ${target.name} (Jet d'attaque: ${attackRoll}).`, 'miss');
                    }
                } else {
                    damage = rollDice(spell.damage.dice) + (spell.damage.bonus || 0);
                    updatedEnemies[index].currentHP = Math.max(0, updatedEnemies[index].currentHP - damage);
                    addCombatMessage(`Le sort "${spell.name}" frappe ${target.name} et inflige ${damage} dégâts de ${spell.damage.type} !`, 'player-damage');
                }

                if (updatedEnemies[index].currentHP <= 0 && !defeatedThisTurn.has(updatedEnemies[index].name)) {
                    addCombatMessage(`${updatedEnemies[index].name} a été vaincu !`);
                    defeatedThisTurn.add(updatedEnemies[index].name);
                }
            }
        });

        setCombatEnemies(updatedEnemies);
        setPlayerAction(null);
        setActionTargets([]);
        handleNextTurn();
    }, [playerAction, actionTargets, onPlayerCastSpell, combatEnemies, playerCharacter, addCombatMessage, handleNextTurn]);

    useEffect(() => {
        if (playerAction && actionTargets.length === (playerAction.projectiles || 1)) {
            handleCastSpellClick();
        }
    }, [actionTargets, playerAction, handleCastSpellClick]);


    useEffect(() => {
        if (combatPhase === 'end' || combatEnemies.length === 0) {
            return;
        }

        const allEnemiesDefeated = combatEnemies.every(enemy => enemy.currentHP <= 0);
        if (allEnemiesDefeated) {
            setCombatPhase('end');
            setVictory(true);
            addCombatMessage("Victoire ! Les ennemis sont vaincus.", 'victory');
        }
    }, [combatEnemies, combatPhase, addCombatMessage]);

    useEffect(() => {
        if (combatPhase === 'end') {
            return;
        }
        if (combatPhase !== 'initiative-roll' || !encounterData || !encounterData.length) {
            return;
        }
        const initialCombatEnemies = encounterData.flatMap((encounter) => {
            const template = enemyTemplates[encounter.type];
            if (!template) {
                return [];
            }
            return Array(encounter.count)
                .fill(null)
                .map((_, index) => ({
                    ...template,
                    name: `${template.name} ${index + 1}`,
                    id: encounter.type,
                    ac: template.ac || 10,
                    currentHP: template.currentHP ?? template.maxHP ?? 10,
                    maxHP: template.maxHP ?? 10,
                    stats: { ...template.stats },
                    attacks: [...(template.attacks || [])],
                    image: template.image || '',
                }));
        });
        if (!initialCombatEnemies.length) {
            addCombatMessage("Erreur lors du chargement des ennemis. Le combat se termine.");
            setCombatPhase('end');
            return;
        }
        const enemiesWithInitiative = initialCombatEnemies.map((enemy) => ({
            ...enemy,
            initiative: Math.floor(Math.random() * 20) + 1 + getModifier(enemy.stats.dexterite),
            type: 'enemy',
        }));
        addCombatMessage('Un combat commence !');
        const playerDexMod = getModifier(playerCharacter.stats.dexterite);
        const playerInitiative = Math.floor(Math.random() * 20) + 1 + playerDexMod;
        const playerWithInitiative = {
            ...playerCharacter,
            initiative: playerInitiative,
            type: 'player',
            ac: playerCharacter.ac || 10,
        };
        const combatants = [playerWithInitiative, ...enemiesWithInitiative];
        if (playerCompanion) {
            const companionDexMod = getModifier(playerCompanion.stats.dexterite);
            const companionInitiative = Math.floor(Math.random() * 20) + 1 + companionDexMod;
            const companionWithInitiative = {
                ...playerCompanion,
                initiative: companionInitiative,
                type: 'companion',
                ac: playerCompanion.ac || 10,
            };
            combatants.push(companionWithInitiative);
        }
        const order = combatants.sort((a, b) => {
            if (b.initiative === a.initiative) {
                if (a.type === 'player') return -1;
                if (b.type === 'player') return 1;
                if (a.type === 'companion') return -1;
                if (b.type === 'companion') return 1;
                return 0;
            }
            return b.initiative - a.initiative;
        });
        setCombatEnemies(enemiesWithInitiative);
        setTurnOrder(order);
        order.forEach((entity) => {
            addCombatMessage(`${entity.name} a lancé l'initiative et a obtenu ${entity.initiative}.`, 'initiative');
        });
    }, [encounterData, playerCharacter, playerCompanion, addCombatMessage, combatPhase, combatKey]);

    useEffect(() => {
        if (combatPhase === 'initiative-roll' || combatPhase === 'end' || !turnOrder.length) return;
        const currentTurnEntity = turnOrder[currentTurnIndex];
        const isPlayerTurn = currentTurnEntity.type === 'player';
        const isCompanionTurn = currentTurnEntity.type === 'companion';
        const isEnemyTurn = currentTurnEntity.type === 'enemy';
        let entityInState = null;
        if (isPlayerTurn) {
            entityInState = playerCharacter;
        } else if (isCompanionTurn) {
            entityInState = companionCharacter;
        } else {
            entityInState = combatEnemies.find((e) => e.name === currentTurnEntity.name);
        }
        if (entityInState && entityInState.currentHP <= 0) {
            addCombatMessage(`${currentTurnEntity.name} est déjà vaincu. On passe au suivant.`);
            handleNextTurn();
            return;
        }
        if (combatPhase === 'turn') {
            if (isPlayerTurn) {
                // Vérifier si le joueur est vaincu avant de lui donner la main.
                // Cela empêche le combat de se bloquer si le joueur est mort mais que son tour arrive.
                if (playerCharacter.currentHP <= 0) {
                    addCombatMessage("Tu es vaincu et ne peux pas agir. Le combat se termine.");
                    setCombatPhase('end');
                    setDefeated(true);
                    return;
                }
                setCombatPhase('player-action');
                addCombatMessage("C'est ton tour !");
            } else if (isCompanionTurn) {
                addCombatMessage(`C'est le tour de ${currentTurnEntity.name}...`);
                const timer = setTimeout(() => companionAttack(), 400);
                return () => clearTimeout(timer);
            } else if (isEnemyTurn) {
                addCombatMessage(`C'est le tour de ${currentTurnEntity.name}...`);
                const timer = setTimeout(() => enemyAttack(), 400);
                return () => clearTimeout(timer);
            }
        }
    }, [currentTurnIndex, combatPhase, turnOrder, addCombatMessage, enemyAttack, companionAttack, combatEnemies, handleNextTurn, playerCharacter, companionCharacter]);

    return (
        <div>
            <EnemyDisplay
                combatEnemies={combatEnemies}
                onSelectTarget={playerAction ? handleTargetSelection : null}
                selectedTargets={actionTargets}
            />

            {combatPhase === 'initiative-roll' && <InitiativePanel onStartCombat={() => setCombatPhase('turn')} />}

            {combatPhase === 'end' && (
                <>
                    <CombatEndPanel
                        onContinue={() => {
                           
                            setCombatLog([]);
                            if (victory) {
                                onCombatEnd(encounterData);
                            } else {
                                onCombatEnd([]);
                            }
                        }}
                        hasWon={victory}
                    />
                    {defeated && (
                        <>
                            <p>Tu as été vaincu. Tu peux rejouer le combat ou continuer l'aventure.</p>
                            <button onClick={resetCombat} style={{ marginTop: '10px' }}>
                                Rejouer le combat
                            </button>
                        </>
                    )}
                </>
            )}

            {combatPhase === 'player-action' && (
                <PlayerTurnPanel
                    playerCharacter={playerCharacter}
                    onSelectSpell={setPlayerAction}
                    onPassTurn={() => {
                        setPlayerAction(null);
                        handleNextTurn();
                    }}
                    selectedSpell={playerAction}
                    selectedTargets={actionTargets}
                />
            )}

            {combatPhase === 'turn' && <p>Le combat est en cours...</p>}
        </div>
    );
};

export default CombatPanel;