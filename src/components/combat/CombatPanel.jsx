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
    onCombatEnd,
    addCombatMessage,
    setCombatLog,
    encounterData,
    onPlayerCastSpell,
    onPlayerTakeDamage,
    onReplayCombat,
    combatKey
}) => {
    const [combatEnemies, setCombatEnemies] = useState([]);
    const [playerHP, setPlayerHP] = useState(playerCharacter.maxHP);
    const [turnOrder, setTurnOrder] = useState([]);
    const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
    const [combatPhase, setCombatPhase] = useState('initiative-roll');
    const [playerAction, setPlayerAction] = useState(null);
    const [actionTargets, setActionTargets] = useState([]);
    const [defeated, setDefeated] = useState(false);
    // NOUVEAU : État pour le statut de victoire
    const [victory, setVictory] = useState(false);

    const resetCombat = () => {
        onReplayCombat();
    };

    // Detect player death
    useEffect(() => {
        if (playerCharacter.currentHP <= 0 && combatPhase !== 'end') {
            addCombatMessage("Défaite... Tu as perdu connaissance.", 'defeat');
            setDefeated(true);
            setCombatPhase('end');
        }
    }, [playerCharacter.currentHP, combatPhase, addCombatMessage]);

    // Move to next turn
    const handleNextTurn = useCallback(() => {
        const allEnemiesDefeated = combatEnemies.every(enemy => enemy.currentHP <= 0);
        if (allEnemiesDefeated) {
            setCombatPhase('end');
            setVictory(true); // NOUVEAU : Le joueur a gagné
            addCombatMessage("Victoire ! Les ennemis sont vaincus.", 'victory');
            return;
        }

        let nextIndex = (currentTurnIndex + 1) % turnOrder.length;
        let safetyCounter = 0;
        while (
            safetyCounter < turnOrder.length &&
            ((turnOrder[nextIndex].type === 'enemy' && combatEnemies.find(e => e.name === turnOrder[nextIndex].name)?.currentHP <= 0) ||
                (turnOrder[nextIndex].type === 'player' && playerCharacter.currentHP <= 0))
        ) {
            nextIndex = (nextIndex + 1) % turnOrder.length;
            safetyCounter++;
        }

        setCurrentTurnIndex(nextIndex);
        setCombatPhase('turn');
        setPlayerAction(null);
        setActionTargets([]);
    }, [currentTurnIndex, turnOrder, combatEnemies, addCombatMessage, playerCharacter.currentHP]);

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

        addCombatMessage(`${currentTurnEntity.name} utilise ${attackSet.name} !`);

        for (const attack of attackSet.attacks) {
            const attackRoll = Math.floor(Math.random() * 20) + 1 + (attack.attackBonus || 0);
            const playerAC = playerCharacter.ac;

            if (attackRoll >= playerAC) {
                const { damage, message } = calculateDamage(attack);
                onPlayerTakeDamage(damage, `${currentTurnEntity.name} touche avec ${attack.name} ! Il inflige ${message}.`);
            } else {
                addCombatMessage(`${currentTurnEntity.name} tente d'attaquer avec ${attack.name}, mais rate son attaque.`, 'miss');
            }
        }

        handleNextTurn();
    }, [addCombatMessage, handleNextTurn, onPlayerTakeDamage, playerCharacter.ac, turnOrder, currentTurnIndex, combatEnemies]);

    const handleTargetSelection = useCallback(
        (enemy) => {
            const maxTargets = playerAction?.projectiles || 1;
            setActionTargets((prevTargets) => {
                if (prevTargets.length >= maxTargets) return prevTargets;
                return [...prevTargets, enemy];
            });
        },
        [playerAction, actionTargets]
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
        if (combatPhase !== 'initiative-roll' || !encounterData || !encounterData.length) {
            return;
        }

        const initialCombatEnemies = encounterData.flatMap((encounter) => {
            const template = enemyTemplates[encounter.type];
            if (!template) {
                console.error(`Modèle d'ennemi non trouvé pour le type : ${encounter.type}`);
                return [];
            }
            return Array(encounter.count)
                .fill(null)
                .map((_, index) => ({
                    ...template,
                    name: `${template.name} ${index + 1}`,
                    id: encounter.type, // NOUVEAU : on ajoute l'id pour le retrouver plus facilement
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

        setCombatEnemies(enemiesWithInitiative);
        addCombatMessage('Un combat commence !');

        const playerDexMod = getModifier(playerCharacter.stats.dexterite);
        const playerInitiative = Math.floor(Math.random() * 20) + 1 + playerDexMod;
        const playerWithInitiative = {
            ...playerCharacter,
            initiative: playerInitiative,
            type: 'player',
            ac: playerCharacter.ac || 10,
        };

        const order = [...enemiesWithInitiative, playerWithInitiative].sort((a, b) => {
            if (b.initiative === a.initiative) {
                if (a.type === 'player') return -1;
                if (b.type === 'player') return 1;
                return 0;
            }
            return b.initiative - a.initiative;
        });

        setTurnOrder(order);

        order.forEach((entity) => {
            addCombatMessage(`${entity.name} a lancé l'initiative et a obtenu ${entity.initiative}.`, 'initiative');
        });

    }, [encounterData, playerCharacter, addCombatMessage, combatPhase, combatKey]);

    useEffect(() => {
        if (combatPhase === 'initiative-roll' || combatPhase === 'end' || !turnOrder.length) return;

        const currentTurnEntity = turnOrder[currentTurnIndex];
        const isPlayerTurn = currentTurnEntity.type === 'player';
        const entityInState = combatEnemies.find((e) => e.name === currentTurnEntity.name);

        if (entityInState && entityInState.currentHP <= 0) {
            addCombatMessage(`${currentTurnEntity.name} est déjà vaincu. On passe au suivant.`);
            handleNextTurn();
            return;
        }

        if (combatPhase === 'turn') {
            if (isPlayerTurn) {
                setCombatPhase('player-action');
                addCombatMessage("C'est ton tour !");
            } else {
                addCombatMessage(`C'est le tour de ${currentTurnEntity.name}...`);
                const timer = setTimeout(() => enemyAttack(), 400);
                return () => clearTimeout(timer);
            }
        }
    }, [currentTurnIndex, combatPhase, turnOrder, addCombatMessage, enemyAttack, combatEnemies, handleNextTurn]);

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
                        <button onClick={resetCombat} style={{ marginTop: '10px' }}>
                            Rejouer le combat
                        </button>
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