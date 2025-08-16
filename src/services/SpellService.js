import { spells } from '../data/spells'
import { getModifier } from '../utils/calculations'
import { CharacterManager } from './characterManager'

/**
 * Service gérant toute la logique métier des sorts
 */
export class SpellService {
  /**
   * Obtient le bonus d'attaque de sort d'un personnage
   */
  getSpellAttackBonus(character) {
    if (!character.spellcasting) return 0
    
    const spellcastingAbility = character.spellcasting.ability || 'intelligence'
    const abilityModifier = getModifier(character.stats[spellcastingAbility])
    const proficiencyBonus = this.getProficiencyBonus(character.level)
    
    return abilityModifier + proficiencyBonus
  }

  /**
   * Obtient le DD de sauvegarde des sorts d'un personnage
   */
  getSpellSaveDC(character) {
    if (!character.spellcasting) return 8
    
    const spellcastingAbility = character.spellcasting.ability || 'intelligence'
    const abilityModifier = getModifier(character.stats[spellcastingAbility])
    const proficiencyBonus = this.getProficiencyBonus(character.level)
    
    return 8 + abilityModifier + proficiencyBonus
  }

  /**
   * Obtient le bonus de maîtrise selon le niveau
   */
  getProficiencyBonus(level) {
    return Math.ceil(level / 4) + 1
  }

  /**
   * Obtient tous les sorts connus d'un personnage
   */
  getKnownSpells(character) {
    if (!character.spellcasting?.knownSpells) return []
    
    return character.spellcasting.knownSpells
      .map(spellId => this.getSpellData(spellId))
      .filter(Boolean)
      .filter(spell => spell.level > 0) // Exclure les cantrips
  }

  /**
   * Obtient tous les sorts préparés d'un personnage
   */
  getPreparedSpells(character) {
    if (!character.spellcasting?.preparedSpells) return []
    
    return character.spellcasting.preparedSpells
      .map(spellId => {
        // Utiliser getSpellData qui peut trouver les sorts par nom ou ID
        const spellData = this.getSpellData(spellId)
        if (spellData && this.isSpellAvailableForClass(spellData, character)) {
          return spellData
        }
        return null
      })
      .filter(Boolean)
  }

  /**
   * Obtient tous les tours de magie d'un personnage
   */
  getCantrips(character) {
    if (!character.spellcasting?.cantrips) return []
    
    return character.spellcasting.cantrips
      .map(spellId => this.getSpellData(spellId))
      .filter(Boolean)
  }

  /**
   * Obtient le nombre maximum de sorts préparés
   */
  getMaxPreparedSpells(character) {
    if (!character.spellcasting) return 0
    
    const spellcastingAbility = character.spellcasting.ability || 'intelligence'
    const abilityModifier = Math.max(1, getModifier(character.stats[spellcastingAbility]))
    
    return abilityModifier + character.level
  }

  /**
   * Obtient les emplacements de sorts d'un personnage
   */
  getSpellSlots(character) {
    if (!character.spellcasting?.spellSlots || Object.keys(character.spellcasting.spellSlots).length === 0) {
      return this.generateDefaultSpellSlots(character)
    }
    
    return character.spellcasting.spellSlots
  }

  /**
   * Génère les emplacements de sorts par défaut selon la classe et le niveau
   */
  generateDefaultSpellSlots(character) {
    const slots = {}
    const level = character.level
    
    // Table des emplacements de sorts pour un lanceur de sorts complet
    const slotsByLevel = {
      1: { 1: 2 },
      2: { 1: 3 },
      3: { 1: 4, 2: 2 },
      4: { 1: 4, 2: 3 },
      5: { 1: 4, 2: 3, 3: 2 },
      6: { 1: 4, 2: 3, 3: 3 },
      7: { 1: 4, 2: 3, 3: 3, 4: 1 },
      8: { 1: 4, 2: 3, 3: 3, 4: 2 },
      9: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
      10: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
      11: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
      12: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
      13: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
      14: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
      15: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
      16: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
      17: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1, 9: 1 },
      18: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 1, 7: 1, 8: 1, 9: 1 },
      19: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 1, 8: 1, 9: 1 },
      20: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 2, 8: 1, 9: 1 }
    }
    
    const levelSlots = slotsByLevel[Math.min(level, 20)] || {}
    
    for (const [spellLevel, maxSlots] of Object.entries(levelSlots)) {
      slots[spellLevel] = {
        max: maxSlots,
        used: 0,
        available: maxSlots
      }
    }
    
    return slots
  }

  /**
   * Obtient les données d'un sort par son ID
   */
  getSpellData(spellId) {
    // Vérifier d'abord avec l'ID exact
    if (spells[spellId]) {
      return { id: spellId, ...spells[spellId] }
    }
    
    // Chercher par nom si l'ID n'existe pas
    const spellEntry = Object.entries(spells).find(([spellKey, spell]) => 
      spell.name === spellId || spell.name?.toLowerCase() === spellId?.toLowerCase()
    )
    
    if (spellEntry) {
      return { id: spellEntry[0], ...spellEntry[1] }
    }
    
    return null
  }

  /**
   * Filtre une liste de sorts selon les critères
   */
  filterSpells(spells, filters) {
    return spells.filter(spell => {
      // Filtre par école
      if (filters.school !== 'all' && spell.school !== filters.school) {
        return false
      }
      
      // Filtre par niveau
      if (filters.level !== 'all') {
        const filterLevel = parseInt(filters.level)
        if (spell.level !== filterLevel) return false
      }
      
      // Filtre de recherche textuelle
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase()
        const matchesName = spell.name?.toLowerCase().includes(searchLower)
        const matchesDescription = spell.description?.toLowerCase().includes(searchLower)
        const matchesSchool = spell.school?.toLowerCase().includes(searchLower)
        
        if (!matchesName && !matchesDescription && !matchesSchool) {
          return false
        }
      }
      
      // Filtre sorts lançables uniquement
      if (filters.castableOnly) {
        // Pour les cantrips, toujours lançables
        if (spell.level === 0) return true
        
        // Pour les autres sorts, vérifier les emplacements disponibles
        // Cette logique nécessite les emplacements, à implémenter si nécessaire
      }
      
      return true
    })
  }

  /**
   * Trie une liste de sorts
   */
  sortSpells(spells, sortBy = 'level') {
    return [...spells].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '')
        case 'level':
          if (a.level !== b.level) return a.level - b.level
          return (a.name || '').localeCompare(b.name || '')
        case 'school':
          if (a.school !== b.school) return (a.school || '').localeCompare(b.school || '')
          return (a.name || '').localeCompare(b.name || '')
        case 'range':
          return this.compareRange(a.range, b.range)
        default:
          return 0
      }
    })
  }

  /**
   * Compare deux portées de sorts
   */
  compareRange(rangeA, rangeB) {
    const getRangeValue = (range) => {
      if (!range || range === 'Personnel') return 0
      if (range === 'Contact') return 1
      if (range.includes('mètres')) {
        const meters = parseInt(range.match(/\d+/)?.[0] || '0')
        return meters
      }
      return 999999 // Pour les portées spéciales
    }
    
    return getRangeValue(rangeA) - getRangeValue(rangeB)
  }

  /**
   * Vérifie si un sort peut être lancé
   */
  canCastSpell(spell, character, atLevel = null) {
    if (!spell || !character.spellcasting) return false
    
    // Les cantrips peuvent toujours être lancés
    if (spell.level === 0) return true
    
    // Vérifier les emplacements de sorts disponibles
    const spellSlots = this.getSpellSlots(character)
    const castingLevel = atLevel || spell.level
    
    for (let level = castingLevel; level <= 9; level++) {
      const slot = spellSlots[level]
      if (slot && slot.available > 0) {
        return true
      }
    }
    
    return false
  }

  /**
   * Obtient les niveaux auxquels un sort peut être lancé
   */
  getAvailableCastingLevels(spell, character) {
    if (spell.level === 0) return [0] // Cantrips
    
    const spellSlots = this.getSpellSlots(character)
    const availableLevels = []
    
    for (let level = spell.level; level <= 9; level++) {
      const slot = spellSlots[level]
      if (slot && slot.available > 0) {
        availableLevels.push(level)
      }
    }
    
    return availableLevels
  }

  /**
   * Calcule les dégâts d'un sort selon le niveau de lancement
   */
  calculateSpellDamage(spell, castingLevel) {
    if (!spell.damage) return null
    
    const baseDamage = spell.damage
    const levelDifference = Math.max(0, castingLevel - spell.level)
    
    // Logique simple d'augmentation des dégâts
    // À adapter selon les besoins spécifiques de chaque sort
    if (spell.scalingDamage && levelDifference > 0) {
      return baseDamage + (spell.scalingDamage * levelDifference)
    }
    
    return baseDamage
  }

  /**
   * Obtient la liste des écoles de magie
   */
  getSchoolsOfMagic() {
    return [
      'Abjuration',
      'Invocation', 
      'Divination',
      'Enchantement',
      'Évocation',
      'Illusion',
      'Nécromancie',
      'Transmutation'
    ]
  }

  /**
   * Obtient tous les sorts disponibles pour le grimoire (selon la classe et le niveau)
   */
  getGrimoireSpells(character) {
    if (!character.spellcasting) return []
    
    const allAvailableSpells = []
    
    // Obtenir tous les sorts de la base de données
    Object.entries(spells).forEach(([spellId, spellData]) => {
      // Filtrer selon la classe et le niveau
      if (this.isSpellAvailableForClass(spellData, character)) {
        allAvailableSpells.push({ 
          id: spellId, 
          ...spellData,
          isPrepared: character.spellcasting.preparedSpells?.includes(spellId) || false
        })
      }
    })
    
    return this.sortSpells(allAvailableSpells, 'level')
  }

  /**
   * Obtient les sorts du grimoire qui ne sont pas encore préparés
   */
  getUnpreparedSpells(character) {
    if (!character.spellcasting) return []
    
    const grimoireSpells = this.getGrimoireSpells(character)
    const preparedSpellIds = character.spellcasting.preparedSpells || []
    
    return grimoireSpells.filter(spell => 
      // Exclure les cantrips (toujours disponibles) et les sorts déjà préparés
      spell.level > 0 && !preparedSpellIds.includes(spell.id)
    )
  }

  /**
   * Vérifie si un sort est disponible pour une classe donnée
   */
  isSpellAvailableForClass(spell, character) {
    // Vérifier si le sort a une liste de classes définies
    if (!spell.class || !Array.isArray(spell.class)) {
      return false
    }
    
    // Vérifier si la classe du personnage est dans la liste des classes autorisées
    if (!spell.class.includes(character.class)) {
      return false
    }
    
    // Les cantrips sont disponibles dès le niveau 1
    if (spell.level === 0) return character.level >= 1
    
    // Les autres sorts selon une progression simple
    const requiredLevels = {
      1: 1,
      2: 3,
      3: 5,
      4: 7,
      5: 9,
      6: 11,
      7: 13,
      8: 15,
      9: 17
    }
    
    return character.level >= (requiredLevels[spell.level] || 20)
  }

  /**
   * Vérifie si un sort est actuellement actif sur un personnage
   */
  isSpellActive(spellId, character) {
  
    
    if (!character.activeEffects) {

      return false
    }
    // Vérifier dans les effets actifs
    const isActive = character.activeEffects.some(effect => {
      return effect.sourceSpellId === spellId || effect.name === spellId
    })
    return isActive
  }

  /**
   * Vérifie si un sort peut être préparé
   */
  canPrepareSpell(spellId, character) {
    if (!character.spellcasting) return false
    
    // Vérifier si déjà préparé
    if (character.spellcasting.preparedSpells?.includes(spellId)) return false
    
    // Vérifier la limite de sorts préparés
    const currentPrepared = character.spellcasting.preparedSpells?.length || 0
    const maxPrepared = this.getMaxPreparedSpells(character)
    
    if (currentPrepared >= maxPrepared) return false
    
    // Vérifier si le sort est connu ou dans le grimoire
    const spell = this.getSpellData(spellId)
    if (!spell) return false
    
    // Les cantrips ne sont pas préparés, ils sont toujours disponibles
    if (spell.level === 0) return false
    
    return this.isSpellAvailableForClass(spell, character)
  }

  /**
   * Vérifie si un sort peut être retiré de la préparation
   */
  canUnprepareSpell(spellId, character) {
    if (!character.spellcasting?.preparedSpells) return false
    
    return character.spellcasting.preparedSpells.includes(spellId)
  }

  // ================================
  // MÉTHODES MIGRÉES DE SPELLSYSTEM
  // ================================

  /**
   * Processes spell casting for a character
   * @param {Object} character - The character casting the spell
   * @param {Object} spell - The spell being cast
   * @param {Array} targets - Target entities
   * @param {Object} options - Additional casting options
   * @returns {Object} Spell casting result
   */
  static castSpell(character, spell, targets = [], options = {}) {
    const result = {
      success: false,
      character: character,
      messages: [],
      effects: []
    }

    // Validate spell casting
    const validation = this.validateSpellcast(character, spell)
    if (!validation.success) {
      result.messages.push(validation.message)
      return result
    }

    // Consume spell slot (cantrips don't consume slots)
    if (spell.level > 0) {
      result.character = this.consumeSpellSlot(result.character, spell.level)
    }

    // Process spell effects
    const spellEffects = this.processSpellEffects(spell, targets, character, options)
    result.effects = spellEffects.effects
    result.messages = [...result.messages, ...spellEffects.messages]
    
    // Apply effects to the character (for self-target spells)
    result.character = this.applySpellEffectsToCharacter(result.character, spell, spellEffects)
    
    result.success = true

    return result
  }

  /**
   * Validates if a character can cast a spell
   * @param {Object} character - The character
   * @param {Object} spell - The spell
   * @returns {Object} Validation result
   */
  static validateSpellcast(character, spell) {
    if (!character.spellcasting) {
      return { success: false, message: "Ce personnage ne peut pas lancer de sorts" }
    }

    // Check if spell is known/prepared
    const knownSpells = [
      ...(character.spellcasting.cantrips || []),
      ...(character.spellcasting.preparedSpells || [])
    ]

    if (!knownSpells.includes(spell.id)) {
      return { success: false, message: "Sort non préparé" }
    }

    // Check spell slot availability (cantrips don't require slots)
    if (spell.level > 0) {
      // Use instance method to get available slots
      const spellService = new SpellService()
      const spellSlots = spellService.getSpellSlots(character)
      
      let hasAvailableSlot = false
      for (let level = spell.level; level <= 9; level++) {
        const slot = spellSlots[level]
        if (slot && slot.available > 0) {
          hasAvailableSlot = true
          break
        }
      }
      
      if (!hasAvailableSlot) {
        return { success: false, message: "Aucun emplacement de sort disponible" }
      }
    }

    return { success: true }
  }

  /**
   * Consumes a spell slot for casting
   * @param {Object} character - The character
   * @param {number} spellLevel - The level of spell slot to consume
   * @returns {Object} Updated character
   */
  static consumeSpellSlot(character, spellLevel) {
    if (!character.spellcasting || spellLevel <= 0) return character

    const spellService = new SpellService()
    const spellSlots = spellService.getSpellSlots(character)
    
    // Find the lowest available slot that can cast this spell
    let slotLevelToUse = null
    for (let level = spellLevel; level <= 9; level++) {
      const slot = spellSlots[level]
      if (slot && slot.available > 0) {
        slotLevelToUse = level
        break
      }
    }
    
    if (!slotLevelToUse) return character // No available slots
    
    // Update the spell slots
    const updatedSlots = {
      ...spellSlots,
      [slotLevelToUse]: {
        ...spellSlots[slotLevelToUse],
        used: spellSlots[slotLevelToUse].used + 1,
        available: spellSlots[slotLevelToUse].available - 1
      }
    }
    
    return {
      ...character,
      spellcasting: {
        ...character.spellcasting,
        spellSlots: updatedSlots
      }
    }
  }

  /**
   * Gets prepared spells for a character (including cantrips)
   * @param {Object} character - The character
   * @returns {Array} Array of prepared spell names
   */
  static getPreparedSpells(character) {
    if (!character.spellcasting) return []
    
    return [
      ...(character.spellcasting.cantrips || []),
      ...(character.spellcasting.preparedSpells || [])
    ]
  }

  /**
   * Calculates maximum prepared spells for a character
   * @param {Object} character - The character
   * @returns {number} Maximum number of spells that can be prepared
   */
  static getMaxPreparedSpells(character) {
    if (!character.spellcasting) return 0

    const spellcastingAbility = CharacterManager.getSpellcastingAbility(character)
    const abilityModifier = Math.max(1, getModifier(character.stats[spellcastingAbility]))
    
    return character.level + abilityModifier
  }

  /**
   * Prepares a spell for a character
   * @param {Object} character - The character
   * @param {string} spellName - Name of spell to prepare
   * @returns {Object} Updated character or null if can't prepare
   */
  static prepareSpell(character, spellName) {
    if (!character.spellcasting) return null

    const currentPrepared = character.spellcasting.preparedSpells || []
    const maxPrepared = this.getMaxPreparedSpells(character)

    // Check if already prepared
    if (currentPrepared.includes(spellName)) return character

    // Check if at capacity
    if (currentPrepared.length >= maxPrepared) return null

    return {
      ...character,
      spellcasting: {
        ...character.spellcasting,
        preparedSpells: [...currentPrepared, spellName]
      }
    }
  }

  /**
   * Unprepares a spell for a character
   * @param {Object} character - The character
   * @param {string} spellName - Name of spell to unprepare
   * @returns {Object} Updated character
   */
  static unprepareSpell(character, spellName) {
    if (!character.spellcasting) return character

    const currentPrepared = character.spellcasting.preparedSpells || []
    
    return {
      ...character,
      spellcasting: {
        ...character.spellcasting,
        preparedSpells: currentPrepared.filter(spell => spell !== spellName)
      }
    }
  }

  /**
   * Placeholder pour les effets de sorts (à implémenter selon besoins)
   */
  static processSpellEffects(spell, targets, caster, options) {
    return {
      effects: [],
      messages: [`${caster.name} lance ${spell.name}`]
    }
  }

  /**
   * Placeholder pour appliquer les effets sur le lanceur
   */
  static applySpellEffectsToCharacter(character, spell, spellEffects) {
    return character
  }
}