import { spells } from '../data/spells'
import { getModifier } from '../utils/calculations'

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
      .map(spellId => this.getSpellData(spellId))
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
    const spellEntry = Object.entries(spells).find(([_, spell]) => 
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
}