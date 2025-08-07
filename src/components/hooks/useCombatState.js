import { useState, useEffect, useCallback } from 'react';
import { enemyTemplates } from '../../data/enemies'; // adapter selon ton fichier
import { rollD20, getModifier } from '../utils/utils';

export default function useCombatState(playerCharacter, encounterData, onCombatEnd) {
  const [combatEnemies, setCombatEnemies] = useState([]);
  const [turnOrder, setTurnOrder] = useState([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [combatPhase, setCombatPhase] = useState('initiative-roll'); // 'initiative-roll', 'player-turn', 'enemy-turn', 'end'
  const [playerAction, setPlayerAction] = useState(null);
  const [actionTargets, setActionTargets] = useState([]);
  const [combatLog, setCombatLog] = useState([]);
  const [defeated, setDefeated] = useState(false);
  const [playerHp, setPlayerHp] = useState(playerCharacter.hp); // gérer HP joueur en état local

  const addCombatMessage = (msg) => setCombatLog(log => [...log, msg]);

  const initializeCombat = useCallback(() => {
    // Déplier encounterData qui peut avoir {type, count}
    const expandedEnemies = [];
    encounterData.forEach(enemyGroup => {
      const count = enemyGroup.count || 1;
      for (let i = 0; i < count; i++) {
        expandedEnemies.push({ type: enemyGroup.type });
      }
    });

    // Cloner les ennemis en ajoutant leurs propriétés depuis enemyTemplates
    const clonedEnemies = expandedEnemies.map((enemy, i) => {
      const template = enemyTemplates[enemy.type];
      if (!template) {
        console.error(`Template ennemi non trouvé pour : ${enemy.type}`);
        return null; // ou throw une erreur selon ta préférence
      }
      return {
        ...template,
        id: `${enemy.type}_${i}`,   // id sans espace, avec underscore
        currentHP: template.maxHP,
        initiative: null,
        alive: true,
      };
    }).filter(Boolean); // enlever les éventuels null

    setCombatEnemies(clonedEnemies);
    setCombatLog(['Un combat commence !']);
    setCurrentTurnIndex(0);
    setPlayerAction(null);
    setActionTargets([]);
    setDefeated(false);
    setCombatPhase('initiative-roll');
    setTurnOrder([]);
    setPlayerHp(playerCharacter.hp); // reset hp joueur au début
  }, [encounterData, playerCharacter.hp]);

  const rollInitiative = useCallback(() => {
    const enemiesWithInit = combatEnemies.map(enemy => {
      // Correctif : accéder aux stats via enemy.stats.dexterity
      const dex = enemy.stats?.dexterity ?? 10;
      const init = rollD20() + getModifier(dex);
      addCombatMessage(`${enemy.id} a lancé l'initiative et a obtenu ${init}.`);
      return { ...enemy, initiative: init };
    });

    const playerDex = playerCharacter.stats?.dexterity ?? 10;
    const playerInit = rollD20() + getModifier(playerDex);
    addCombatMessage(`${playerCharacter.name} a lancé l'initiative et a obtenu ${playerInit}.`);

    const fullTurnOrder = [
      ...enemiesWithInit.map(e => ({ ...e, type: 'enemy' })),
      { ...playerCharacter, initiative: playerInit, type: 'player', currentHP: playerHp },
    ].sort((a, b) => b.initiative - a.initiative);

    setTurnOrder(fullTurnOrder);
    setCombatEnemies(enemiesWithInit);
    setCombatPhase(fullTurnOrder[0].type === 'player' ? 'player-turn' : 'enemy-turn');
    setCurrentTurnIndex(0);
  }, [combatEnemies, playerCharacter, addCombatMessage, playerHp]);

  const handleNextTurn = useCallback(() => {
    let nextIndex = currentTurnIndex + 1;
    if (nextIndex >= turnOrder.length) nextIndex = 0;

    setCurrentTurnIndex(nextIndex);
    const nextActor = turnOrder[nextIndex];

    if (nextActor.type === 'player') {
      addCombatMessage("C'est ton tour !");
      setCombatPhase('player-turn');
      setPlayerAction(null);
      setActionTargets([]);
    } else {
      setCombatPhase('enemy-turn');
    }
  }, [currentTurnIndex, turnOrder, addCombatMessage]);

  const enemyAttack = useCallback(() => {
    if (turnOrder.length === 0) return;

    const enemy = turnOrder[currentTurnIndex];
    if (!enemy || enemy.type !== 'enemy') return;

    const attackRoll = rollD20() + getModifier(enemy.stats?.strength ?? 10);
    const playerAC = playerCharacter.ac || 10;

    if (attackRoll >= playerAC) {
      const damage = Math.floor(Math.random() * 4) + 1;
      addCombatMessage(`${enemy.id} utilise Cimeterre et touche ! Il inflige ${damage} dégâts tranchant.`);
      const newHp = playerHp - damage;
      setPlayerHp(newHp);

      if (newHp <= 0) {
        addCombatMessage(`${playerCharacter.name} est vaincu...`);
        setCombatPhase('end');
        setDefeated(true);
      }
    } else {
      addCombatMessage(`${enemy.id} attaque mais rate.`);
    }

    handleNextTurn();
  }, [turnOrder, currentTurnIndex, playerCharacter, playerHp, addCombatMessage, handleNextTurn]);

  const performPlayerAction = useCallback(() => {
    if (!playerAction || actionTargets.length === 0) {
      addCombatMessage("Tu n'as pas choisi d'action ou de cible.");
      return;
    }

    let enemiesCopy = [...combatEnemies];

    actionTargets.forEach(targetId => {
      const targetIndex = enemiesCopy.findIndex(e => e.id === targetId);
      if (targetIndex === -1) return;

      const damage = 5 + getModifier(playerCharacter.stats?.intelligence ?? 10);
      addCombatMessage(`${playerCharacter.name} lance un sort sur ${enemiesCopy[targetIndex].id} et inflige ${damage} dégâts.`);

      enemiesCopy[targetIndex] = {
        ...enemiesCopy[targetIndex],
        currentHP: enemiesCopy[targetIndex].currentHP - damage,
      };

      if (enemiesCopy[targetIndex].currentHP <= 0) {
        addCombatMessage(`${enemiesCopy[targetIndex].id} est vaincu !`);
        enemiesCopy[targetIndex] = {
          ...enemiesCopy[targetIndex],
          alive: false,
        };
      }
    });

    enemiesCopy = enemiesCopy.filter(e => e.alive !== false);

    setCombatEnemies(enemiesCopy);

    if (enemiesCopy.length === 0) {
      addCombatMessage("Tous les ennemis sont vaincus !");
      setCombatPhase('end');
      setDefeated(false);
      if (onCombatEnd) onCombatEnd();
      return;
    }

    handleNextTurn();
  }, [playerAction, actionTargets, combatEnemies, playerCharacter, handleNextTurn, onCombatEnd, addCombatMessage]);

  const resetCombat = useCallback(() => {
    initializeCombat();
  }, [initializeCombat]);

  useEffect(() => {
    if (combatPhase === 'initiative-roll' && combatEnemies.length > 0) {
      rollInitiative();
    }
  }, [combatEnemies, combatPhase, rollInitiative]);

  return {
    combatPhase, setCombatPhase,
    turnOrder, currentTurnIndex,
    combatEnemies,
    playerAction, setPlayerAction,
    actionTargets, setActionTargets,
    combatLog, addCombatMessage,
    handleNextTurn,
    enemyAttack,
    performPlayerAction,
    resetCombat,
    initializeCombat,
    defeated,
    playerHp,
  };
}
