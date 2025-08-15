# 🎯 Test de la Séquence Complète

## 🚀 **Objectif du test**
Vérifier que TOUS les systèmes fonctionnent ensemble :
- ✅ Nouveau système de scènes avec dialogues
- ✅ Recrutement de compagnons (ancien système)
- ✅ Combat (ancien système) 
- ✅ Repos (ancien système)
- ✅ Variables et flags persistants

## 📋 **Étapes à suivre exactement**

### **1. Démarrage**
1. Aller sur `http://localhost:5174/`
2. Choisir **n'importe quel personnage**
3. Tu commences sur **"Recrutement de Tyrion"**

### **2. Scène 1 - Tyrion (DIALOGUE)**
- **Type** : Nouvelle scène dialogue
- **Vérifier** : Le nom du joueur apparaît dans le texte
- **Action** : Cliquer sur **"Accepter de faire équipe avec Tyrion"**
- **Résultat attendu** : 
  - Message "Tyrion te rejoint dans ton aventure !"
  - Tyrion apparaît dans la sidebar de droite

### **3. Scène 2 - Rhingann (DIALOGUE)**
- **Type** : Nouvelle scène dialogue
- **Vérifier** : Texte change si Tyrion est présent
- **Action** : Cliquer sur **"Accepter que Rhingann se joigne à l'équipe"**
- **Résultat attendu** :
  - Message "Rhingann te rejoint dans ton aventure !"
  - Rhingann apparaît aussi dans la sidebar

### **4. Scène 3 - Combat (ANCIEN SYSTÈME)**
- **Type** : Transition vers ancien combat
- **Vérifier** : Texte mentionne que les compagnons sont là
- **Action** : Cliquer sur **"Engager le combat !"**
- **Résultat attendu** :
  - Interface de combat s'ouvre automatiquement
  - 3 gobelins présents sur la grille
  - Tes compagnons participent au combat

### **5. Après combat (AUTO)**
- **Résultat attendu** : Retour automatique vers scène de repos

### **6. Scène 4 - Repos (ANCIEN SYSTÈME)**
- **Type** : Nouvelle scène avec choix de repos
- **Vérifier** : Texte mentionne les compagnons si présents
- **Action** : Cliquer sur **"Faire un repos long"**
- **Résultat attendu** :
  - Interface de repos s'ouvre
  - PV se restaurent complètement
  - Sorts récupérés

### **7. Scène finale (RÉSUMÉ)**
- **Type** : Nouvelle scène avec résumé dynamique
- **Vérifier** : Le résumé mentionne les 2 compagnons recrutés
- **Action** : Cliquer sur **"Consulter l'état de l'équipe"**
- **Résultat attendu** : Liste des compagnons avec emojis

## 🔍 **Points critiques à vérifier**

### **Intégration nouveau/ancien**
- [ ] Dialogue → Combat fonctionne
- [ ] Combat → Repos fonctionne  
- [ ] Repos → Nouvelle scène fonctionne

### **Compagnons**
- [ ] Tyrion apparaît dans la sidebar après recrutement
- [ ] Rhingann apparaît aussi
- [ ] Ils participent au combat
- [ ] Le compteur de compagnons est correct

### **Variables dynamiques**
- [ ] `{playerName}` fonctionne
- [ ] Texte change selon les compagnons présents
- [ ] Conditions d'affichage fonctionnent

### **Persistance**
- [ ] Les flags se sauvegardent entre scènes
- [ ] La réputation évolue
- [ ] L'historique des choix majeurs

## 🐛 **Erreurs possibles**

1. **Compagnons n'apparaissent pas** → Vérifier sceneUtils.js
2. **Combat ne se lance pas** → Vérifier processSceneAction
3. **Repos ne fonctionne pas** → Vérifier les handlers
4. **Variables vides** → Vérifier StoryService.interpolateText

## ✅ **Succès si...**

- Tu recrutes 2 compagnons qui apparaissent
- Le combat se lance automatiquement avec eux
- Le repos restaure tes PV
- Le résumé final affiche tout correctement
- Aucune erreur dans la console

Cette séquence teste **L'ENSEMBLE** du système ! 🎉