import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { CharacterManager } from '../services/characterManager'
import { SpellSystem } from '../services/spellSystem'
import { GameLogic } from '../services/gameLogic'
import { items } from '../data/items'

// Store pour la gestion des personnages (joueur et compagnon)
// Helper pour synchroniser playerCharacter et selectedCharacter
const syncCharacter = (updates) => {
  if (updates.playerCharacter) {
    updates.selectedCharacter = updates.playerCharacter
  }
  return updates
}

export const useCharacterStore = create(
  subscribeWithSelector(
    devtools(
      (set, get) => ({
        // État des personnages
        playerCharacter: null,
        playerCompanion: null,
        selectedCharacter: null, // Alias pour playerCharacter pour compatibilité avec les composants
        
        // États temporaires
        activeEffects: [],
        temporaryModifiers: {},
        
        // Progression
        experienceGains: [],
        levelUpPending: false,
        levelUpData: null,

        // === ACTIONS DE BASE ===

        // Définir le personnage joueur
        setPlayerCharacter: (character) => set(syncCharacter({ 
          playerCharacter: character ? GameLogic.deepClone(character) : null
        })),

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
          return syncCharacter({ playerCharacter: updatedCharacter })
        }),

        takeDamageCompanion: (damage) => set((state) => {
          if (!state.playerCompanion) return state
          
          const updatedCompanion = CharacterManager.takeDamage(state.playerCompanion, damage)
          return { playerCompanion: updatedCompanion }
        }),

        healPlayer: (healing) => set((state) => {
          if (!state.playerCharacter) return state
          
          const updatedCharacter = CharacterManager.heal(state.playerCharacter, healing)
          return syncCharacter({ playerCharacter: updatedCharacter })
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
          return syncCharacter({ playerCharacter: updatedCharacter })
        }),

        longRestPlayer: () => set((state) => {
          if (!state.playerCharacter) return state
          
          const updatedCharacter = CharacterManager.longRest(state.playerCharacter)
          return syncCharacter({ playerCharacter: updatedCharacter })
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

        // Dépenser un dé de vie pendant un repos court
        spendHitDie: (targetCharacter = 'player') => set((state) => {
          const character = targetCharacter === 'player' ? state.playerCharacter : state.playerCompanion
          if (!character) return state

          // Vérifications
          if (character.hitDice <= 0) return state
          if (character.currentHP >= character.maxHP) return state

          // Calculer la guérison
          const hitDieSize = character.hitDiceType || 8
          const constitutionModifier = Math.floor((character.stats.constitution - 10) / 2)
          const roll = Math.floor(Math.random() * hitDieSize) + 1
          const healing = Math.max(1, roll + constitutionModifier)
          
          // Appliquer la guérison
          const newHP = Math.min(character.maxHP, character.currentHP + healing)
          
          const updatedCharacter = {
            ...character,
            currentHP: newHP,
            hitDice: character.hitDice - 1
          }

          if (targetCharacter === 'player') {
            return syncCharacter({ playerCharacter: updatedCharacter })
          } else {
            return { playerCompanion: updatedCharacter }
          }
        }),

        // === GESTION DE L'EXPÉRIENCE ET NIVEAUX ===

        addExperience: (xp, targetCharacter = 'player') => set((state) => {
          const character = targetCharacter === 'player' ? state.playerCharacter : state.playerCompanion
          if (!character) return state

          console.log(`🎯 Adding ${xp} XP to ${targetCharacter} (current level: ${character.level}, current XP: ${character.currentXP || character.experience || 0})`)
          
          const updatedCharacter = CharacterManager.addExperience(character, xp)
          console.log(`🎯 After XP gain: level ${updatedCharacter.level}, XP: ${updatedCharacter.currentXP}`)
          
          const newState = { ...state }

          // Vérifier si montée de niveau
          if (updatedCharacter.level > character.level) {
            console.log(`🎉 Level up detected! ${character.level} → ${updatedCharacter.level}`)
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
            // Synchroniser selectedCharacter
            newState.selectedCharacter = updatedCharacter
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
            return syncCharacter({ playerCharacter: updatedCharacter })
          } else {
            return { playerCompanion: updatedCharacter }
          }
        }),

        prepareSpell: (spellName, targetCharacter = 'player') => {
          const state = get()
          const character = targetCharacter === 'player' ? state.playerCharacter : state.playerCompanion
          
          if (!character) {
            return { success: false, message: `Aucun personnage ${targetCharacter} trouvé` }
          }

          const updatedCharacter = SpellSystem.prepareSpell(character, spellName)
          
          if (!updatedCharacter) {
            // Vérifier pourquoi la préparation a échoué
            const currentPrepared = character.spellcasting?.preparedSpells || []
            const maxPrepared = SpellSystem.getMaxPreparedSpells(character)
            
            if (currentPrepared.includes(spellName)) {
              return { success: false, message: `${spellName} est déjà préparé` }
            }
            
            if (currentPrepared.length >= maxPrepared) {
              return { success: false, message: `Limite de sorts préparés atteinte (${maxPrepared})` }
            }
            
            return { success: false, message: `Impossible de préparer ${spellName}` }
          }

          // Mettre à jour le store
          if (targetCharacter === 'player') {
            set(syncCharacter({ playerCharacter: updatedCharacter }))
          } else {
            set({ playerCompanion: updatedCharacter })
          }

          return { success: true, message: `${spellName} préparé avec succès` }
        },

        unprepareSpell: (spellName, targetCharacter = 'player') => {
          const state = get()
          const character = targetCharacter === 'player' ? state.playerCharacter : state.playerCompanion
          
          if (!character) {
            return { success: false, message: `Aucun personnage ${targetCharacter} trouvé` }
          }

          const updatedCharacter = SpellSystem.unprepareSpell(character, spellName)
          
          if (!updatedCharacter) {
            return { success: false, message: `Impossible de retirer ${spellName}` }
          }

          // Mettre à jour le store
          if (targetCharacter === 'player') {
            set(syncCharacter({ playerCharacter: updatedCharacter }))
          } else {
            set({ playerCompanion: updatedCharacter })
          }

          return { success: true, message: `${spellName} retiré des sorts préparés` }
        },

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
            return syncCharacter({ playerCharacter: { ...character, ...updates } })
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
            return syncCharacter({ playerCharacter: { ...character, ...updates } })
          } else {
            return { playerCompanion: { ...character, ...updates } }
          }
        }),

        useItem: (itemId, targetCharacter = 'player') => {
          // Cette fonction retourne des informations pour que le composant puisse afficher le bon message
          const character = targetCharacter === 'player' ? get().playerCharacter : get().playerCompanion
          if (!character) return { success: false, message: 'Personnage non trouvé' }

          // D'abord chercher l'item dans l'inventaire du personnage
          const item = character.inventory.find(i => (i.id || i.name || i.nom) === itemId)
          if (!item) return { success: false, message: 'Objet non trouvé dans l\'inventaire' }

          // Chercher la définition de l'objet dans data/items.js
          const itemData = items[itemId] || items[item.id] || items[item.name] || items[item.nom]
          
          if (itemData && itemData.use) {
            try {
              // Utiliser la fonction use de l'objet
              const updatedCharacter = itemData.use(character)
              
              // Mettre à jour le personnage
              if (targetCharacter === 'player') {
                set({ 
                  playerCharacter: updatedCharacter,
                  selectedCharacter: updatedCharacter
                })
              } else {
                set({ playerCompanion: updatedCharacter })
              }
              
              // Retirer l'objet s'il est consommable
              if (itemData.type === 'consumable') {
                get().removeItemFromInventory(itemId, targetCharacter)
              }
              
              // Retourner le message pour affichage
              const message = typeof itemData.message === 'function' ? itemData.message() : itemData.message
              return { success: true, message, item: itemData }
              
            } catch (error) {
              console.error('Erreur lors de l\'utilisation de l\'objet:', error)
              return { success: false, message: `Erreur: ${error.message}` }
            }
          } else {
            // Fallback vers l'ancien système avec effects
            if (item.effects) {
              let updatedCharacter = { ...character }
              let message = `${item.name || item.nom} utilisé`
              
              item.effects.forEach(effect => {
                switch (effect.type) {
                  case 'heal':
                    const healAmount = effect.value
                    updatedCharacter.currentHP = Math.min(character.maxHP, character.currentHP + healAmount)
                    message = `Vous récupérez ${healAmount} PV`
                    break
                  default:
                    console.warn(`Unknown item effect type: ${effect.type}`)
                }
              })

              // Mettre à jour le personnage
              if (targetCharacter === 'player') {
                set({ 
                  playerCharacter: updatedCharacter,
                  selectedCharacter: updatedCharacter
                })
              } else {
                set({ playerCompanion: updatedCharacter })
              }

              // Retirer l'objet s'il est consommable
              if (item.consumable || item.type === 'consumable') {
                get().removeItemFromInventory(itemId, targetCharacter)
              }
              
              return { success: true, message }
            }

            return { success: false, message: 'Cet objet ne peut pas être utilisé' }
          }
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