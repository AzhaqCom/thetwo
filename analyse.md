# 📋 Rapport d'Audit de Code - Visual Novel RPG

**Date d'analyse :** 16 Août 2025  
**Scope :** Ensemble du projet src/  
**Focus :** Code obsolète, doublons, inefficacités et cohérence architecturale  

---

## 🚨 Code Obsolète Détecté

### 1. **Ancien Système de Gestion des Scènes**

#### 📁 **Fichier : `src/components/utils/sceneUtils.js`**

**❌ Code à supprimer :**

- **Ligne 263** : `export const isNewSceneFormat = (scene) => {`
  - **Raison :** Cette fonction était utilisée pour différencier l'ancien et le nouveau format de scènes. Depuis la migration complète vers `renderNewSceneFormat`, elle n'est plus nécessaire.

- **Lignes 268-285** : `export const adaptLegacyScene = (oldScene, sceneId) => {`
  - **Raison :** Fonction de conversion des anciennes scènes vers le nouveau format. Plus nécessaire car toutes les scènes utilisent maintenant le nouveau format.

- **Lignes 166-167** : Commentaire "Format ancien"
  - **Raison :** Références à l'ancien système dans les commentaires.

#### 📁 **Fichier : `src/components/utils/sceneRendering.js`**

**❌ Code partiellement obsolète :**

- **Lignes 24-39** : `export const convertLegacyCombatToNewFormat = (legacyCombat) => {`
  - **Raison :** Cette fonction est toujours utilisée dans App.jsx (ligne 618) mais pourrait être éliminée si tous les combats sont migrés vers le nouveau format.

### 2. **Système Mono-Compagnon Obsolète**

#### 📁 **Fichier : `src/stores/characterStore.js`**

**❌ Code legacy à nettoyer :**

- **Ligne 24** : `playerCompanion: null, // Gardé pour compatibilité temporaire`
- **Ligne 46-48** : `setPlayerCompanion: (companion) => set({ playerCompanion: companion ? GameLogic.deepClone(companion) : null })`
- **Lignes 104-119** : Logique de mise à jour de `playerCompanion` en parallèle des `playerCompanions`
- **Lignes 132-135** : `takeDamageCompanion` pour système mono-compagnon
- **Lignes 164-167** : `healCompanion` pour système mono-compagnon
- **Lignes 205-208** : `longRestCompanion` pour système mono-compagnon
- **Lignes 797-835** : Sélecteurs legacy : `getPlayerCompanion`, `hasCompanion`, `isCompanionAlive`, `getCompanionHealthPercent`

#### 📁 **Fichier : `src/App.jsx`**

**❌ Code de compatibilité à supprimer :**

- **Ligne 86** : `playerCompanion,`
- **Ligne 88** : `setPlayerCompanion,`
- **Lignes 135-138** : Logique XP pour compagnon unique
- **Ligne 517** : `playerCompanion={playerCompanion}`
- **Lignes 535-539** : Restauration HP pour compagnon unique
- **Lignes 664-666** : Fallback d'affichage du compagnon unique

#### 📁 **Fichiers avec références `playerCompanion` à nettoyer :**

- `src/services/CombatService.js` (lignes 14, 19, 24, 74, 94-97, 131, 135, 487, 489)
- `src/components/features/combat/CombatPanel.jsx` (lignes 16, 71, 74, 120, 353)
- `src/components/features/combat/CombatGrid.jsx` (lignes 9, 57, 340)
- `src/components/features/combat/CombatTurnManager.jsx` (lignes 30, 109, 350, 434, 574)

### 3. **Code de Gestion d'Entités Pré-EntityAI**

#### 📁 **Fichier : `src/services/combatEngine.js`**

**❌ Commentaires obsolètes :**

- **Ligne 192** : `// Plus de compatibilité ancien système nécessaire`
- **Ligne 236** : `break // Fallback à l'ancienne logique`
- **Ligne 454** : `// Plus de compatibilité ancien système nécessaire`

#### 📁 **Fichier : `src/components/utils/sceneUtils.js`**

**❌ Code de compatibilité EntityAI :**

- **Ligne 118** : `// Compatibilité avec l'ancien système (pour le premier compagnon)`

---

## 🔄 Doublons et Inefficacités

### 1. **Logique de Calcul de Dégâts Dupliquée**

#### 📁 **Problème Principal**

**Fonction `calculateDamage` présente dans :**
- `src/services/combatEngine.js` - Ligne 15 (version principale)
- `src/services/CombatService.js` - Ligne 678 (appel de CombatEngine.calculateDamage)
- `src/stores/combatStore.js` - Lignes 645, 682, 699 (appels multiples)

**💡 Recommandation :** Centraliser tous les appels vers `CombatEngine.calculateDamage` et supprimer les implémentations redondantes.

### 2. **Calculs d'Initiative Dupliqués**

#### 📁 **Doublons identifiés :**

**Dans `src/services/CombatService.js` :**
- Lignes 84-86 : Initiative joueur
- Lignes 94-97 : Initiative compagnon  
- Lignes 107-109 : Initiative ennemis

**Dans `src/stores/combatStore.js` :**
- Lignes 79-80 : Initiative joueur (logique similaire)
- Lignes 91-94 : Initiative compagnons (logique similaire)
- Lignes 115-117 : Initiative ennemis (logique similaire)

**💡 Recommandation :** Créer une fonction utilitaire `calculateInitiative(entity)` dans `utils/calculations.js`.

### 3. **Gestion des Modificateurs Redondante**

#### 📁 **Usage excessif de `getModifier` :**

**43 fichiers** utilisent `getModifier` de manière répétitive. Exemples notables :

- `src/services/CombatService.js` : 8 appels
- `src/services/characterManager.js` : 7 appels  
- `src/components/features/character/CharacterSheet.jsx` : 3 appels

**💡 Recommandation :** Créer des fonctions helper comme `getAttackBonus(character)`, `getSaveBonus(character, saveType)` pour éviter les calculs répétitifs.

### 4. **Code CSS Redondant**

#### 📁 **Grilles CSS dupliquées :**

- `src/App.css:967` : `grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))`
- `src/styles/layout.css:29` : `grid-template-columns: repeat(2, 1fr)`
- `src/styles/combat.css:41-42` : Grilles de combat
- `src/components/game/ShopInterface.css:13` : Grille similaire

**💡 Recommandation :** Créer des classes utilitaires CSS pour les layouts de grille dans `styles/utilities.css`.

---

## 📋 TODOs Identifiés

### 1. **Combat System**

#### 📁 **Fichier : `src/stores/combatStore.js`**
- **Ligne 297** : `// TODO: Gérer les effets pour joueur et compagnons`
- **Ligne 358** : `// TODO: Implémenter l'exécution des attaques d'opportunité`
- **Ligne 529** : `// TODO: Coordination avec characterStore pour vérifier l'état du joueur`
- **Ligne 695** : `// TODO: Implémenter la logique de retraite`
- **Ligne 712** : `// TODO: Implémenter le mouvement de charge`
- **Ligne 718** : `// TODO: Implémenter la logique de retraite`
- **Ligne 760** : `// TODO: Implémenter la gestion des effets de combat`

#### 📁 **Fichier : `src/services/CombatService.js`**
- **Ligne 897** : `// TODO: Implémenter la consommation de slots`

#### 📁 **Fichier : `src/components/features/combat/CombatGrid.jsx`**
- **Ligne 106** : `// TODO: Gérer les sorts de soin vs dégâts`
- **Ligne 144** : `// TODO: Implémenter les lignes`

### 2. **Inventory System**

#### 📁 **Fichier : `src/App.jsx`**
- **Ligne 345** : `// TODO: Implémenter removeItemFromInventory`

### 3. **Debug Code**

#### 📁 **Fichier : `src/data/scene_test.js`**
- **Ligne 39** : `text: "[DEBUG] Retour au menu principal",`

**💡 Priorité Haute :** Les TODOs du système de combat sont critiques pour l'expérience de jeu.

---

## 🏗️ Incohérences Architecturales

### 1. **Fichiers d'Ancien Format Toujours Présents**

#### 📁 **Fichier : `src/data/scenes.js`**

**❌ Problème :** Ce fichier contient 306 lignes d'anciennes scènes au format obsolète.

**Lignes problématiques :**
- Toutes les scènes utilisent l'ancien format `{ text: "...", choices: [...] }`
- Pas de `metadata.type`
- Utilise `action` dans les choix au lieu de navigation directe

**💡 Recommandation :** 
1. Migrer toutes les scènes vers `scenes_examples.js`
2. Supprimer `scenes.js`
3. Nettoyer les imports dans `App.jsx`

### 2. **Mélange de Conventions**

#### 📁 **Problème : Formats de Navigation Mixtes**

**Dans `src/data/scenes_examples.js` :**
- Lignes 575, 702, 1014, 1278, 1401 : Utilise `nextScene:` 
- Autres scènes : Utilise `next:`

**💡 Recommandation :** Unifier vers `next:` partout comme défini dans le guide.

### 3. **Logique Métier Dispersée**

#### 📁 **Services avec Responsabilités Floues**

**`src/services/CombatService.js` vs `src/services/combatEngine.js` :**
- Logique de combat répartie entre deux fichiers
- Fonctions similaires dans les deux
- Pas de séparation claire des responsabilités

**💡 Recommandation :** 
- `CombatEngine` : Logique pure (calculs, règles)
- `CombatService` : Orchestration et état

### 4. **Imports Inutilisés**

#### 📁 **Fichier : `src/components/features/character/CharacterSelectionCard.jsx`**
- **Ligne 3** : `import { getModifier } from '../../../utils/calculations'`
  - **Non utilisé** dans le composant

#### 📁 **Fichier : `src/services/StoryService.js`**
- **Ligne 109** : Commentaire "Variables simples (compatibilité avec l'ancien système)"

---

## 🎯 Recommandations de Refactorisation

### **Priorité 1 - Critique**

1. **Supprimer le système mono-compagnon** de `characterStore.js`
2. **Migrer/Supprimer** `src/data/scenes.js`
3. **Unifier les formats de navigation** (`nextScene:` → `next:`)
4. **Implémenter les TODOs critiques** du système de combat

### **Priorité 2 - Important**

1. **Centraliser les calculs de dégâts** vers `CombatEngine`
2. **Créer des helpers** pour les calculs de modificateurs répétitifs
3. **Nettoyer les fonctions obsolètes** de `sceneUtils.js`
4. **Unifier les classes CSS** pour les grilles

### **Priorité 3 - Amélioration**

1. **Séparer clairement** `CombatService` et `CombatEngine`
2. **Supprimer les commentaires legacy**
3. **Nettoyer les imports inutilisés**
4. **Documenter l'architecture finale**


  - CombatEngine: Pure logic (calculations, rules)
  - CombatService: Orchestration and state

  Currently, both files have mixed responsibilities. Let me analyze and reorganize them:

  Current CombatService has:
  - ✅ Combat initialization (orchestration)
  - ❌ Pure calculation methods (rollD20, rollDamage, calculateDamage)
  - ❌ Attack bonus calculations (should be in Engine)
  - ✅ Action execution (orchestration)

  Current CombatEngine has:
  - ✅ Pure calculations (damage, distance, targeting)
  - ✅ Movement validation
  - ❌ Some target finding logic that could be orchestration

Reorganize these files properly:



---

## 📊 Métriques de Dette Technique

| Catégorie | Fichiers Affectés | Lignes à Nettoyer | Impact |
|-----------|-------------------|-------------------|---------|
| **Système Mono-Compagnon** | 8 fichiers | ~150 lignes | 🔴 Critique |
| **Ancien Système Scènes** | 3 fichiers | ~50 lignes | 🟡 Moyen |
| **Doublons de Logique** | 12 fichiers | ~80 lignes | 🟡 Moyen |
| **TODOs Combat** | 3 fichiers | 8 TODOs | 🔴 Critique |
| **Formats Mixtes** | 1 fichier | ~20 lignes | 🟢 Faible |

**Total estimé :** ~310 lignes de code à nettoyer sur 43 fichiers identifiés.

---

## ✅ Points Positifs

1. **Architecture moderne** avec Zustand et composants modulaires
2. **Séparation claire** entre logique métier et UI
3. **Système de types** bien défini dans `types/story.js`
4. **EntityAI** bien implémenté et centralisé
5. **Nouveau système de scènes** cohérent et extensible

---

## 🚀 Plan d'Action Recommandé

### **Phase 1 - Nettoyage Critical (1-2 jours)**
1. Supprimer le système `playerCompanion` legacy
2. Migrer les scènes de `scenes.js` vers le nouveau format
3. Unifier `nextScene` → `next`

### **Phase 2 - Optimisation (1 jour)**  
1. Centraliser les calculs de dégâts
2. Créer les helpers de modificateurs
3. Nettoyer les fonctions obsolètes

### **Phase 3 - Finition (0.5 jour)**
1. Supprimer les commentaires legacy
2. Nettoyer les imports inutilisés
3. Documenter l'architecture finale

**Estimation totale :** 3-4 jours de refactorisation pour un codebase parfaitement propre et maintenable.

---

*Ce rapport a été généré automatiquement par l'audit de code approfondi du 16 Août 2025.*