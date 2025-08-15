# Guide d'Utilisation - Application RPG React

## Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture du projet](#architecture-du-projet)
3. [Fichiers de configuration](#fichiers-de-configuration)
4. [Composants principaux](#composants-principaux)
5. [Gestion d'état (Stores)](#gestion-détat-stores)
6. [Services (Logique métier)](#services-logique-métier)
7. [Utilitaires](#utilitaires)
8. [Données statiques](#données-statiques)
9. [Composants d'interface](#composants-dinterface)
10. [Relations entre fichiers](#relations-entre-fichiers)
11. [Fonctions obsolètes](#fonctions-obsolètes)
12. [Suggestions d'amélioration](#suggestions-damélioration)

---

## Vue d'ensemble

Cette application est un jeu de rôle (RPG) développé en React avec JavaScript, simulant un système D&D simplifié. Elle inclut :
- Combat tactique sur grille 8x6
- Gestion de personnages avec montée de niveau
- Système d'inventaire et d'équipement
- Gestion de sorts et slots de sorts
- Système narratif avec scènes interactives
- Support multi-compagnons (jusqu'à 3)
- IA pour ennemis et compagnons

**Technologies** : React 19.1.0, Zustand 5.0.7, Vite 7.0.4, React Icons 5.5.0

---

## Architecture du projet

```
src/
├── components/          # Composants React
│   ├── features/       # Composants métier par fonctionnalité
│   ├── game/          # Composants de jeu (scènes)
│   ├── hooks/         # Hooks personnalisés
│   ├── ui/            # Composants UI réutilisables
│   └── utils/         # Utilitaires composants
├── data/              # Données statiques du jeu
├── services/          # Logique métier (services)
├── stores/            # État global Zustand
├── styles/            # Feuilles de style CSS
├── types/             # Définitions de types
└── utils/             # Fonctions utilitaires
```

---

## Fichiers de configuration

### `package.json`
**Type** : Configuration npm
**Utilisation** : Définit les dépendances et scripts de build
**Dépendances principales** :
- React 19.1.0 + React DOM
- Zustand 5.0.7 (état global)
- React Icons 5.5.0 (icônes)
- React Error Boundary 6.0.0 (gestion erreurs)

### `vite.config.js`
**Fonctions exportées** : Configuration Vite par défaut
**Utilisation** : Configuration du bundler avec support React
**Relations** : Point d'entrée pour le build et dev server

### `src/main.jsx`
**Fonctions exportées** : Aucune (point d'entrée)
**Utilisation** : Bootstrap de l'application React
**Relations** : Importe et lance App.jsx

---

## Composants principaux

### `src/App.jsx`
**Composants exportés** :
- `App()` - Composant principal de l'application
- `ErrorFallback()` - Composant de gestion d'erreur

**Fonctions internes** :
- `handleCharacterSelect(character)` - Sélection du personnage principal
- `handleCombatVictory()` - Gestion de la victoire en combat
- `handleItemGain(item, quantity)` - Ajout d'objets à l'inventaire
- `handleShortRest()` / `handleLongRest()` - Gestion des repos
- `handleCastSpellOutOfCombat(spell, target)` - Lancement de sorts hors combat
- `handleNewChoice(choice)` - Gestion des choix dans le nouveau système narratif
- `handleHotspotClick(hotspot)` - Gestion des hotspots dans les scènes interactives
- `handlePurchase(item, quantity)` / `handleSell(item, quantity)` - Commerce
- `renderNewSceneFormat(scene)` - Rendu des scènes au nouveau format
- `renderLegacyScene(scene)` - Rendu des scènes à l'ancien format
- `renderCurrentScene()` - Orchestration de l'affichage des scènes

**Utilisation** : Point central de l'application, orchestre tous les composants
**Relations** :
- Utilise tous les stores Zustand
- Importe tous les composants features et UI
- Utilise StoryService et sceneUtils
- Gère le routage des scènes et l'état global

---

## Gestion d'état (Stores)

### `src/stores/index.js`
**Fonctions exportées** :
- `useGameStore`, `useCharacterStore`, `useCombatStore`, `useUIStore` - Réexports des stores
- `combinedSelectors` - Sélecteurs combinés pour optimisation
- `initializeStores()` - Initialisation de tous les stores
- `resetAllStores()` - Reset complet de l'état
- `getStoreStates()` / `logStoreStates()` - Fonctions de debug

**Utilisation** : Point d'entrée unique pour tous les stores
**Relations** : Centralise l'accès aux stores Zustand

### `src/stores/gameStore.js`
**Store exporté** : `useGameStore`
**Sélecteurs** : `gameSelectors` - Sélecteurs optimisés

**Actions principales** :
- `setGamePhase(phase)` - Gestion des phases de jeu
- `setCurrentScene(sceneId)` / `addToSceneHistory(sceneId)` - Navigation
- `addMessage(message, type)` / `clearMessages()` - Messages de combat/jeu
- `performShortRest()` / `performLongRest()` - Gestion des repos
- `performSkillCheck(character, skill, dc, rollModifier)` - Tests de compétences
- `setGameFlag(flag, value)` / `incrementGameFlag(flag)` - Système de flags narratifs
- `rollD20WithModifier(modifier)` - Lancé de dés
- `castSpell(character, spell, targetId)` - Lancement de sorts
- `applyConsequences(consequences)` - Application d'effets d'actions

**Relations** : 
- Utilise utils/calculations pour les calculs de dés
- Utilise data/spells pour la validation des sorts
- Utilise services/gameLogic pour les traitements complexes
- Utilise data/gameFlags pour les flags narratifs

### `src/stores/characterStore.js`
**Store exporté** : `useCharacterStore`
**Sélecteurs** : `characterSelectors` - Sélecteurs optimisés

**Actions principales** :
- `setPlayerCharacter(character)` - Définir le personnage principal
- `addCompanion(companion)` / `removeCompanion(companionId)` - Gestion compagnons (max 3)
- `takeDamage(characterId, damage)` / `heal(characterId, amount)` - PV
- `shortRest(characterId)` / `longRest(characterId)` - Repos avec dés de vie
- `addExperience(characterId, xp)` / `processLevelUps()` - XP et montée de niveau
- `castSpell(casterId, spell, targetId)` - Système de sorts complet
- `prepareSpell(characterId, spellId)` / `unprepareSpell(characterId, spellId)` - Préparation
- `addItem(item, quantity)` / `removeItem(itemId, quantity)` - Inventaire
- `equipItem(characterId, item)` / `unequipItem(characterId, slot)` - Équipement

**Relations** :
- Utilise services/characterManager pour les calculs D&D
- Utilise services/spellSystem pour la gestion des sorts
- Utilise data/items et data/weapons pour les objets

### `src/stores/combatStore.js`
**Store exporté** : `useCombatStore`
**Sélecteurs** : `combatSelectors` - Sélecteurs optimisés

**Actions principales** :
- `initializeCombat(playerCharacter, companions, enemies)` - Initialisation combat
- `rollInitiative()` - Ordre d'initiative
- `moveCharacter(characterId, newPosition)` - Mouvement sur grille
- `performAttack(attackerId, targetId)` - Attaques
- `nextTurn()` / `nextRound()` - Gestion tours et rounds
- `handleAITurn(character)` - IA des ennemis et compagnons
- `checkCombatEnd()` - Conditions de victoire/défaite
- `endCombat(victory)` - Fin de combat

**Relations** :
- Utilise services/combatEngine pour l'IA et les calculs
- Utilise utils/calculations pour les dégâts
- Utilise utils/validation pour la validation des mouvements
- Utilise data/enemies pour les ennemis

### `src/stores/uiStore.js`
**Store exporté** : `useUIStore`

**Actions principales** :
- `addNotification(notification)` / `removeNotification(id)` - Notifications
- `setLoading(isLoading)` - États de chargement
- `openModal(modalProps)` / `closeModal()` - Modales
- `setActivePanel(panel)` - Gestion panneaux actifs

**Utilisation** : Gestion de l'interface utilisateur et des états visuels
**Relations** : Utilisé par tous les composants UI

---

## Services (Logique métier)

### `src/services/characterManager.js`
**Type** : Service statique (fonctions pures)

**Fonctions exportées** :
- `getProficiencyBonus(level)` - Calcul bonus de maîtrise
- `getSpellSaveDC(character, spell)` / `getSpellcastingAbility(character)` - Sorts
- `getAttackBonus(character, weapon)` / `isWeaponProficient(character, weapon)` - Combat
- `levelUp(character)` - Montée de niveau avec PV et sorts
- `shortRest(character)` / `longRest(character)` - Repos avec récupération
- `takeDamage(character, damage)` / `heal(character, amount)` - Gestion PV
- `consumeSpellSlot(character, level)` - Consommation slots de sorts
- `addExperience(character, xp)` / `processLevelUps(character)` - Système XP
- `getXPForLevel(level)` / `getXPToNextLevel(character)` - Tables d'expérience

**Utilisation** : Implémentation des règles D&D standard
**Relations** : Utilisé par characterStore, utilise utils/calculations

### `src/services/gameLogic.js`
**Type** : Service statique

**Fonctions exportées** :
- `processSceneAction(action, gameState)` - Traitement des actions de scène
- `processCombatAction(action)` / `processRestAction(action)` - Actions spécifiques
- `performSkillCheck(character, skill, dc)` - Test de compétence complet
- `calculateCombatExperience(enemies)` / `processCombatRewards(victory)` - XP combat
- `isChoiceAvailable(choice, gameState)` - Évaluation des conditions de choix
- `generateId()` / `deepClone(obj)` - Utilitaires

**Utilisation** : Orchestration de la logique de jeu, traitement des scènes legacy
**Relations** : Utilise data/companions, services/characterManager

### `src/services/StoryService.js`
**Type** : Service statique pour le système narratif

**Fonctions exportées** :
- `evaluateCondition(condition, gameState)` - Évaluation sécurisée des conditions JavaScript
- `getSceneText(scene, gameState)` / `interpolateText(text, gameState)` - Texte avec variations
- `getAvailableChoices(scene, gameState)` / `getAvailableHotspots(scene, gameState)` - Filtrage
- `processShopAction(action, gameState)` / `handlePurchase(item, gameState)` / `handleSell(item, gameState)` - Commerce
- `applyConsequences(consequences, gameState)` - Application des effets d'actions
- `getDialogueData(scene, gameState)` - Données pour les dialogues avec PNJ
- `shouldShowScene(scene, gameState)` / `executeSceneEffects(scene, gameState)` - Gestion scènes
- `validateScene(scene)` / `getSceneDebugInfo(scene, gameState)` - Validation et debug
- `processAction(action, gameState)` / `processSkillCheck(skillCheck, gameState)` - Nouveau système

**Utilisation** : Moteur narratif complet pour le nouveau système de scènes
**Relations** : Utilise types/story pour la validation des schémas

### `src/services/combatEngine.js`
**Type** : Service statique pour le combat tactique

**Fonctions exportées** :
- `calculateDamage(attacker, target, weapon, isRanged)` - Calcul des dégâts avec dés
- `getTargetsInRange(character, range, enemies)` - Recherche de cibles à portée
- `calculateOptimalMovement(character, targets, allies, grid)` - IA de mouvement
- `findPotentialTargets(character, enemies, allies)` / `findBestTarget(character, targets)` - IA de ciblage
- `getIdealDistance(character, target)` - Distance optimale d'attaque
- `calculateAoESquares(centerPosition, aoeType, range)` - Calcul zones d'effet
- `validateMovement(fromPosition, toPosition, obstacles)` - Validation déplacement

**Utilisation** : IA de combat, calculs tactiques, moteur de combat pur
**Relations** : Utilise utils/calculations, utils/validation, utils/constants

### `src/services/RestService.js`
**Fonctions exportées** :
- `processShortRest(character)` - Repos court avec dés de vie
- `processLongRest(character)` - Repos long avec récupération complète
- `canTakeShortRest(character)` / `canTakeLongRest(character)` - Validation repos

**Utilisation** : Gestion spécialisée des repos
**Relations** : Utilisé par les stores, utilise characterManager

### `src/services/SpellService.js`
**Fonctions exportées** :
- `canCastSpell(character, spell)` - Vérification possibilité lancement
- `getSpellDescription(spell, character)` - Description avec variables
- `calculateSpellEffects(spell, caster, target)` - Calcul des effets
- `getSpellsByLevel(character, level)` - Filtrage par niveau

**Utilisation** : Gestion avancée du système de sorts
**Relations** : Utilise data/spells, characterManager

### `src/services/companionAI.js`
**Fonctions exportées** :
- `calculateCompanionAction(companion, allies, enemies, gameState)` - IA des compagnons
- `evaluateTarget(companion, target, gameState)` - Évaluation de cible
- `shouldUseSpell(companion, spell, target)` - Décision utilisation sorts

**Utilisation** : IA spécialisée pour les compagnons
**Relations** : Utilise combatEngine, characterManager

### `src/services/spellSystem.js`
**Fonctions exportées** :
- `initializeSpellSlots(character)` - Initialisation slots par classe/niveau
- `canPrepareSpell(character, spell)` - Vérification préparation
- `getMaxPreparedSpells(character)` - Limite de sorts préparés
- `recoverSpellSlots(character, restType)` - Récupération après repos

**Utilisation** : Système complet de gestion des sorts D&D
**Relations** : Utilise data/spells, characterManager

---

## Utilitaires

### `src/utils/constants.js`
**Constantes exportées** :
- `GRID_WIDTH = 8`, `GRID_HEIGHT = 6` - Dimensions grille de combat
- `COMBAT_PHASES`, `GAME_PHASES` - Énumérations des phases
- `ENTITY_TYPES`, `ACTION_TYPES`, `DAMAGE_TYPES`, `REST_TYPES` - Types d'entités et actions

**Utilisation** : Constantes partagées dans toute l'application

### `src/utils/calculations.js`
**Fonctions exportées** :
- `getModifier(abilityScore)` - Calcul modificateur D&D (+1 tous les 2 points au-dessus de 10)
- `rollDie(sides)` / `rollD20()` / `rollD20WithModifier(modifier)` - Lancés de dés
- `rollDice(notation)` - Analyse notation dés ("2d6+3")
- `calculateDistance(pos1, pos2)` - Distance Manhattan sur grille
- `doesAttackHit(attackRoll, targetAC)` - Test de toucher

**Utilisation** : Cœur mathématique du système D&D, utilisé partout
**Relations** : Utilisé par tous les services et stores

### `src/utils/validation.js`
**Fonctions exportées** :
- `isValidPosition(position, gridWidth, gridHeight)` - Validation position grille
- `isPathClear(from, to, obstacles)` - Vérification chemin libre
- `isInRange(attacker, target, range)` - Test de portée
- `validateCharacterData(character)` - Validation données personnage

**Utilisation** : Validation des données et règles de jeu
**Relations** : Utilisé par combatStore et combatEngine

### `src/utils/inventoryUtils.js`
**Fonctions exportées** :
- `groupItemsByType(items)` - Groupement par type d'objet
- `sortItemsByName(items)` / `sortItemsByValue(items)` - Tri de l'inventaire
- `canStackItem(item)` - Test si un objet peut être empilé
- `calculateTotalWeight(items)` - Calcul poids total

**Utilisation** : Utilitaires pour la gestion de l'inventaire
**Relations** : Utilisé par InventoryPanel et characterStore

### `src/components/utils/sceneUtils.js`
**Fonctions exportées** :
- `processSceneAction(action, handlers)` - Traitement actions avec handlers spécifiques
- `processChoice(choice, gameState)` - Nouveau système de choix asynchrone
- `getGameStateForStory()` - Extraction état pour StoryService
- `isNewSceneFormat(scene)` / `adaptLegacyScene(scene)` - Gestion compatibilité formats

**Utilisation** : Pont entre l'ancien et le nouveau système de scènes
**Relations** : Utilise les stores, StoryService, data/companions, types/story

---

## Données statiques

### `src/data/index.js`
**Exports** : Réexporte toutes les données du jeu
- `character`, `characterTemplates`, `classConfigurations`
- `companions`, `enemies`, `items`, `levels`, `scenes`, `spells`, `weapons`
- `getAllData()` - Retourne toutes les données
- `validateData()` - Validation basique des structures

### `src/data/character.js`
**Export** : Objet `character` avec stats de base du personnage

### `src/data/characterTemplates.js`
**Export** : Templates de personnages prédéfinis (guerrier, mage, etc.)

### `src/data/classConfigurations.js`
**Export** : Configuration des classes (PV par niveau, sorts, compétences)

### `src/data/companions.js`
**Export** : Définition des compagnons disponibles avec IA

### `src/data/enemies.js`
**Export** : Bestiaire des ennemis avec stats de combat

### `src/data/items.js`
**Export** : Base de données des objets (armures, consommables, etc.)

### `src/data/weapons.js`
**Export** : Arsenal des armes avec dégâts et propriétés

### `src/data/spells.js`
**Export** : Grimoire complet avec effets et descriptions

### `src/data/scenes.js`
**Export** : Scènes narratives (ancien format)

### `src/data/scenes_examples.js`
**Export** : Exemples de scènes au nouveau format

### `src/data/levels.js`
**Export** : Tables de progression par niveau

### `src/data/gameFlags.js`
**Export** : Définition des flags narratifs et leurs effets

---

## Types et interfaces

### `src/types/story.js`
**Constantes exportées** :
- `SCENE_TYPES` - Types de scènes (interactive, dialogue, merchant)
- `ACTION_TYPES` - Types d'actions (choice, skill_check, purchase, etc.)

**Schémas exportés** :
- `BaseSceneSchema` - Structure de base des scènes
- `InteractiveSceneSchema` - Scènes avec hotspots cliquables
- `DialogueSceneSchema` - Dialogues avec PNJ
- `MerchantSceneSchema` - Scènes de commerce
- `GameFlagsSchema` - Validation des flags narratifs

**Validateurs** :
- `ConditionTypes` - Types de conditions pour les choix
- `SceneValidators.validateScene(scene)` - Validation complète d'une scène
- `SceneValidators.isValidSceneType(type)` - Validation type de scène

**Utilisation** : Définition de la structure du nouveau système narratif
**Relations** : Utilisé par StoryService pour la validation

---

## Composants d'interface

### `src/components/ui/index.js`
**Composants exportés** :
- `Card`, `Button`, `ActionButton` - Composants de base
- `Modal`, `NotificationContainer` - Système de notifications
- `HealthBar`, `CollapsibleSection` - Composants spécialisés
- `CombatLog`, `Loading` - Affichage d'état
- Plus variants et constantes (`UI_SIZES`, `UI_VARIANTS`, etc.)

### `src/components/features/index.js`
**Exports** : Réexporte tous les composants métier
- character/, combat/, inventory/, spells/, rest/

### `src/components/game/`
**Composants de scènes** :
- `Scene.jsx` - Composant de scène générique
- `InteractiveScene.jsx` - Scènes interactives avec hotspots
- `DialogueScene.jsx` - Dialogues avec PNJ
- `MerchantScene.jsx` - Interface de commerce
- `ShopInterface.jsx` - Interface d'achat/vente

### `src/components/hooks/useTypedText.js`
**Hook exporté** : `useTypedText(text, speed)` - Animation de texte tapé
**Utilisation** : Effet de machine à écrire pour les dialogues

---

## Relations entre fichiers

### Flux de données principal :
```
App.jsx (orchestration)
   ↓
Stores (état global)
   ↓
Services (logique métier)
   ↓
Utils + Data (calculs + données)
```

### Dépendances critiques :

**App.jsx** →
- Tous les stores (gameStore, characterStore, combatStore, uiStore)
- Tous les composants features et UI
- sceneUtils, StoryService

**gameStore** →
- utils/calculations (dés)
- data/spells (validation)
- services/gameLogic (actions)
- data/gameFlags (flags narratifs)

**characterStore** →
- services/characterManager (règles D&D)
- services/spellSystem (sorts)
- data/items, data/weapons (objets)

**combatStore** →
- services/combatEngine (IA)
- utils/calculations (dégâts)
- utils/validation (mouvements)
- data/enemies (adversaires)

**StoryService** →
- types/story (validation)
- Aucune autre dépendance (service pur)

**sceneUtils** →
- Tous les stores (pont)
- StoryService (nouveau système)
- data/companions (gestion compagnons)

### Architecture en couches :
1. **Interface** : App.jsx + Composants
2. **État** : Stores Zustand
3. **Logique** : Services purs
4. **Utilitaires** : Utils + Data

---

## Fonctions obsolètes

### Probablement obsolètes :

**characterStore** :
- `selectedCharacter` → Alias de `playerCharacter` pour compatibilité, peut être supprimé

**combatStore** :
- `companionCharacter` → Remplacé par le système multi-compagnons `companions[]`

**gameStore** :
- `getKnownSpells()` / `getSpellSlotsForLevel()` → Logique déplacée vers CharacterManager

**App.jsx** :
- `renderLegacyScene()` → Ancien système, remplacé progressivement par `renderNewSceneFormat()`

### Utilitaires peu utilisés :

**stores/index.js** :
- `logStoreStates()` → Fonction de debug, utilisée uniquement en développement

**data/index.js** :
- `validateData()` → Validation basique non utilisée, remplacée par types/story

**gameLogic.js** :
- `processCombatRewards()` → Remplacé par la logique directe dans les stores

### Composants surdimensionnés :

**components/ui/** :
- Beaucoup de variants et options non utilisées dans les composants UI
- `UI_SIZES`, `UI_VARIANTS` → Nombreuses constantes non exploitées

**types/story.js** :
- Certains schémas très détaillés pour des fonctionnalités futures non implémentées

---

## Suggestions d'amélioration

### 1. Nettoyage du code

**Actions prioritaires** :
- Supprimer les fonctions obsolètes identifiées
- Simplifier les composants UI en retirant les variants inutilisés
- Fusionner `renderLegacyScene()` et `renderNewSceneFormat()` en une seule fonction

**Refactoring suggéré** :
- Déplacer certaines fonctions des stores vers les services (séparation logique/état)
- Standardiser sur le nouveau format de scènes uniquement
- Simplifier les schémas dans types/story.js

### 2. Améliorations techniques

**TypeScript** :
- Migrer vers TypeScript pour une meilleure documentation du code
- Les types définis dans types/story.js montrent que le projet est prêt

**Performance** :
- Ajouter React.memo() sur les composants lourds
- Optimiser les sélecteurs Zustand (déjà bien implémentés)
- Lazy loading des composants de scènes

**Tests** :
- Ajouter des tests unitaires pour les services (fonctions pures)
- Tests d'intégration pour les stores
- Tests de snapshot pour les composants UI

### 3. Fonctionnalités manquantes

**Système de sauvegarde** :
- Persistance de l'état dans localStorage/sessionStorage
- Export/import de parties

**Accessibilité** :
- Support clavier complet
- ARIA labels pour les composants complexes
- Mode contraste élevé

**Internationalisation** :
- Système i18n pour multi-langues
- Séparation des textes du code

### 4. Architecture avancée

**Gestion d'erreurs** :
- Error boundaries plus granulaires
- Logging centralisé des erreurs
- Retry automatique pour les actions critiques

**Optimisations réseau** :
- Cache des données statiques
- Compression des assets
- Service Worker pour mode hors-ligne

**Monitoring** :
- Analytics des actions de jeu
- Métriques de performance
- Feedback utilisateur intégré

### 5. Système de contenu

**Éditeur de scènes** :
- Interface de création de scènes
- Validation en temps réel
- Prévisualisation

**Système de mods** :
- API pour extensions
- Chargement dynamique de contenu
- Partage communautaire

### 6. Améliorations gameplay

**IA avancée** :
- Stratégies de combat plus sophistiquées
- Personnalité des compagnons
- Adaptation au style de jeu

**Système de craft** :
- Création d'objets/armes
- Ressources et recettes
- Amélioration d'équipement

**Multiclassage** :
- Support des classes multiples
- Progression équilibrée
- Synergies entre classes

---

## Schéma des relations

```
┌─────────────┐
│   App.jsx   │ ← Point d'entrée, orchestration
└─────┬───────┘
      │
┌─────▼───────┐
│   Stores    │ ← État global (Zustand)
│ ┌─────────┐ │
│ │ game    │ │ ← Phases, scènes, messages
│ │character│ │ ← Personnages, XP, inventaire
│ │ combat  │ │ ← Combat tactique, IA
│ │   ui    │ │ ← Interface, notifications
│ └─────────┘ │
└─────┬───────┘
      │
┌─────▼───────┐
│  Services   │ ← Logique métier pure
│ ┌─────────┐ │
│ │charMgr  │ │ ← Règles D&D, calculs
│ │gameLogic│ │ ← Actions, scènes legacy
│ │StoryServ│ │ ← Nouveau système narratif
│ │combatEng│ │ ← IA combat, tactique
│ └─────────┘ │
└─────┬───────┘
      │
┌─────▼───────┐
│Utils + Data │ ← Fonctions + Données
│ ┌─────────┐ │
│ │ calcs   │ │ ← Dés, modificateurs D&D
│ │validatn │ │ ← Validation règles
│ │ items   │ │ ← Base données objets
│ │ spells  │ │ ← Grimoire complet
│ └─────────┘ │
└─────────────┘
```

**Flux typique d'une action** :
1. Utilisateur clique → Composant UI
2. Composant → Store action
3. Store → Service pour logique
4. Service → Utils pour calculs
5. Service → Data pour validation
6. Résultat remonte vers Store
7. Store met à jour état
8. Composants se re-rendent

Cette architecture garantit une séparation claire des responsabilités et une maintenabilité optimale.