/**
 * Centralized store exports for the RPG application
 */

export { useGameStore, gameSelectors } from './gameStore'
export { useCharacterStore, characterSelectors } from './characterStore'
export { useCombatStore, combatSelectors } from './combatStore'
export { useUIStore, uiSelectors } from './uiStore'

// Combined selectors for complex queries
export const combinedSelectors = {
  // Combine game and character state
  getGameStatus: (gameState, characterState) => ({
    phase: gameState.gamePhase,
    scene: gameState.currentScene,
    player: characterState.playerCharacter,
    companion: characterState.playerCompanion,
    isResting: gameState.isShortResting || gameState.isLongResting
  }),

  // Combine combat and character state
  getCombatStatus: (combatState, characterState) => ({
    isInCombat: combatState.isActive,
    phase: combatState.combatPhase,
    currentTurn: combatState.turnOrder[combatState.currentTurnIndex],
    playerAlive: characterState.playerCharacter?.currentHP > 0,
    companionAlive: characterState.playerCompanion?.currentHP > 0,
    enemiesAlive: combatState.combatEnemies.filter(e => e.currentHP > 0).length
  }),

  // UI state with context
  getUIContext: (uiState, gameState, combatState) => ({
    isMobile: uiState.isMobile,
    isInCombat: combatState.isActive,
    showCombatUI: combatState.isActive && uiState.showCombatDetails,
    canShowSidebar: !uiState.isMobile || !combatState.isActive,
    currentModal: uiState.activeModal,
    notifications: uiState.notifications
  })
}

// Store initialization helpers
export const initializeStores = () => {
  // Initialize UI responsive detection
  const uiStore = useUIStore.getState()
  uiStore.updateScreenSize()
  
  // Add window resize listener
  window.addEventListener('resize', () => {
    uiStore.updateScreenSize()
  })

  console.log('Stores initialized successfully')
}

// Store reset helpers
export const resetAllStores = () => {
  useGameStore.getState().resetGame?.() || console.warn('gameStore reset not implemented')
  useCharacterStore.getState().resetCharacters()
  useCombatStore.getState().resetCombat()
  useUIStore.getState().resetUI()
  
  console.log('All stores reset')
}

// Development helpers
export const getStoreStates = () => ({
  game: useGameStore.getState(),
  character: useCharacterStore.getState(),
  combat: useCombatStore.getState(),
  ui: useUIStore.getState()
})

export const logStoreStates = () => {
  console.group('Store States')
  console.log('Game:', useGameStore.getState())
  console.log('Character:', useCharacterStore.getState()) 
  console.log('Combat:', useCombatStore.getState())
  console.log('UI:', useUIStore.getState())
  console.groupEnd()
}