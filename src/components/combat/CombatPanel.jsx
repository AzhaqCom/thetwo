import React, { useState, useEffect, useCallback } from 'react';
import { enemyTemplates } from '../../data/enemies';
import { spells } from '../../data/spells';
import { getModifier } from '../utils/utils';
import { rollDice, calculateDamage, getTargetsInRange } from '../utils/combatUtils';
import { useCombatMovement } from '../../hooks/useCombatMovement';
import InitiativePanel from './InitiativePanel';
import CombatEndPanel from './CombatEndPanel';
import PlayerTurnPanel from './PlayerTurnPanel';
import CombatGrid from './CombatGrid';

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
    
    // Use combat movement hook
    const {
        combatPositions,
        setCombatPositions,
        showMovementFor,
        setShowMovementFor,
        showTargetingFor,
        setShowTargetingFor,
        hasMovedThisTurn,
        setHasMovedThisTurn,
        selectedAoESquares,
        setSelectedAoESquares,
        aoeCenter,
        setAoECenter,
        initializeCombatPositions,
        handleMoveCharacter,
        updateEnemyPosition,
        calculateEnemyMovementPosition
    } = useCombatMovement(
        playerCharacter,
        companionCharacter,
        combatEnemies,
        addCombatMessage,
        onPlayerTakeDamage,
        onCompanionTakeDamage
    );
    
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
        setCombatPositions({});
        setShowMovementFor(null);
        setShowTargetingFor(null);
        setHasMovedThisTurn(false);
        setSelectedAoESquares([]);
        setAoECenter(null);
    }, [combatKey]);


    const resetCombat = () => {
        onReplayCombat();
    };

    const handlePlayerMoveCharacter = useCallback((characterId, newPosition) => {
        handleMoveCharacter(characterId, newPosition);
        // After moving, go to action phase
        setCombatPhase('player-action');
    }, [handleMoveCharacter]);


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
        setSelectedAoESquares([]);
        setAoECenter(null);
        setShowMovementFor(null);
        setShowTargetingFor(null);
        setHasMovedThisTurn(false);
    }, [currentTurnIndex, turnOrder, combatEnemies, addCombatMessage, playerCharacter.currentHP, companionCharacter]);

    const enemyAttack = useCallback(() => {
        const currentTurnEntity = turnOrder[currentTurnIndex];
        const enemyData = combatEnemies.find(e => e.name === currentTurnEntity.name);

        if (!enemyData || enemyData.currentHP <= 0) {
            addCombatMessage(`${currentTurnEntity.name} est déjà vaincu et ne peut pas attaquer.`);
            handleNextTurn();
            return;
        }

        // First, handle enemy movement
        const enemyPos = combatPositions[enemyData.name];
        if (enemyPos) {
            const newPosition = calculateEnemyMovementPosition(enemyData);
            if (newPosition && (newPosition.x !== enemyPos.x || newPosition.y !== enemyPos.y)) {
                updateEnemyPosition(enemyData.name, newPosition);
                addCombatMessage(`${enemyData.name} se déplace vers une meilleure position.`);
            }
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

        // Now handle attacks with updated position
        const updatedEnemyPos = combatPositions[enemyData.name];
        for (const attack of attackSet.attacks) {
            const attackRoll = Math.floor(Math.random() * 20) + 1 + (attack.attackBonus || 0);
            const availableTargets = getTargetsInRange(
                { ...enemyData, type: 'enemy' }, 
                updatedEnemyPos, 
                attack, 
                {
                    playerCharacter,
                    companionCharacter,
                    combatEnemies,
                    combatPositions
                }
            );
            
            if (availableTargets.length === 0) {
                addCombatMessage(`${currentTurnEntity.name} n'a pas de cible à portée pour attaquer.`);
                continue;
            }
            
            const randomTarget = availableTargets[Math.floor(Math.random() * availableTargets.length)];

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
        if (!companionCharacter) {
            addCombatMessage("Aucun compagnon disponible pour attaquer.");
            handleNextTurn();
            return;
        }

        if (companionCharacter.currentHP <= 0) {
            addCombatMessage("Le compagnon est déjà vaincu et ne peut pas agir.");
            handleNextTurn();
            return;
        }

        // Always attempt companion movement each turn
        const companionPos = combatPositions.companion;
        const livingEnemies = combatEnemies.filter(e => e.currentHP > 0);
        
        if (livingEnemies.length === 0) {
            addCombatMessage("Il n'y a plus d'ennemis à attaquer.");
            handleNextTurn();
            return;
        }
        
        if (companionPos) {
            // Calculate movement toward closest enemy
            const newPosition = calculateEnemyMovementPosition({ 
                ...companionCharacter, 
                type: 'companion',
                movement: 6,
                attacks: companionCharacter.attacks // Ensure attacks are passed for range calculation
            });
            
            if (newPosition && (newPosition.x !== companionPos.x || newPosition.y !== companionPos.y)) {
                updateEnemyPosition('companion', newPosition);
                addCombatMessage(`${companionCharacter.name} se déplace vers une meilleure position.`);
            } else {
                addCombatMessage(`${companionCharacter.name} reste en position.`);
            }
        }

        const attack = companionCharacter.attacks?.[0];
        if (!attack) {
            addCombatMessage(`${companionCharacter.name} n'a pas d'attaque définie.`);
            handleNextTurn();
            return;
        }

        // Handle attacks with updated position
        const updatedCompanionPos = combatPositions.companion;
        const availableTargets = getTargetsInRange(
            { ...companionCharacter, type: 'companion' }, 
            updatedCompanionPos, 
            { ...attack, type: 'corps-à-corps' }, // Ensure attack type is set for range calculation
            {
                playerCharacter,
                companionCharacter,
                combatEnemies,
                combatPositions
            }
        );
        
        if (availableTargets.length === 0) {
            addCombatMessage(`${companionCharacter.name} n'a pas de cible à portée pour attaquer.`);
            handleNextTurn();
            return;
        }
        
        const target = availableTargets[Math.floor(Math.random() * availableTargets.length)];
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
    }, [addCombatMessage, handleNextTurn, combatEnemies, companionCharacter, combatPositions, calculateEnemyMovementPosition, updateEnemyPosition, playerCharacter, getTargetsInRange, calculateDamage, getModifier]);

    const handleTargetSelection = useCallback(
        (enemy) => {
            if (playerAction?.areaOfEffect) {
                // Handle AoE spell targeting
                const centerPos = combatPositions[enemy.name] || findPositionByCharacter(enemy);
                if (centerPos) {
                    setAoECenter(centerPos);
                    const affectedSquares = calculateAoESquares(centerPos, playerAction.areaOfEffect);
                    setSelectedAoESquares(affectedSquares);
                    
                    // Find all targets in affected squares
                    const targets = [];
                    affectedSquares.forEach(square => {
                        const targetAtSquare = findCharacterAtPosition(square.x, square.y);
                        if (targetAtSquare && targetAtSquare.currentHP > 0) {
                            targets.push(targetAtSquare);
                        }
                    });
                    setActionTargets(targets);
                }
            } else {
                // Handle single target or projectile spells
                const maxTargets = playerAction?.projectiles || 1;
                setActionTargets((prevTargets) => {
                    const newTargets = [...prevTargets, enemy];
                    return newTargets;
                });
            }
        },
        [playerAction, combatPositions]
    );

    const calculateAoESquares = useCallback((center, aoeType) => {
        const squares = [];
        
        switch (aoeType.shape) {
            case 'sphere':
                const radius = Math.floor(aoeType.radius / 5); // Convert feet to squares
                for (let x = center.x - radius; x <= center.x + radius; x++) {
                    for (let y = center.y - radius; y <= center.y + radius; y++) {
                        if (x >= 0 && x < 8 && y >= 0 && y < 6) {
                            const distance = Math.sqrt(Math.pow(x - center.x, 2) + Math.pow(y - center.y, 2));
                            if (distance <= radius) {
                                squares.push({ x, y });
                            }
                        }
                    }
                }
                break;
            case 'cube':
                const size = Math.floor(aoeType.size / 5); // Convert feet to squares
                for (let x = center.x; x < center.x + size && x < 8; x++) {
                    for (let y = center.y; y < center.y + size && y < 6; y++) {
                        if (x >= 0 && y >= 0) {
                            squares.push({ x, y });
                        }
                    }
                }
                break;
        }
        
        return squares;
    }, []);

    const findCharacterAtPosition = useCallback((x, y) => {
        // Check player
        if (combatPositions.player && combatPositions.player.x === x && combatPositions.player.y === y) {
            return { ...playerCharacter, id: 'player', name: playerCharacter.name };
        }
        
        // Check companion
        if (combatPositions.companion && combatPositions.companion.x === x && combatPositions.companion.y === y && companionCharacter) {
            return { ...companionCharacter, id: 'companion', name: companionCharacter.name };
        }
        
        // Check enemies
        for (const enemy of combatEnemies) {
            const enemyPos = combatPositions[enemy.name];
            if (enemyPos && enemyPos.x === x && enemyPos.y === y) {
                return enemy;
            }
        }
        
        return null;
    }, [combatPositions, playerCharacter, companionCharacter, combatEnemies]);

    const findPositionByCharacter = useCallback((character) => {
        if (character.id === 'player') return combatPositions.player;
        if (character.id === 'companion') return combatPositions.companion;
        return combatPositions[character.name];
    }, [combatPositions]);

    const calculateDistance = useCallback((pos1, pos2) => {
        if (!pos1 || !pos2) return Infinity;
        return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y); // Manhattan distance
    }, []);

    const isInRange = useCallback((casterPos, targetPos, spell) => {
        const distance = calculateDistance(casterPos, targetPos);
        
        if (spell.range === 'touch' || spell.range === 'melee') {
            return distance <= 1; // Adjacent squares only
        } else if (spell.range === 'ranged' || typeof spell.range === 'number') {
            return distance <= 12; // Assume 60 feet = 12 squares for most ranged spells
        }
        
        return true; // Unlimited range
    }, [calculateDistance]);

    const handleCastSpellClick = useCallback(() => {
        const spell = playerAction;
        const targets = actionTargets;

        // Validate range for all targets
        const playerPos = combatPositions.player;
        const invalidTargets = targets.filter(target => {
            const targetPos = findPositionByCharacter(target);
            return !isInRange(playerPos, targetPos, spell);
        });
        
        if (invalidTargets.length > 0) {
            addCombatMessage(`Certaines cibles sont hors de portée du sort.`, 'miss');
            setPlayerAction(null);
            setActionTargets([]);
            setSelectedAoESquares([]);
            setAoECenter(null);
            setShowTargetingFor(null);
            return;
        }
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
        setSelectedAoESquares([]);
        setAoECenter(null);
        setShowTargetingFor(null);
        handleNextTurn();
    }, [playerAction, actionTargets, onPlayerCastSpell, combatEnemies, playerCharacter, addCombatMessage, handleNextTurn, combatPositions, findPositionByCharacter, isInRange]);

    useEffect(() => {
        if (playerAction && actionTargets.length === (playerAction.projectiles || 1)) {
            handleCastSpellClick();
        }
    }, [actionTargets, playerAction, handleCastSpellClick]);


    useEffect(() => {
        // Update companion character state when playerCompanion changes
        if (playerCompanion) {
            setCompanionCharacter(prev => {
                if (!prev || prev.name !== playerCompanion.name) {
                    return { ...playerCompanion };
                }
                // Update HP but keep other combat state
                return { ...prev, currentHP: playerCompanion.currentHP, maxHP: playerCompanion.maxHP };
            });
        } else {
            setCompanionCharacter(null);
        }
    }, [playerCompanion]);

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
        initializeCombatPositions(initialCombatEnemies, !!playerCompanion);
        order.forEach((entity) => {
            addCombatMessage(`${entity.name} a lancé l'initiative et a obtenu ${entity.initiative}.`, 'initiative');
        });
    }, [encounterData, playerCharacter, playerCompanion, addCombatMessage, combatPhase, combatKey, initializeCombatPositions]);

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
            if (isCompanionTurn) {
                addCombatMessage(`${currentTurnEntity.name} est vaincu et ne peut pas agir.`);
            } else {
                addCombatMessage(`${currentTurnEntity.name} est déjà vaincu. On passe au suivant.`);
            }
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
                // Start with movement phase
                setCombatPhase('player-movement');
                addCombatMessage("C'est ton tour !");
                setShowMovementFor('player');
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
        <div className="combat-panel-container">
            <CombatGrid
                playerCharacter={playerCharacter}
                playerCompanion={companionCharacter}
                combatEnemies={combatEnemies}
                onSelectTarget={handleTargetSelection}
                selectedTargets={actionTargets}
                currentTurnIndex={currentTurnIndex}
                turnOrder={turnOrder}
                onMoveCharacter={handleMoveCharacter}
                combatPositions={combatPositions}
                showMovementFor={showMovementFor}
                showTargetingFor={showTargetingFor}
                selectedAoESquares={selectedAoESquares}
                aoeCenter={aoeCenter}
            />

            <div className="combat-controls">
                {combatPhase === 'initiative-roll' && <InitiativePanel onStartCombat={() => setCombatPhase('turn')} />}

                {combatPhase === 'player-movement' && (
                    <div>
                        <h3>Phase de Mouvement</h3>
                        <p>Clique sur une case verte pour te déplacer (6 cases maximum).</p>
                        <button onClick={() => {
                            setShowMovementFor(null);
                            setCombatPhase('player-action');
                        }}>
                            Passer le mouvement
                        </button>
                    </div>
                )}

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
                        onSelectSpell={(spell) => {
                            setPlayerAction(spell);
                            setShowTargetingFor('player');
                        }}
                        onPassTurn={() => {
                            setPlayerAction(null);
                            setShowTargetingFor(null);
                            handleNextTurn();
                        }}
                        selectedSpell={playerAction}
                        selectedTargets={actionTargets}
                    />
                )}

                {combatPhase === 'turn' && <p>Le combat est en cours...</p>}
            </div>
        </div>
    );
};

export default CombatPanel;