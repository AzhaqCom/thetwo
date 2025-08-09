import React, { useEffect } from 'react';
import { enemyTemplates } from '../../data/enemies';
import { getModifier } from '../utils/utils';

const CombatInitializer = ({
    combatPhase,
    encounterData,
    playerCharacter,
    playerCompanion,
    combatKey,
    setCombatEnemies,
    setTurnOrder,
    initializeCombatPositions,
    addCombatMessage
}) => {
    // Initialize combat when phase is 'initiative-roll'
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
        
        // Initialize positions after a small delay to ensure state is ready
        setTimeout(() => {
            initializeCombatPositions(initialCombatEnemies, !!playerCompanion);
        }, 10);
        
        console.log('Combat initialized with positions:', {
            enemies: enemiesWithInitiative.map(e => e.name),
            hasCompanion: !!playerCompanion
        });

        order.forEach((entity) => {
            addCombatMessage(`${entity.name} a lancé l'initiative et a obtenu ${entity.initiative}.`, 'initiative');
        });
    }, [encounterData, playerCharacter, playerCompanion, addCombatMessage, combatPhase, combatKey, initializeCombatPositions, setCombatEnemies, setTurnOrder]);

    return null; // This component doesn't render anything
};

export default CombatInitializer;