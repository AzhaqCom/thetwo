import { useState, useEffect, useCallback, useRef } from 'react';
import { enemyTemplates } from '../../data/enemies';
import { getModifier } from '../utils/utils';
import { useCombatMovement } from '../../hooks/useCombatMovement';

export const useCombatManager = ({
    playerCharacter,
    playerCompanion,
    encounterData,
    addCombatMessage,
    onPlayerTakeDamage,
    onCompanionTakeDamage,
    combatKey
}) => {
    // Core combat state
    const [combatEnemies, setCombatEnemies] = useState([]);
    const [companionCharacter, setCompanionCharacter] = useState(null);
    const [turnOrder, setTurnOrder] = useState([]);
    const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
    const [combatPhase, setCombatPhase] = useState('initializing');
    const [playerAction, setPlayerAction] = useState(null);
    const [actionTargets, setActionTargets] = useState([]);
    const [defeated, setDefeated] = useState(false);
    const [victory, setVictory] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Track previous combatKey to detect actual changes
    const prevCombatKeyRef = useRef(undefined);

    // Combat movement hook - must be declared before initializeCombat
    const combatMovement = useCombatMovement(
        playerCharacter,
        companionCharacter,
        combatEnemies,
        addCombatMessage,
        onPlayerTakeDamage,
        onCompanionTakeDamage
    );

    // Initialize combat when encounterData is available
    const initializeCombat = useCallback(() => {
        
        
        // Create enemies from encounter data
        const initialCombatEnemies = encounterData.flatMap((encounter, encounterIndex) => {
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
                    type: 'enemy',
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
            return;
        }

       

        // Roll initiative for enemies
        const enemiesWithInitiative = initialCombatEnemies.map((enemy) => ({
            ...enemy,
            initiative: Math.floor(Math.random() * 20) + 1 + getModifier(enemy.stats.dexterite),
        }));

        // Roll initiative for player
        const playerDexMod = getModifier(playerCharacter.stats.dexterite);
        const playerInitiative = Math.floor(Math.random() * 20) + 1 + playerDexMod;
        const playerWithInitiative = {
            ...playerCharacter,
            initiative: playerInitiative,
            type: 'player',
            name: playerCharacter.name,
            ac: playerCharacter.ac || 10,
        };

        // Create combatants array
        const combatants = [playerWithInitiative, ...enemiesWithInitiative];

        // Add companion if exists
        if (playerCompanion) {
            const companionDexMod = getModifier(playerCompanion.stats.dexterite);
            const companionInitiative = Math.floor(Math.random() * 20) + 1 + companionDexMod;
            const companionWithInitiative = {
                ...playerCompanion,
                initiative: companionInitiative,
                type: 'companion',
                name: playerCompanion.name,
                ac: playerCompanion.ac || 10,
            };
            combatants.push(companionWithInitiative);
        }

        // Sort by initiative (highest first, player wins ties)
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

       

        // Update state
        setCombatEnemies(enemiesWithInitiative);
        setTurnOrder(order);
        setIsInitialized(true);

        // Initialize positions
        // Extract enemyPositions from the scene action (passed via encounterData)
        const customEnemyPositions = encounterData.enemyPositions || null;
        combatMovement.initializeCombatPositions(initialCombatEnemies, !!playerCompanion, customEnemyPositions);

        // Add combat messages
        addCombatMessage('Un combat commence !');
        order.forEach((entity) => {
            addCombatMessage(`${entity.name} a lancé l'initiative et a obtenu ${entity.initiative}.`, 'initiative');
        });

        // Move to initiative display phase
        setCombatPhase('initiative-display');
        
     
    }, [encounterData, playerCharacter, playerCompanion, addCombatMessage, combatMovement]);

    // Initialize combat when encounterData is available
    useEffect(() => {
          console.log('🎮 Combat initialization check:', { 
            encounterData: !!encounterData, 
            isInitialized, 
            combatKey,
            prevCombatKey: prevCombatKeyRef.current,
            phase: combatPhase 
                  }          );

        // Reset on new combat (only when combatKey actually changes)
        if (combatKey !== undefined && combatKey !== prevCombatKeyRef.current) {
         
            prevCombatKeyRef.current = combatKey;
            setIsInitialized(false);
            setDefeated(false);
            setVictory(false);
            setCombatPhase('initializing');
            setCurrentTurnIndex(0);
            setPlayerAction(null);
            setActionTargets([]);
            setCombatEnemies([]);
            setTurnOrder([]);
            combatMovement.setCombatPositions({});
            combatMovement.setShowMovementFor(null);
            combatMovement.setShowTargetingFor(null);
            combatMovement.setHasMovedThisTurn(false);
            combatMovement.setSelectedAoESquares([]);
            combatMovement.setAoECenter(null);
            return; // Exit early to let the reset take effect
        }

        // Initialize combat if not already done and we have encounter data
        if (!isInitialized && encounterData && encounterData.length > 0) {
           
            initializeCombat();
        }
    }, [encounterData, combatKey, combatMovement, initializeCombat, isInitialized]);

    // Debug: Log enemy positions when they change
    useEffect(() => {
        if (encounterData && encounterData.enemyPositions) {
            console.log('🎯 Enemy positions from scene:', encounterData.enemyPositions);
        }
    }, [encounterData]);

    // Update companion when playerCompanion changes
    useEffect(() => {
        if (playerCompanion) {
            setCompanionCharacter({ ...playerCompanion });
        } else {
            setCompanionCharacter(null);
        }
    }, [playerCompanion]);

    // Check for victory condition
    useEffect(() => {
        if (combatPhase === 'end' || combatEnemies.length === 0 || combatPhase === 'initializing') {
            return;
        }

        const allEnemiesDefeated = combatEnemies.every(enemy => enemy.currentHP <= 0);
        
        if (allEnemiesDefeated) {
            setCombatPhase('end');
            setVictory(true);
            addCombatMessage("Victoire ! Tous les ennemis ont été vaincus.", 'victory');
        }
    }, [combatEnemies, combatPhase, addCombatMessage]);

    const handleNextTurn = useCallback(() => {
        if (playerCharacter.currentHP <= 0) {
            
            setCombatPhase('end');
            setDefeated(true);
            addCombatMessage("Défaite... Tu as perdu connaissance.", 'defeat');
            return;
        }

        let nextIndex = (currentTurnIndex + 1) % turnOrder.length;
        let safetyCounter = 0;
        
        // Skip defeated characters
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
        
        // Reset turn-specific state
        setPlayerAction(null);
        setActionTargets([]);
        combatMovement.setSelectedAoESquares([]);
        combatMovement.setAoECenter(null);
        combatMovement.setShowMovementFor(null);
        combatMovement.setShowTargetingFor(null);
        combatMovement.setHasMovedThisTurn(false);
    }, [currentTurnIndex, turnOrder, combatEnemies, addCombatMessage, playerCharacter.currentHP, companionCharacter, combatMovement]);

    const startCombat = useCallback(() => {
        setCombatPhase('turn');
        setCurrentTurnIndex(0);
    }, []);

    return {
        // State
        combatEnemies,
        setCombatEnemies,
        companionCharacter,
        setCompanionCharacter,
        turnOrder,
        setTurnOrder,
        currentTurnIndex,
        setCurrentTurnIndex,
        combatPhase,
        setCombatPhase,
        playerAction,
        setPlayerAction,
        actionTargets,
        setActionTargets,
        defeated,
        setDefeated,
        victory,
        setVictory,
        isInitialized,
        
        // Combat movement
        ...combatMovement,
        
        // Functions
        handleNextTurn,
        startCombat,
        initializeCombat
    };
};