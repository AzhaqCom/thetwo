/**
 * Script de test pour le système d'inventaire avec quantités
 * Peut être exécuté dans la console du navigateur pour tester
 */

import { consolidateItems, addItemToInventory, removeItemFromInventory } from './inventoryUtils.js'

// Données de test simulant le problème des scrolls d'intelligence dupliqués
const testInventory = [
  {
    id: 'scrollOfIntelligence',
    name: 'Parchemin d\'Intelligence',
    type: 'consumable',
    rarity: 'légendaire',
    quantity: 1
  },
  {
    id: 'scrollOfIntelligence',
    name: 'Parchemin d\'Intelligence', 
    type: 'consumable',
    rarity: 'légendaire',
    quantity: 1
  },
  {
    id: 'potionOfHealing',
    name: 'Potion de Soin',
    type: 'consumable',
    rarity: 'commun'
  },
  {
    id: 'potionOfHealing',
    name: 'Potion de Soin',
    type: 'consumable', 
    rarity: 'commun'
  },
  {
    id: 'longsword',
    name: 'Épée Longue',
    type: 'weapon',
    rarity: 'commun'
  }
]

console.log('=== Test du système d\'inventaire ===')
console.log('Inventaire initial:', testInventory)
console.log('Nombre d\'objets:', testInventory.length)

// Test de consolidation
console.log('\n=== Test de consolidation ===')
const consolidatedInventory = consolidateItems(testInventory)
console.log('Inventaire consolidé:', consolidatedInventory)
console.log('Nombre d\'objets après consolidation:', consolidatedInventory.length)

// Test d'ajout d'objet
console.log('\n=== Test d\'ajout d\'objet ===')
let newInventory = addItemToInventory(consolidatedInventory, {
  id: 'potionOfHealing',
  name: 'Potion de Soin',
  type: 'consumable',
  rarity: 'commun'
}, 3)
console.log('Après ajout de 3 potions:', newInventory)

// Test de suppression d'objet
console.log('\n=== Test de suppression d\'objet ===')
newInventory = removeItemFromInventory(newInventory, 'potionOfHealing', 2)
console.log('Après suppression de 2 potions:', newInventory)

// Test de suppression complète
console.log('\n=== Test de suppression complète ===')
newInventory = removeItemFromInventory(newInventory, 'scrollOfIntelligence', 5)
console.log('Après tentative de suppression de 5 parchemins (il n\'y en a que 2):', newInventory)

export { testInventory, consolidatedInventory }