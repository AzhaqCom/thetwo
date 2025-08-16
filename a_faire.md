# 📝 À Faire - Code Legacy et Améliorations

**Date de création :** 16 Août 2025  
**Objectif :** Tracker le code legacy, duplications et améliorations identifiées

---

## 🔍 Code Legacy Identifié

### **CombatService - Méthodes à déplacer vers CombatEngine**
- `rollD20()` - Calcul pur → CombatEngine
- `rollDamage()` - Calcul pur → CombatEngine  
- `getAttackBonus()` - Calcul pur → CombatEngine
- `getSpellAttackBonus()` - Calcul pur → CombatEngine
- `getSaveBonus()` - Calcul pur → CombatEngine
- `isDefeated()` - Règle pure → CombatEngine

### **CombatEngine - Logique d'orchestration à déplacer vers CombatService**
- `findBestTarget()` - Logique de choix tactique → CombatService
- Certaines parties de `getTargetsInRange()` liées à l'état de combat

---

## 🔄 Duplications Détectées

### **Logique de recherche de cibles TRIPLE**
- `EntityAI.findTargets()` - Trouve ennemis/alliés selon le type
- `EntityAI.findPlayerTargets()` - Trouve joueur + compagnons  
- `EntityAI.findEnemyTargets()` - Trouve ennemis
- `CombatEngine.findBestTarget()` - Logique similaire avec priorités
- `CombatEngine.getTargetsInRange()` - Trouve cibles dans un rayon

### **Calculs de distance et mouvement dupliqués**
- `EntityAI.findClosestTarget()` utilise `calculateDistance()`
- `EntityAI.calculateOptimalMovement()` délègue à `CombatEngine`
- `EntityAI.getTargetsInRange()` délègue à `CombatEngine`
- Duplication dans la logique de proximité

### **Gestion des sorts en triple**
- `EntityAI.canCastSpell()` - Vérifie slots disponibles
- `EntityAI.getAvailableSpells()` - Liste sorts disponibles 
- `CombatService.executeCompanionSpell()` - Switch géant de sorts
- `CombatService.consumeSpellSlot()` - TODO non implémenté

### **Calculs de dégâts dupliqués**
- `CombatService.rollDamage()` délègue maintenant à `CombatEngine`
- `CombatEngine.rollDamage()` - Logique principale
- `CombatEngine.calculateDamage()` - Logique étendue pour attaques complexes

### **Méthodes utilitaires de dés**
- `CombatService` délègue maintenant vers `CombatEngine`
- `CombatEngine.rollD6/D8/D10()` - Méthodes centralisées

---

## 🏗️ Améliorations Architecturales Nécessaires

### **Séparation CombatService/CombatEngine**
- [x] Déplacer les calculs purs vers CombatEngine (FAIT)
- [x] CombatService délègue maintenant vers CombatEngine (FAIT)
- [x] Interface claire entre les deux (FAIT)

### **Unification de la logique de cibles**
- [ ] **URGENT** : Unifier `EntityAI.findTargets` et `CombatEngine.findBestTarget`
- [ ] Supprimer redondances dans recherche de cibles
- [ ] EntityAI devrait utiliser les méthodes CombatEngine

### **Centralisation gestion des sorts**
- [ ] Implémenter `CombatService.consumeSpellSlot()` (TODO actuel)
- [ ] Unifier `EntityAI.canCastSpell` avec la logique CombatService
- [ ] Refactoriser le switch géant dans `executeCompanionSpell`

---

## ⚠️ Code Non Scalable

### **Gestion des sorts hardcodée**
- `executeCompanionSpell()` avec switch/case géant
- Chaque sort a sa logique propre → Créer un système de sorts modulaire

### **Messages de combat dispersés**
- Messages hardcodés dans les actions
- → Créer un système de messages centralisé

---

## 📋 Prochaines Actions

1. **Phase en cours** : Réorganiser CombatService/CombatEngine selon responsabilités claires
2. **Phase suivante** : Créer utilitaires centralisés pour dés et calculs
3. **Phase future** : Refactoriser système de sorts pour plus de modularité