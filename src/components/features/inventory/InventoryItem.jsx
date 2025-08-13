import React from 'react'
import { Card, Button } from '../../ui'

/**
 * Composant d'affichage d'un objet d'inventaire
 */
export const InventoryItem = ({
  item,
  character,
  viewMode = 'grid',
  onClick,
  onUse,
  onEquip,
  onUnequip,
  className = ''
}) => {
  // Informations de l'objet
  const itemName = item.nom || item.name || 'Objet inconnu'
  const itemDescription = item.description || 'Aucune description'
  const itemQuantity = item.quantity || 1
  const itemWeight = item.poids || item.weight || 0
  const itemRarity = item.rarity || 'commun'
  const itemType = item.type || 'misc'
  const isEquipped = item.equipped || false

  // Classes CSS
  const itemClass = [
    'inventory-item',
    `inventory-item--${viewMode}`,
    `inventory-item--${itemType}`,
    `inventory-item--${itemRarity.replace(/\s+/g, '-')}`,
    isEquipped && 'inventory-item--equipped',
    className
  ].filter(Boolean).join(' ')

  // Icône selon le type d'objet
  const getItemIcon = () => {
    switch (itemType) {
      case 'arme':
        return '⚔️'
      case 'armure':
        return '🛡️'
      case 'potion':
        return '🧪'
      case 'accessoire':
        return '💎'
      case 'outil':
        return '🔧'
      case 'livre':
        return '📚'
      default:
        return '📦'
    }
  }

  // Couleur de rareté
  const getRarityColor = (rarity) => {
    switch (rarity?.toLowerCase()) {
      case 'commun':
        return '#9e9e9e'
      case 'peu commun':
        return '#4caf50'
      case 'rare':
        return '#2196f3'
      case 'très rare':
        return '#9c27b0'
      case 'légendaire':
        return '#ff9800'
      case 'artéfact':
        return '#f44336'
      default:
        return '#9e9e9e'
    }
  }

  // Vérifier si l'objet peut être équipé
  const canBeEquipped = () => {
    return ['arme', 'armure', 'accessoire'].includes(itemType) && !isEquipped
  }

  // Vérifier si l'objet peut être utilisé
  const canBeUsed = () => {
    return item.effet || item.action || itemType === 'potion' || itemType === 'consumable'
  }

  // Rendu pour le mode grille
  const renderGridMode = () => (
    <Card 
      className={itemClass}
      onClick={onClick}
      style={{ borderColor: getRarityColor(itemRarity) }}
    >
      <div className="inventory-item__content">
        <div className="inventory-item__header">
          <span className="inventory-item__icon">{getItemIcon()}</span>
          {itemQuantity > 1 && (
            <span className="inventory-item__quantity">{itemQuantity}</span>
          )}
          {isEquipped && (
            <span className="inventory-item__equipped-badge">✓</span>
          )}
        </div>
        
        <div className="inventory-item__info">
          <h4 className="inventory-item__name">{itemName}</h4>
          <p className="inventory-item__type">{itemType}</p>
          
          {viewMode !== 'compact' && (
            <>
              <p className="inventory-item__description">
                {itemDescription.length > 50 
                  ? `${itemDescription.substring(0, 50)}...` 
                  : itemDescription
                }
              </p>
              
              <div className="inventory-item__stats">
                {itemWeight > 0 && (
                  <span className="inventory-item__weight">⚖️ {itemWeight} kg</span>
                )}
                <span className="inventory-item__rarity">{itemRarity}</span>
              </div>
            </>
          )}
        </div>
        
        {viewMode !== 'compact' && (
          <div className="inventory-item__actions">
            {canBeUsed() && (
              <Button
                size="small"
                variant="primary"
                onClick={(e) => {
                  e.stopPropagation()
                  onUse?.()
                }}
              >
                Utiliser
              </Button>
            )}
            
            {canBeEquipped() && (
              <Button
                size="small"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation()
                  onEquip?.()
                }}
              >
                Équiper
              </Button>
            )}
            
            {isEquipped && (
              <Button
                size="small"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  onUnequip?.()
                }}
              >
                Retirer
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  )

  // Rendu pour le mode liste
  const renderListMode = () => (
    <div className={itemClass} onClick={onClick}>
      <div className="inventory-item__list-content">
        <span className="inventory-item__icon">{getItemIcon()}</span>
        
        <div className="inventory-item__list-info">
          <div className="inventory-item__list-primary">
            <h4 className="inventory-item__name">{itemName}</h4>
            {itemQuantity > 1 && (
              <span className="inventory-item__quantity">x{itemQuantity}</span>
            )}
            {isEquipped && (
              <span className="inventory-item__equipped-badge">Équipé</span>
            )}
          </div>
          
          <div className="inventory-item__list-secondary">
            <span className="inventory-item__type">{itemType}</span>
            <span className="inventory-item__rarity">{itemRarity}</span>
            {itemWeight > 0 && (
              <span className="inventory-item__weight">{itemWeight} kg</span>
            )}
          </div>
        </div>
        
        <div className="inventory-item__list-actions">
          {canBeUsed() && (
            <Button
              size="small"
              variant="primary"
              onClick={(e) => {
                e.stopPropagation()
                onUse?.()
              }}
            >
              Utiliser
            </Button>
          )}
          
          {canBeEquipped() && (
            <Button
              size="small"
              variant="secondary" 
              onClick={(e) => {
                e.stopPropagation()
                onEquip?.()
              }}
            >
              Équiper
            </Button>
          )}
          
          {isEquipped && (
            <Button
              size="small"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                onUnequip?.()
              }}
            >
              Retirer
            </Button>
          )}
        </div>
      </div>
    </div>
  )

  // Rendu selon le mode
  switch (viewMode) {
    case 'list':
      return renderListMode()
    case 'compact':
    case 'grid':
    default:
      return renderGridMode()
  }
}

export default InventoryItem