import React from 'react'
import { Button, ButtonGroup } from '../../ui'

/**
 * Composant de filtrage et tri pour l'inventaire
 */
export const InventoryFilters = ({
  filters = {},
  onFilterChange,
  sortBy = 'name',
  onSortChange,
  className = ''
}) => {
  const handleSearchChange = (e) => {
    onFilterChange?.({ searchTerm: e.target.value })
  }

  const handleCategoryChange = (category) => {
    onFilterChange?.({ category })
  }

  const handleRarityChange = (rarity) => {
    onFilterChange?.({ rarity })
  }

  const clearFilters = () => {
    onFilterChange?.({
      category: 'all',
      rarity: 'all',
      searchTerm: ''
    })
  }

  const categories = [
    { value: 'all', label: 'Tout', icon: '📦' },
    { value: 'weapons', label: 'Armes', icon: '⚔️' },
    { value: 'armor', label: 'Armures', icon: '🛡️' },
    { value: 'consumables', label: 'Consommables', icon: '🧪' },
    { value: 'accessories', label: 'Accessoires', icon: '💎' },
    { value: 'misc', label: 'Divers', icon: '🎒' }
  ]

  const rarities = [
    { value: 'all', label: 'Toutes', color: '#9e9e9e' },
    { value: 'commun', label: 'Commun', color: '#9e9e9e' },
    { value: 'peu commun', label: 'Peu commun', color: '#4caf50' },
    { value: 'rare', label: 'Rare', color: '#2196f3' },
    { value: 'très rare', label: 'Très rare', color: '#9c27b0' },
    { value: 'légendaire', label: 'Légendaire', color: '#ff9800' }
  ]

  const sortOptions = [
    { value: 'name', label: 'Nom', icon: '🔤' },
    { value: 'type', label: 'Type', icon: '📁' },
    { value: 'weight', label: 'Poids', icon: '⚖️' },
    { value: 'rarity', label: 'Rareté', icon: '⭐' }
  ]

  return (
    <div className={`inventory-filters ${className}`}>
      {/* Barre de recherche */}
      <div className="inventory-filters__search">
        <div className="search-input-group">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Rechercher un objet..."
            value={filters.searchTerm || ''}
            onChange={handleSearchChange}
            className="search-input"
          />
          {filters.searchTerm && (
            <button
              type="button"
              className="search-clear"
              onClick={() => onFilterChange?.({ searchTerm: '' })}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filtres par catégorie */}
      <div className="inventory-filters__section">
        <h5 className="inventory-filters__label">Catégories</h5>
        <ButtonGroup className="inventory-filters__category-buttons">
          {categories.map(category => (
            <Button
              key={category.value}
              variant={filters.category === category.value ? 'primary' : 'ghost'}
              size="small"
              onClick={() => handleCategoryChange(category.value)}
            >
              <span className="button-icon">{category.icon}</span>
              {category.label}
            </Button>
          ))}
        </ButtonGroup>
      </div>

      {/* Filtres par rareté */}
      <div className="inventory-filters__section">
        <h5 className="inventory-filters__label">Rareté</h5>
        <ButtonGroup className="inventory-filters__rarity-buttons">
          {rarities.map(rarity => (
            <Button
              key={rarity.value}
              variant={filters.rarity === rarity.value ? 'primary' : 'ghost'}
              size="small"
              onClick={() => handleRarityChange(rarity.value)}
              style={filters.rarity === rarity.value ? { borderColor: rarity.color } : {}}
            >
              {rarity.label}
            </Button>
          ))}
        </ButtonGroup>
      </div>

      {/* Options de tri */}
      <div className="inventory-filters__section">
        <h5 className="inventory-filters__label">Trier par</h5>
        <ButtonGroup className="inventory-filters__sort-buttons">
          {sortOptions.map(option => (
            <Button
              key={option.value}
              variant={sortBy === option.value ? 'primary' : 'ghost'}
              size="small"
              onClick={() => onSortChange?.(option.value)}
            >
              <span className="button-icon">{option.icon}</span>
              {option.label}
            </Button>
          ))}
        </ButtonGroup>
      </div>

      {/* Actions rapides */}
      <div className="inventory-filters__actions">
        <Button
          variant="ghost"
          size="small"
          onClick={clearFilters}
          disabled={
            filters.category === 'all' && 
            filters.rarity === 'all' && 
            !filters.searchTerm
          }
        >
          🗑️ Effacer les filtres
        </Button>
      </div>
    </div>
  )
}

/**
 * Version compacte des filtres
 */
export const CompactInventoryFilters = ({
  filters = {},
  onFilterChange,
  showSearch = true,
  showCategories = true
}) => {
  return (
    <div className="inventory-filters inventory-filters--compact">
      {showSearch && (
        <div className="inventory-filters__search">
          <input
            type="text"
            placeholder="Recherche..."
            value={filters.searchTerm || ''}
            onChange={(e) => onFilterChange?.({ searchTerm: e.target.value })}
            className="search-input search-input--compact"
          />
        </div>
      )}
      
      {showCategories && (
        <div className="inventory-filters__quick-categories">
          <Button
            variant={filters.category === 'all' ? 'primary' : 'ghost'}
            size="small"
            onClick={() => onFilterChange?.({ category: 'all' })}
          >
            Tout
          </Button>
          <Button
            variant={filters.category === 'weapons' ? 'primary' : 'ghost'}
            size="small"
            onClick={() => onFilterChange?.({ category: 'weapons' })}
          >
            ⚔️
          </Button>
          <Button
            variant={filters.category === 'armor' ? 'primary' : 'ghost'}
            size="small"
            onClick={() => onFilterChange?.({ category: 'armor' })}
          >
            🛡️
          </Button>
          <Button
            variant={filters.category === 'consumables' ? 'primary' : 'ghost'}
            size="small"
            onClick={() => onFilterChange?.({ category: 'consumables' })}
          >
            🧪
          </Button>
        </div>
      )}
    </div>
  )
}

export default InventoryFilters