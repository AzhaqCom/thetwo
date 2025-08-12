import React from 'react'
import { Modal, Button, Card, CardHeader, CardBody, CardFooter } from '../../ui'

/**
 * Modal de détails d'un objet d'inventaire
 */
export const ItemDetailModal = ({
  item,
  character,
  onClose,
  onUse,
  onEquip,
  onUnequip
}) => {
  if (!item) return null

  // Informations de l'objet
  const itemName = item.nom || item.name || 'Objet inconnu'
  const itemDescription = item.description || 'Aucune description disponible'
  const itemQuantity = item.quantity || 1
  const itemWeight = item.poids || item.weight || 0
  const itemRarity = item.rarity || 'commun'
  const itemType = item.type || 'misc'
  const isEquipped = item.equipped || false

  // Propriétés spécifiques selon le type
  const getItemProperties = () => {
    const properties = []

    if (item.degats) {
      properties.push({ label: 'Dégâts', value: item.degats, icon: '⚔️' })
    }

    if (item.ca !== undefined) {
      properties.push({ label: 'Classe d\'Armure', value: `+${item.ca}`, icon: '🛡️' })
    }

    if (item.portee) {
      properties.push({ label: 'Portée', value: `${item.portee} m`, icon: '🏹' })
    }

    if (item.proprietes && item.proprietes.length > 0) {
      properties.push({ 
        label: 'Propriétés', 
        value: item.proprietes.join(', '), 
        icon: '⭐' 
      })
    }

    if (item.effet) {
      properties.push({ label: 'Effet', value: item.effet, icon: '✨' })
    }

    if (item.duree) {
      properties.push({ label: 'Durée', value: item.duree, icon: '⏱️' })
    }

    if (item.prix) {
      properties.push({ label: 'Prix', value: `${item.prix} po`, icon: '💰' })
    }

    return properties
  }

  // Icône selon le type
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
      case 'gemme':
        return '💎'
      case 'composant':
        return '🧪'
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

  // Vérifications d'actions possibles
  const canBeEquipped = () => {
    return ['arme', 'armure', 'accessoire'].includes(itemType) && !isEquipped
  }

  const canBeUsed = () => {
    return item.effet || item.action || itemType === 'potion'
  }

  const properties = getItemProperties()

  return (
    <Modal onClose={onClose} size="medium">
      <Card className="item-detail-modal">
        <CardHeader>
          <div className="item-detail-header">
            <div className="item-detail-icon-container">
              <span 
                className="item-detail-icon"
                style={{ color: getRarityColor(itemRarity) }}
              >
                {getItemIcon()}
              </span>
              {itemQuantity > 1 && (
                <span className="item-detail-quantity">x{itemQuantity}</span>
              )}
            </div>
            
            <div className="item-detail-title">
              <h2 className="item-detail-name">{itemName}</h2>
              <div className="item-detail-meta">
                <span 
                  className="item-detail-rarity"
                  style={{ color: getRarityColor(itemRarity) }}
                >
                  {itemRarity}
                </span>
                <span className="item-detail-type">{itemType}</span>
                {isEquipped && (
                  <span className="item-detail-equipped">✓ Équipé</span>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardBody>
          {/* Description */}
          <div className="item-detail-section">
            <h4>Description</h4>
            <p className="item-detail-description">{itemDescription}</p>
          </div>

          {/* Propriétés */}
          {properties.length > 0 && (
            <div className="item-detail-section">
              <h4>Propriétés</h4>
              <div className="item-detail-properties">
                {properties.map((prop, index) => (
                  <div key={index} className="item-detail-property">
                    <span className="property-icon">{prop.icon}</span>
                    <span className="property-label">{prop.label}:</span>
                    <span className="property-value">{prop.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Statistiques de base */}
          <div className="item-detail-section">
            <h4>Informations</h4>
            <div className="item-detail-stats">
              <div className="stat-item">
                <span className="stat-icon">⚖️</span>
                <span className="stat-label">Poids:</span>
                <span className="stat-value">{itemWeight} kg</span>
              </div>
              
              {itemQuantity > 1 && (
                <div className="stat-item">
                  <span className="stat-icon">📦</span>
                  <span className="stat-label">Quantité:</span>
                  <span className="stat-value">{itemQuantity}</span>
                </div>
              )}
            </div>
          </div>

          {/* Conditions d'utilisation */}
          {(item.prerequis || item.restrictions) && (
            <div className="item-detail-section">
              <h4>Restrictions</h4>
              <div className="item-detail-restrictions">
                {item.prerequis && (
                  <p className="restriction">
                    <span className="restriction-icon">⚠️</span>
                    Prérequis: {item.prerequis}
                  </p>
                )}
                {item.restrictions && (
                  <p className="restriction">
                    <span className="restriction-icon">🚫</span>
                    {item.restrictions}
                  </p>
                )}
              </div>
            </div>
          )}
        </CardBody>

        <CardFooter>
          <div className="item-detail-actions">
            <Button
              variant="ghost"
              onClick={onClose}
            >
              Fermer
            </Button>

            {canBeUsed() && (
              <Button
                variant="primary"
                onClick={() => {
                  onUse?.(item)
                  onClose()
                }}
              >
                🧪 Utiliser
              </Button>
            )}

            {canBeEquipped() && (
              <Button
                variant="secondary"
                onClick={() => {
                  onEquip?.(item)
                  onClose()
                }}
              >
                ⚔️ Équiper
              </Button>
            )}

            {isEquipped && (
              <Button
                variant="ghost"
                onClick={() => {
                  onUnequip?.(item)
                  onClose()
                }}
              >
                🗲 Retirer
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </Modal>
  )
}

export default ItemDetailModal