import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { CharacterManager } from '../services/characterManager'
import { SpellSystem } from '../services/spellSystem'
import { GameLogic } from '../services/gameLogic'

// Store pour la gestion des personnages (joueur et compagnon)
export const useCharacterStore = create(
  subscribeWithSelector(
    devtools(
      (set, get) => ({
        // État des personnages
        playerCharacter: null,
        playerCompanion: null,
        
        // États temporaires
        activeEffects: [],
        temporaryModifiers: {},
        
        // Progression
        experienceGains: [],
        levelUpPending: false,
        levelUpData: null,

        // === ACTIONS DE BASE ===

        // Définir le personnage joueur
        setPlayerCharacter: (character) => set({ 
          playerCharacter: character ? GameLogic.deepClone(character) : null 
        }),

        // Définir le compagnon
        setPlayerCompanion: (companion) => set({ 
          playerCompanion: companion ? GameLogic.deepClone(companion) : null 
        }),

        // Mise à jour générique d'un personnage
        updatePlayerCharacter: (updates) => set((state) => ({
          playerCharacter: state.playerCharacter 
            ? { ...state.playerCharacter, ...updates }
            : null
        })),

        updatePlayerCompanion: (updates) => set((state) => ({
          playerCompanion: state.playerCompanion 
            ? { ...state.playerCompanion, ...updates }
            : null
        })),

        // === GESTION DES DÉGÂTS ET SOINS ===

        takeDamagePlayer: (damage) => set((state) => {
          if (!state.playerCharacter) return state
          
          const updatedCharacter = CharacterManager.takeDamage(state.playerCharacter, damage)
          return { playerCharacter: updatedCharacter }
        }),

        takeDamageCompanion: (damage) => set((state) => {
          if (!state.playerCompanion) return state
          
          const updatedCompanion = CharacterManager.takeDamage(state.playerCompanion, damage)
          return { playerCompanion: updatedCompanion }
        }),

        healPlayer: (healing) => set((state) => {
          if (!state.playerCharacter) return state
          
          const updatedCharacter = CharacterManager.heal(state.playerCharacter, healing)
          return { playerCharacter: updatedCharacter }
        }),

        healCompanion: (healing) => set((state) => {
          if (!state.playerCompanion) return state
          
          const updatedCompanion = CharacterManager.heal(state.playerCompanion, healing)
          return { playerCompanion: updatedCompanion }
        }),

        // === GESTION DES REPOS ===

        shortRestPlayer: (hitDiceSpent = 0) => set((state) => {
          if (!state.playerCharacter) return state
          
          const updatedCharacter = CharacterManager.shortRest(state.playerCharacter, hitDiceSpent)
          return { playerCharacter: updatedCharacter }
        }),

        longRestPlayer: () => set((state) => {
          if (!state.playerCharacter) return state
          
          const updatedCharacter = CharacterManager.longRest(state.playerCharacter)
          return { playerCharacter: updatedCharacter }
        }),

        longRestCompanion: () => set((state) => {
          if (!state.playerCompanion) return state
          
          const updatedCompanion = CharacterManager.longRest(state.playerCompanion)
          return { playerCompanion: updatedCompanion }
        }),

        // Repos complet (joueur + compagnon)
        longRestAll: () => {
          const { longRestPlayer, longRestCompanion } = get()
          longRestPlayer()
          longRestCompanion()
        },

        // === GESTION DE L'EXPÉRIENCE ET NIVEAUX ===

        addExperience: (xp, targetCharacter = 'player') => set((state) => {
          const character = targetCharacter === 'player' ? state.playerCharacter : state.playerCompanion
          if (!character) return state

          const updatedCharacter = CharacterManager.addExperience(character, xp)
          const newState = { ...state }

          // Vérifier si montée de niveau
          if (updatedCharacter.level > character.level) {
            newState.levelUpPending = true
            newState.levelUpData = {
              character: targetCharacter,
              oldLevel: character.level,
              newLevel: updatedCharacter.level,
              hpGained: updatedCharacter.maxHP - character.maxHP
            }
          }

          // Enregistrer le gain d'XP
          newState.experienceGains = [
            ...state.experienceGains,
            {
              id: GameLogic.generateId('xp'),
              amount: xp,
              target: targetCharacter,
              timestamp: new Date()
            }
          ]

          if (targetCharacter === 'player') {
            newState.playerCharacter = updatedCharacter
          } else {
            newState.playerCompanion = updatedCharacter
          }

          return newState
        }),

        confirmLevelUp: () => set((state) => ({
          levelUpPending: false,
          levelUpData: null
        })),

        // === GESTION DES SORTS ===

        castSpellPlayer: (spell, options = {}) => set((state) => {
          if (!state.playerCharacter) return state

          const result = SpellSystem.castSpell(state.playerCharacter, spell, [], options)
          
          return {
            playerCharacter: result.character
          }
        }),

        consumeSpellSlot: (spellLevel, targetCharacter = 'player') => set((state) => {
          const character = targetCharacter === 'player' ? state.playerCharacter : state.playerCompanion
          if (!character) return state

          const updatedCharacter = CharacterManager.consumeSpellSlot(character, spellLevel)
          
          if (targetCharacter === 'player') {
            return { playerCharacter: updatedCharacter }
          } else {
            return { playerCompanion: updatedCharacter }
          }
        }),

        prepareSpell: (spellName, targetCharacter = 'player') => set((state) => {
          const character = targetCharacter === 'player' ? state.playerCharacter : state.playerCompanion
          if (!character) return state

          const updatedCharacter = SpellSystem.prepareSpell(character, spellName)
          if (!updatedCharacter) return state // Couldn't prepare

          if (targetCharacter === 'player') {
            return { playerCharacter: updatedCharacter }
          } else {
            return { playerCompanion: updatedCharacter }
          }
        }),

        unprepareSpell: (spellName, targetCharacter = 'player') => set((state) => {
          const character = targetCharacter === 'player' ? state.playerCharacter : state.playerCompanion
          if (!character) return state

          const updatedCharacter = SpellSystem.unprepareSpell(character, spellName)

          if (targetCharacter === 'player') {
            return { playerCharacter: updatedCharacter }
          } else {
            return { playerCompanion: updatedCharacter }
          }
        }),

        // === GESTION DE L'INVENTAIRE ===

        addItemToInventory: (item, targetCharacter = 'player') => set((state) => {
          const character = targetCharacter === 'player' ? state.playerCharacter : state.playerCompanion
          if (!character) return state

          const newInventory = [...character.inventory, {
            ...item,
            id: item.id || GameLogic.generateId('item'),
            quantity: item.quantity || 1
          }]

          const updates = { inventory: newInventory }

          if (targetCharacter === 'player') {
            return { playerCharacter: { ...character, ...updates } }
          } else {
            return { playerCompanion: { ...character, ...updates } }
          }
        }),

        removeItemFromInventory: (itemId, targetCharacter = 'player') => set((state) => {
          const character = targetCharacter === 'player' ? state.playerCharacter : state.playerCompanion
          if (!character) return state

          const newInventory = character.inventory.filter(item => item.id !== itemId)
          const updates = { inventory: newInventory }

          if (targetCharacter === 'player') {
            return { playerCharacter: { ...character, ...updates } }
          } else {
            return { playerCompanion: { ...character, ...updates } }
          }
        }),

        useItem: (itemId, targetCharacter = 'player') => {
          const { removeItemFromInventory, healPlayer, healCompanion } = get()
          const character = targetCharacter === 'player' ? get().playerCharacter : get().playerCompanion
          if (!character) return false

          const item = character.inventory.find(i => i.id === itemId)
          if (!item) return false

          // Traiter les effets de l'objet
          if (item.effects) {
            item.effects.forEach(effect => {
              switch (effect.type) {
                case 'heal':
                  if (targetCharacter === 'player') {
                    healPlayer(effect.value)
                  } else {
                    healCompanion(effect.value)
                  }
                  break
                // Ajouter d'autres types d'effets selon les besoins
                default:
                  console.warn(`Unknown item effect type: ${effect.type}`)
              }
            })
          }

          // Retirer l'objet de l'inventaire s'il est consommable
          if (item.consumable) {
            removeItemFromInventory(itemId, targetCharacter)
          }

          return true
        },

        // === GESTION DES EFFETS TEMPORAIRES ===

        addEffect: (effect) => set((state) => ({
          activeEffects: [...state.activeEffects, {
            ...effect,
            id: effect.id || GameLogic.generateId('effect'),
            startTime: new Date()
          }]
        })),

        removeEffect: (effectId) => set((state) => ({
          activeEffects: state.activeEffects.filter(effect => effect.id !== effectId)
        })),

        clearExpiredEffects: () => set((state) => {
          const now = new Date()
          return {
            activeEffects: state.activeEffects.filter(effect => {
              if (!effect.duration) return true // Permanent effects
              const elapsed = now - effect.startTime
              return elapsed < effect.duration
            })
          }
        }),

        // === UTILITAIRES ===

        resetCharacters: () => set({
          playerCharacter: null,
          playerCompanion: null,
          activeEffects: [],
          temporaryModifiers: {},
          experienceGains: [],
          levelUpPending: false,
          levelUpData: null
        }),

        clearExperienceGains: () => set({ experienceGains: [] })
      }),
      { name: 'character-store' }
    )
  )
)

// Sélecteurs optimisés
export const characterSelectors = {
  getPlayerCharacter: (state) => state.playerCharacter,
  
  getPlayerCompanion: (state) => state.playerCompanion,
  
  hasCompanion: (state) => state.playerCompanion !== null,
  
  isPlayerAlive: (state) => state.playerCharacter?.currentHP > 0,
  
  isCompanionAlive: (state) => state.playerCompanion?.currentHP > 0,
  
  getPlayerHPPercentage: (state) => 
    state.playerCharacter 
      ? Math.round((state.playerCharacter.currentHP / state.playerCharacter.maxHP) * 100)
      : 0,
  
  getCompanionHPPercentage: (state) =>
    state.playerCompanion
      ? Math.round((state.playerCompanion.currentHP / state.playerCompanion.maxHP) * 100)
      : 0,
  
  canLevelUp: (state) => state.levelUpPending,
  
  getActiveEffects: (state) => state.activeEffects,
  
  hasActiveEffects: (state) => state.activeEffects.length > 0,
  
  getRecentExperienceGains: (state, count = 5) => 
    state.experienceGains.slice(-count),
  
  canCastSpells: (state) => state.playerCharacter?.spellcasting !== undefined,
  
  getAvailableSpellSlots: (state) => 
    state.playerCharacter?.spellcasting?.slotsRemaining || {},
  
  getPreparedSpells: (state) =>
    SpellSystem.getPreparedSpells(state.playerCharacter || {}),
  
  getInventoryItems: (state) => state.playerCharacter?.inventory || [],
  
  hasItem: (state, itemId) => 
    state.playerCharacter?.inventory?.some(item => item.id === itemId) || false
}