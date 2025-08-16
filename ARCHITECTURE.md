# 🏗️ Architecture du Système de Combat - Visual Novel RPG

**Date :** 16 Août 2025  
**Version :** Post-refactorisation Priorité 3  
**Objectif :** Documentation de l'architecture finale après nettoyage

---

## 📋 Vue d'Ensemble

L'architecture du système de combat suit maintenant une séparation claire des responsabilités entre **calculs purs** et **orchestration d'état**.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CombatStore   │    │  CombatService  │    │  CombatEngine   │
│   (État Zustand)│◄──►│  (Orchestration)│◄──►│  (Calculs Purs) │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                       ▲                       ▲
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI Components │    │    EntityAI     │    │    Utilities   │
│                 │    │  (Logique IA)   │    │ (calculations)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🎯 Responsabilités par Couche

### **CombatEngine** - Logique Pure ⚙️
**Rôle :** Calculs purs, règles de jeu, validations
**Aucun état :** Toutes les méthodes sont statiques

```javascript
// ✅ Responsabilités CombatEngine
- rollD20(), rollDamage() // Calculs de dés
- calculateAttackBonus() // Bonus d'attaque
- calculateSpellAttackBonus() // Bonus sorts
- calculateSaveBonus() // Jets de sauvegarde
- isDefeated() // Règles de défaite
- validateMovement() // Validation mouvement
- calculateOptimalMovement() // Calcul de position
- findBestTarget() // Recherche de cible optimale
- getTargetsInRange() // Cibles dans un rayon
- calculateDistance() // Calculs de distance
```

### **CombatService** - Orchestration 🎭
**Rôle :** Coordination, exécution d'actions, gestion de séquences
**Délègue :** Tous les calculs vers CombatEngine

```javascript
// ✅ Responsabilités CombatService
- initializeCombat() // Orchestration initialisation
- createEnemiesFromEncounter() // Création entités
- rollInitiative() // Coordination initiative
- executePlayerAction() // Exécution actions joueur
- executeCompanionAction() // Exécution actions IA
- executeAttack() / executeSpell() // Séquences d'action
- checkCombatEnd() // Vérification conditions victoire
```

### **EntityAI** - Intelligence Artificielle 🤖
**Rôle :** Prise de décision tactique, sélection d'actions
**Utilise :** CombatEngine pour les calculs

```javascript
// ✅ Responsabilités EntityAI
- getBestAction() // Décision action optimale
- findTargets() // Logique de ciblage IA
- canCastSpell() // Vérification sorts disponibles
- tankAI / healerAI / dpsAI // Modules IA par rôle
- supportAI / skirmisherAI / bruteAI / casterAI
```

### **CombatStore** - État Global 📦
**Rôle :** Gestion d'état Zustand, persistance
**Coordonne :** CombatService et EntityAI

```javascript
// ✅ Responsabilités CombatStore
- État du combat (turnOrder, positions, etc.)
- Actions utilisateur (initCombat, playerAction)
- Intégration avec CharacterStore
- Gestion des effets de combat
```

---

## 🔄 Flux d'Exécution

### **Action du Joueur**
```
1. UI Component → CombatStore.playerAction()
2. CombatStore → CombatService.executePlayerAction()
3. CombatService → CombatEngine.calculateAttackBonus()
4. CombatService → CombatEngine.rollDamage()
5. CombatService → Retour résultats
6. CombatStore → Mise à jour état
7. UI → Re-render
```

### **Action IA (Compagnon/Ennemi)**
```
1. CombatStore.nextTurn() → EntityAI.getBestAction()
2. EntityAI → CombatEngine.findBestTarget()
3. EntityAI → Retour action optimale
4. CombatStore → CombatService.executeCompanionAction()
5. CombatService → CombatEngine calculs nécessaires
6. CombatService → Retour résultats
7. CombatStore → Mise à jour état
```

---

## 🧹 Nettoyage Effectué

### **Délégation CombatService → CombatEngine**
- ✅ `rollD20()` délègue vers `CombatEngine.rollD20()`
- ✅ `rollDamage()` délègue vers `CombatEngine.rollDamage()`
- ✅ `getAttackBonus()` délègue vers `CombatEngine.calculateAttackBonus()`
- ✅ `getSpellAttackBonus()` délègue vers `CombatEngine.calculateSpellAttackBonus()`
- ✅ `getSaveBonus()` délègue vers `CombatEngine.calculateSaveBonus()`
- ✅ `isDefeated()` délègue vers `CombatEngine.isDefeated()`
- ✅ Utilitaires dés délèguent vers CombatEngine

### **Commentaires Legacy Supprimés**
- ✅ `// Plus de compatibilité ancien système nécessaire`
- ✅ `// Ancienne logique pour...` → `// Logique pour...`
- ✅ `// Fallback à l'ancienne logique` → `// Fallback`
- ✅ `// Délégation pour la compatibilité avec l'ancien système`

### **Imports Inutilisés Nettoyés**
- ✅ `getConstitutionModifier` supprimé de CombatService
- ✅ `getSpellAttackBonus` supprimé de CombatService (délégué)

---

## 🚀 Avantages de l'Architecture Finale

### **Maintenabilité** 🔧
- Séparation claire des responsabilités
- Calculs purs faciles à tester
- Logique métier centralisée

### **Extensibilité** 📈
- Nouveaux calculs ajoutés uniquement dans CombatEngine
- Nouvelle IA ajoutée dans EntityAI sans affecter les calculs
- Orchestration étendue dans CombatService

### **Performance** ⚡
- Pas de duplication de calculs
- Méthodes statiques optimisées
- État minimal dans les stores

### **Testabilité** 🧪
- CombatEngine = fonctions pures → tests unitaires simples
- EntityAI = logique déterministe → tests de décision
- CombatService = orchestration → tests d'intégration

---

## 📚 Prochaines Évolutions Possibles

### **Court Terme**
1. **Unifier logique de cibles** : EntityAI et CombatEngine ont encore des redondances
2. **Système de sorts modulaire** : Remplacer le switch géant par un système pluggable
3. **Implémenter TODOs** : `consumeSpellSlot()` et autres

### **Moyen Terme**
1. **Cache de calculs** : Optimiser les calculs répétitifs
2. **Système d'événements** : Découpler encore plus les composants
3. **Tests automatisés** : Couvrir tous les calculs purs

### **Long Terme**
1. **IA avancée** : Machine learning pour les décisions
2. **Multithreading** : Calculs complexes en arrière-plan
3. **Modularité complète** : Plugins pour nouveaux types de combat

---

## ✅ État Actuel

🎉 **Phase 3 - Amélioration** : **TERMINÉE**

- ✅ Séparation CombatService/CombatEngine claire
- ✅ Commentaires legacy supprimés
- ✅ Imports inutilisés nettoyés
- ✅ Architecture documentée

**Prochaine étape recommandée :** Unification de la logique de recherche de cibles entre EntityAI et CombatEngine pour éliminer les dernières redondances.