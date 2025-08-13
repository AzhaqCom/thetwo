import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { spells } from '../data/spells'
import { spellSlotsByLevel } from '../data/character'
import { rollD20WithModifier, getModifier } from '../utils/calculations'
import { GameLogic } from '../services/gameLogic'

// Mapping des compétences vers les caractéristiques
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
}

// Store principal pour la gestion de l'état global du jeu
export const useGameStore = create(
  devtools(
    (set, get) => ({
      // État initial
      gamePhase: 'character-selection',
      currentScene: 'scene8',
      sceneHistory: [],
      combatLog: [],
      isShortResting: false,
      isLongResting: false,
      nextSceneAfterRest: null,
      combatKey: 0,
      gameMessages: [],

      // Actions de base
      setGamePhase: (phase) => set({ gamePhase: phase }),
      
      setCurrentScene: (scene) => set((state) => ({
        currentScene: scene,
        sceneHistory: [...state.sceneHistory, state.currentScene]
      })),
      
      goToPreviousScene: () => set((state) => {
        if (state.sceneHistory.length > 0) {
          const previousScene = state.sceneHistory[state.sceneHistory.length - 1]
          return {
            currentScene: previousScene,
            sceneHistory: state.sceneHistory.slice(0, -1)
          }
        }
        return state
      }),

      // Gestion des messages
      addCombatMessage: (message, type = 'default') => set((state) => ({
        combatLog: [...state.combatLog, { 
          id: GameLogic.generateId('msg'),
          message, 
          type,
          timestamp: new Date()
        }]
      })),
      
      clearCombatLog: () => set({ combatLog: [] }),
      
      addGameMessage: (message, type = 'info') => set((state) => ({
        gameMessages: [...state.gameMessages, {
          id: GameLogic.generateId('game-msg'),
          message,
          type,
          timestamp: new Date()
        }]
      })),

      clearGameMessages: () => set({ gameMessages: [] }),

      // Gestion des repos
      startShortRest: (nextScene) => set({
        isShortResting: true,
        nextSceneAfterRest: nextScene
      }),
      
      endShortRest: () => set((state) => ({
        isShortResting: false,
        currentScene: state.nextSceneAfterRest,
        nextSceneAfterRest: null
      })),
      
      startLongRest: (nextScene) => set({
        isLongResting: true,
        nextSceneAfterRest: nextScene
      }),
      
      endLongRest: () => set((state) => ({
        isLongResting: false,
        currentScene: state.nextSceneAfterRest,
        nextSceneAfterRest: null
      })),

      // Gestion du combat
      incrementCombatKey: () => set((state) => ({
        combatKey: state.combatKey + 1
      })),

      // Gestion des tests de compétences
      handleSkillCheck: (skill, dc, onSuccess, onPartialSuccess, onFailure, character) => {
        const statName = skillToStat[skill]
        const statValue = character.stats[statName]
        const statModifier = getModifier(statValue)
        const isProficient = character.proficiencies?.skills?.includes(skill) || false
        const proficiencyBonus = isProficient ? character.proficiencyBonus : 0
        const skillBonus = statModifier + proficiencyBonus
        const roll = rollD20WithModifier(skillBonus)
        const totalRoll = roll

        const { addCombatMessage, setCurrentScene } = get()

        addCombatMessage(
          `Test de ${skill} (${statName}): ${roll-skillBonus} (+${skillBonus} de bonus) = ${totalRoll}. DD: ${dc}`,
          'skill-check'
        )

        let nextScene = onFailure
        if (totalRoll >= dc) {
          nextScene = onSuccess
          addCombatMessage("✅ Réussite !", 'success')
        } else if (totalRoll >= (dc - 5) && onPartialSuccess) {
          nextScene = onPartialSuccess
          addCombatMessage("⚠️ Réussite partielle", 'partial')
        } else {
          nextScene = onFailure
          addCombatMessage("❌ Échec", 'failure')
        }

        setCurrentScene(nextScene)
      },

      // Utilitaires pour les sorts
      updateSpellSlotsForLevel: (character) => {
        if (!character.spellcasting) return character

        const newSpellSlots = get().getSpellSlotsForLevel(character.level, character.class)
        const newKnownSpells = get().getKnownSpells(character.level, character.class)

        return {
          ...character,
          spellcasting: {
            ...character.spellcasting,
            spellSlots: newSpellSlots,
            knownSpells: newKnownSpells
          }
        }
      },

      getSpellSlotsForLevel: (level, characterClass) => {
        let effectiveLevel = level

        switch (characterClass) {
          case 'Magicien':
            // Full caster
            break
          case 'Paladin':
          case 'Rôdeur':
            // Half caster
            effectiveLevel = Math.max(0, Math.floor((level - 1) / 2))
            break
          case 'Guerrier':
            // Eldritch Knight
            if (level >= 3) {
              effectiveLevel = Math.max(0, Math.floor((level - 2) / 3))
            } else {
              return {}
            }
            break
          case 'Roublard':
            // Arcane Trickster
            if (level >= 3) {
              effectiveLevel = Math.max(0, Math.floor((level - 2) / 3))
            } else {
              return {}
            }
            break
          default:
            return {}
        }

        const slots = spellSlotsByLevel[effectiveLevel]
        if (!slots) return {}

        const newSlots = {}
        for (const spellLevel in slots) {
          newSlots[spellLevel] = { total: slots[spellLevel], used: 0 }
        }
        return newSlots
      },

      getKnownSpells: (level, characterClass) => {
        const slots = get().getSpellSlotsForLevel(level, characterClass)
        const maxSpellLevel = slots ? Math.max(...Object.keys(slots).map(Number)) : 0

        // Filter spells by class
        const availableSpells = Object.values(spells).filter(spell => {
          switch (characterClass) {
            case 'Magicien':
              return true
            case 'Guerrier': // Eldritch Knight
              return spell.school === 'Abjuration' || spell.school === 'Évocation' || spell.level === 0
            case 'Roublard': // Arcane Trickster
              return spell.school === 'Enchantement' || spell.school === 'Illusion' || spell.level === 0
            default:
              return false
          }
        })

        const cantrips = availableSpells
          .filter(spell => spell.level === 0)
          .map(spell => spell.name)
        const leveledSpells = availableSpells
          .filter(spell => spell.level > 0 && spell.level <= maxSpellLevel)
          .map(spell => spell.name)

        return [...cantrips, ...leveledSpells]
      }
    }),
    { name: 'game-store' }
  )
)

// Sélecteurs optimisés
export const gameSelectors = {
  isInCombat: (state) => 
    typeof state.currentScene === 'object' && state.currentScene.type === 'combat',
  
  isResting: (state) => 
    state.isShortResting || state.isLongResting,
  
  canProgress: (state) => 
    !state.isShortResting && !state.isLongResting,
  
  getCurrentPhase: (state) => state.gamePhase,
  
  // Utiliser directement combatLog, le composant gérera le slicing avec useMemo
  getCombatLog: (state) => state.combatLog,
    
  hasMessages: (state) => state.combatLog.length > 0
}