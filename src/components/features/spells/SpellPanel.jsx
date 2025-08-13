import React, { useMemo, useState } from 'react'
import { useCharacterStore } from '../../../stores/characterStore'
import { useGameStore } from '../../../stores/gameStore'
import { SpellService } from '../../../services/SpellService'
import { Card, CardHeader, CardBody, Button } from '../../ui'
import { SpellSlotTracker } from './SpellSlotTracker'
import { SpellList } from './SpellList'
import { SpellFilters } from './SpellFilters'
import { SpellDetailModal } from './SpellDetailModal'

/**
 * Panneau de gestion des sorts avec Zustand
 */
export const SpellPanel = ({
  className = '',
  character, // Prop character prioritaire
  onCastSpell, // Callback pour lancer des sorts hors combat
  isOutOfCombat = false // Indique si on est hors combat
}) => {
  // Stores
  const {
    selectedCharacter,
    castSpell,
    prepareSpell,
    unprepareSpell
  } = useCharacterStore()
  
  // Utiliser la prop character si fournie, sinon selectedCharacter du store
  const activeCharacter = character || selectedCharacter
  
  const { addCombatMessage } = useGameStore()
  
  // Services
  const spellService = useMemo(() => new SpellService(), [])
  
  // État local
  const [selectedSpell, setSelectedSpell] = useState(null)
  const [activeTab, setActiveTab] = useState('prepared') // prepared, known, cantrips
  const [filters, setFilters] = useState({
    school: 'all',
    level: 'all',
    searchTerm: '',
    castableOnly: false
  })

  // Vérifier si le personnage peut lancer des sorts
  if (!activeCharacter?.spellcasting) {
    return (
      <Card className={`spell-panel ${className}`}>
        <CardBody>
          <div className="spell-panel__no-spells">
            <span className="no-spells-icon">🚫</span>
            <p>Ce personnage ne peut pas lancer de sorts</p>
          </div>
        </CardBody>
      </Card>
    )
  }

  // Données des sorts
  const spellData = useMemo(() => {
    const spellcasting = activeCharacter.spellcasting
    
    // Statistiques de sort
    const spellcastingAbility = spellcasting.ability || 'intelligence'
    const spellAttackBonus = spellService.getSpellAttackBonus(activeCharacter)
    const spellSaveDC = spellService.getSpellSaveDC(activeCharacter)
    
    // Listes de sorts (filtrées selon le contexte)
    let knownSpells = spellService.getKnownSpells(activeCharacter)
    let preparedSpells = spellService.getPreparedSpells(activeCharacter)
    let cantrips = spellService.getCantrips(activeCharacter)
    
    // Si hors combat, filtrer pour ne montrer que les sorts castables hors combat
    if (isOutOfCombat || onCastSpell) {
      knownSpells = knownSpells.filter(spell => spell.castableOutOfCombat === true)
      preparedSpells = preparedSpells.filter(spell => spell.castableOutOfCombat === true)
      cantrips = cantrips.filter(spell => spell.castableOutOfCombat === true)
    }
    const maxPrepared = spellService.getMaxPreparedSpells(activeCharacter)
    
    // Emplacements de sort
    const spellSlots = spellService.getSpellSlots(activeCharacter)
    
    return {
      spellcastingAbility,
      spellAttackBonus,
      spellSaveDC,
      knownSpells,
      preparedSpells,
      cantrips,
      maxPrepared,
      spellSlots
    }
  }, [activeCharacter, spellService])

  // Filtrer et trier les sorts selon l'onglet actif
  const filteredSpells = useMemo(() => {
    let spells = []
    
    switch (activeTab) {
      case 'prepared':
        spells = spellData.preparedSpells
        break
      case 'known':
        spells = spellData.knownSpells
        break
      case 'cantrips':
        spells = spellData.cantrips
        break
      default:
        spells = []
    }
    
    return spellService.filterSpells(spells, filters)
  }, [spellData, activeTab, filters, spellService])

  // Gestionnaires d'événements
  const handleCastSpell = async (spell, level = null) => {
    try {
      // Si une fonction de callback est fournie, l'utiliser (pour hors combat)
      if (onCastSpell) {
        onCastSpell(spell, level)
        return
      }
      
      // Sinon utiliser la logique interne (pour en combat)
      const result = await castSpell(spell.id, level)
      
      if (result.success) {
        addCombatMessage(`${spell.name} lancé avec succès !`, 'spell-cast')
      } else {
        addCombatMessage(result.message, 'error')
      }
    } catch (error) {
      console.error('Erreur lors du lancement du sort:', error)
      addCombatMessage(`Impossible de lancer ${spell.name}: ${error.message}`, 'error')
    }
  }

  const handlePrepareSpell = async (spell) => {
    try {
      const result = await prepareSpell(spell.id)
      
      if (result.success) {
        addCombatMessage(`${spell.name} préparé`, 'spell-prepare')
      } else {
        addCombatMessage(result.message, 'error')
      }
    } catch (error) {
      console.error('Erreur lors de la préparation:', error)
      addCombatMessage(`Impossible de préparer ${spell.name}`, 'error')
    }
  }

  const handleUnprepareSpell = async (spell) => {
    try {
      const result = await unprepareSpell(spell.id)
      
      if (result.success) {
        addCombatMessage(`${spell.name} retiré des sorts préparés`, 'spell-unprepare')
      } else {
        addCombatMessage(result.message, 'error')
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
  }

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters })
  }

  // Compteurs pour les onglets
  const tabCounts = {
    prepared: spellData.preparedSpells.length,
    known: spellData.knownSpells.length,
    cantrips: spellData.cantrips.length
  }

  return (
    <Card className={`spell-panel ${className}`}>
      <CardHeader>
        <div className="spell-panel__header">
          <h3>🔮 Sorts de {activeCharacter.name}</h3>
          
          {/* Statistiques de sort */}
          <div className="spell-panel__stats">
            <div className="spell-stat">
              <span className="spell-stat__label">Bonus d'attaque:</span>
              <span className="spell-stat__value">+{spellData.spellAttackBonus}</span>
            </div>
            <div className="spell-stat">
              <span className="spell-stat__label">DD de sauvegarde:</span>
              <span className="spell-stat__value">{spellData.spellSaveDC}</span>
            </div>
            <div className="spell-stat">
              <span className="spell-stat__label">Sorts préparés:</span>
              <span className="spell-stat__value">
                {spellData.preparedSpells.length}/{spellData.maxPrepared}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardBody>
        {/* Traqueur d'emplacements de sort */}
        <SpellSlotTracker
          spellSlots={spellData.spellSlots}
          onSlotUse={(level) => {
            // Logic handled by spell casting
          }}
        />

        {/* Onglets */}
        <div className="spell-panel__tabs">
          <Button
            variant={activeTab === 'prepared' ? 'primary' : 'ghost'}
            onClick={() => handleTabChange('prepared')}
          >
            📋 Préparés ({tabCounts.prepared})
          </Button>
          
          <Button
            variant={activeTab === 'known' ? 'primary' : 'ghost'}
            onClick={() => handleTabChange('known')}
          >
            📚 Connus ({tabCounts.known})
          </Button>
          
          <Button
            variant={activeTab === 'cantrips' ? 'primary' : 'ghost'}
            onClick={() => handleTabChange('cantrips')}
          >
            ✨ Tours de magie ({tabCounts.cantrips})
          </Button>
        </div>

        {/* Filtres */}
        <SpellFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          activeTab={activeTab}
        />

        {/* Liste de sorts */}
        <SpellList
          spells={filteredSpells}
          character={activeCharacter}
          activeTab={activeTab}
          spellSlots={spellData.spellSlots}
          onSpellClick={setSelectedSpell}
          onCastSpell={handleCastSpell}
          onPrepareSpell={handlePrepareSpell}
          onUnprepareSpell={handleUnprepareSpell}
        />

        {/* État vide */}
        {filteredSpells.length === 0 && (
          <div className="spell-panel__empty">
            {activeTab === 'prepared' && spellData.preparedSpells.length === 0 ? (
              <p>🔮 Aucun sort préparé. Préparez des sorts depuis votre grimoire.</p>
            ) : activeTab === 'known' && spellData.knownSpells.length === 0 ? (
              <p>📚 Aucun sort connu. Vous apprendrez de nouveaux sorts en montant de niveau.</p>
            ) : activeTab === 'cantrips' && spellData.cantrips.length === 0 ? (
              <p>✨ Aucun tour de magie connu.</p>
            ) : (
              <p>🔍 Aucun sort ne correspond aux filtres appliqués.</p>
            )}
          </div>
        )}
      </CardBody>

      {/* Modal de détails de sort */}
      {selectedSpell && (
        <SpellDetailModal
          spell={selectedSpell}
          character={activeCharacter}
          spellSlots={spellData.spellSlots}
          onClose={() => setSelectedSpell(null)}
          onCast={handleCastSpell}
          onPrepare={handlePrepareSpell}
          onUnprepare={handleUnprepareSpell}
        />
      )}
    </Card>
  )
}

export default SpellPanel