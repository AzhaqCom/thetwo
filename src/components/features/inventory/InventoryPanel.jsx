import React, { useMemo, useState } from 'react'
import { useCharacterStore } from '../../../stores/characterStore'
import { useGameStore } from '../../../stores/gameStore'
import { Card, CardHeader, CardBody, Button } from '../../ui'
import { InventoryGrid } from './InventoryGrid'
import { InventoryFilters } from './InventoryFilters'
import { ItemDetailModal } from './ItemDetailModal'

/**
 * Panneau d'inventaire moderne avec gestion Zustand
 */
export const InventoryPanel = ({
  className = ''
}) => {
  // Stores
  const { 
    selectedCharacter,
    useItem,
    equipItem,
    unequipItem 
  } = useCharacterStore()
  
  const { addCombatMessage } = useGameStore()
  
  // État local
  const [selectedItem, setSelectedItem] = useState(null)
  const [filters, setFilters] = useState({
    category: 'all',
    rarity: 'all',
    searchTerm: ''
  })
  const [sortBy, setSortBy] = useState('name')
  const [viewMode, setViewMode] = useState('grid') // grid, list

  // Calculs dérivés
  const inventoryData = useMemo(() => {
    if (!selectedCharacter?.equipement) return { items: [], totalWeight: 0, maxWeight: 0 }
    
    const allItems = [
      ...(selectedCharacter.equipement.inventaire || []),
      ...(selectedCharacter.equipement.armes || []),
      ...(selectedCharacter.equipement.armures || []),
      ...(selectedCharacter.equipement.accessoires || [])
    ]
    
    // Appliquer les filtres
    let filteredItems = allItems.filter(item => {
      // Filtre par catégorie
      if (filters.category !== 'all') {
        const itemCategory = getItemCategory(item)
        if (itemCategory !== filters.category) return false
      }
      
      // Filtre par rareté
      if (filters.rarity !== 'all' && item.rarity !== filters.rarity) {
        return false
      }
      
      // Recherche textuelle
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase()
        return (
          item.nom?.toLowerCase().includes(searchLower) ||
          item.description?.toLowerCase().includes(searchLower) ||
          item.name?.toLowerCase().includes(searchLower)
        )
      }
      
      return true
    })
    
    // Trier
    filteredItems = sortItems(filteredItems, sortBy)
    
    // Calculer le poids total
    const totalWeight = allItems.reduce((sum, item) => 
      sum + (item.poids || item.weight || 0) * (item.quantity || 1), 0
    )
    
    const maxWeight = calculateCarryingCapacity(selectedCharacter)
    
    return {
      items: filteredItems,
      totalWeight,
      maxWeight,
      allItemsCount: allItems.length
    }
  }, [selectedCharacter?.equipement, filters, sortBy])

  // Gestionnaires d'événements
  const handleUseItem = async (item) => {
    try {
      const result = await useItem(item.id || item.nom || item.name)
      
      if (result.success) {
        addCombatMessage(result.message || `${item.nom || item.name} utilisé avec succès`, 'item-use')
      } else {
        addCombatMessage(result.message || `Impossible d'utiliser ${item.nom || item.name}`, 'error')
      }
    } catch (error) {
      console.error('Erreur lors de l\'utilisation de l\'objet:', error)
      addCombatMessage(`Erreur: ${error.message}`, 'error')
    }
  }

  const handleEquipItem = async (item) => {
    try {
      const result = await equipItem(item.id || item.nom || item.name)
      
      if (result.success) {
        addCombatMessage(`${item.nom || item.name} équipé`, 'item-equip')
      } else {
        addCombatMessage(result.message, 'error')
      }
    } catch (error) {
      console.error('Erreur lors de l\'équipement:', error)
      addCombatMessage(`Impossible d'équiper ${item.nom || item.name}`, 'error')
    }
  }

  const handleUnequipItem = async (item) => {
    try {
      const result = await unequipItem(item.id || item.nom || item.name)
      
      if (result.success) {
        addCombatMessage(`${item.nom || item.name} déséquipé`, 'item-unequip')
      } else {
        addCombatMessage(result.message, 'error')
      }
    } catch (error) {
      console.error('Erreur lors du déséquipement:', error)
      addCombatMessage(`Impossible de déséquiper ${item.nom || item.name}`, 'error')
    }
  }

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters })
  }

  const handleSort = (newSortBy) => {
    setSortBy(newSortBy)
  }

  if (!selectedCharacter) {
    return (
      <Card className={`inventory-panel ${className}`}>
        <CardBody>
          <p>Aucun personnage sélectionné</p>
        </CardBody>
      </Card>
    )
  }

  const isOverloaded = inventoryData.totalWeight > inventoryData.maxWeight

  return (
    <Card className={`inventory-panel ${className}`}>
      <CardHeader>
        <div className="inventory-panel__header">
          <h3>🎒 Inventaire de {selectedCharacter.name}</h3>
          
          <div className="inventory-panel__stats">
            <div className={`inventory-weight ${isOverloaded ? 'inventory-weight--overloaded' : ''}`}>
              <span>⚖️ Poids: {inventoryData.totalWeight.toFixed(1)}/{inventoryData.maxWeight} kg</span>
              {isOverloaded && <span className="overload-warning">⚠️ Surcharge</span>}
            </div>
            
            <div className="inventory-count">
              <span>📦 Objets: {inventoryData.items.length}/{inventoryData.allItemsCount}</span>
            </div>
          </div>
          
          <div className="inventory-panel__controls">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'ghost'}
              size="small"
              onClick={() => setViewMode('grid')}
            >
              🔳 Grille
            </Button>
            
            <Button
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="small"
              onClick={() => setViewMode('list')}
            >
              📝 Liste
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardBody>
        {/* Filtres et recherche */}
        <InventoryFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          sortBy={sortBy}
          onSortChange={handleSort}
        />

        {/* Grille d'inventaire */}
        <InventoryGrid
          items={inventoryData.items}
          viewMode={viewMode}
          onItemClick={setSelectedItem}
          onItemUse={handleUseItem}
          onItemEquip={handleEquipItem}
          onItemUnequip={handleUnequipItem}
          character={selectedCharacter}
        />

        {/* État vide */}
        {inventoryData.items.length === 0 && (
          <div className="inventory-empty">
            {inventoryData.allItemsCount === 0 ? (
              <p>🎒 Votre inventaire est vide</p>
            ) : (
              <p>🔍 Aucun objet ne correspond aux filtres appliqués</p>
            )}
          </div>
        )}
      </CardBody>

      {/* Modal de détails d'objet */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          character={selectedCharacter}
          onClose={() => setSelectedItem(null)}
          onUse={handleUseItem}
          onEquip={handleEquipItem}
          onUnequip={handleUnequipItem}
        />
      )}
    </Card>
  )
}

// Fonctions utilitaires
function getItemCategory(item) {
  if (item.type === 'arme' || item.degats) return 'weapons'
  if (item.type === 'armure' || item.ca) return 'armor'
  if (item.type === 'potion' || item.effet) return 'consumables'
  if (item.type === 'accessoire') return 'accessories'
  return 'misc'
}

function sortItems(items, sortBy) {
  return [...items].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return (a.nom || a.name || '').localeCompare(b.nom || b.name || '')
      case 'weight':
        return (a.poids || a.weight || 0) - (b.poids || b.weight || 0)
      case 'rarity':
        const rarityOrder = { 'commun': 0, 'peu commun': 1, 'rare': 2, 'très rare': 3, 'légendaire': 4 }
        return (rarityOrder[a.rarity] || 0) - (rarityOrder[b.rarity] || 0)
      case 'type':
        return getItemCategory(a).localeCompare(getItemCategory(b))
      default:
        return 0
    }
  })
}

function calculateCarryingCapacity(character) {
  if (!character?.stats?.force) return 50
  return character.stats.force * 7.5 // 15 livres par point de Force, converti en kg
}

export default InventoryPanel