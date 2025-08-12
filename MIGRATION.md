# Plan de Migration - Refactorisation React RPG

## Vue d'ensemble
Migration complète de l'architecture hooks vers Zustand avec modernisation des composants React et optimisation des performances.

## Phase 1: Infrastructure et Fondations
### 1.1 Installation et configuration
- [x] Installation de Zustand et devtools
- [x] Configuration des outils de développement
- [x] Setup de l'architecture des dossiers

### 1.2 Architecture des stores Zustand
- [x] `gameStore.js` - État global du jeu (scènes, logs, phase)
- [x] `characterStore.js` - Gestion des personnages (stats, inventaire, sorts)
- [x] `combatStore.js` - État du combat (ennemis, positions, tours)
- [x] `uiStore.js` - État de l'interface (modals, notifications, préférences)

### 1.3 Services et utilitaires
- [x] Migration des utilitaires vers `/src/utils/`
- [x] Création de la couche service pour la logique métier
- [x] Séparation des calculs purs des effets de bord

## Phase 2: Stores Zustand
### 2.1 gameStore
- [x] Navigation entre scènes
- [x] Gestion des logs de combat
- [x] État global du jeu (phase, progression)
- [x] Gestion des skill checks et événements

### 2.2 characterStore
- [x] Données des personnages (stats, niveau, XP)
- [x] Gestion de l'inventaire et équipement
- [x] Système de sorts et emplacements
- [x] Actions de personnage (levelUp, equipItem, etc.)

### 2.3 combatStore
- [x] État du combat (phase, tour actuel)
- [x] Gestion des ennemis et positions
- [x] Actions de combat et ciblage
- [x] Système de mouvement tactique

### 2.4 uiStore
- [x] État des modals et overlays
- [x] Préférences utilisateur
- [x] Notifications et messages
- [x] Persistance des paramètres UI

## Phase 3: Migration des Composants
### 3.1 Composants UI de base
- [x] `Card`, `Button`, `Modal` modernisés
- [x] `HealthBar`, `Notification`, `Loading` optimisés
- [x] `CollapsibleSection`, `CombatLog` refactorisés
- [x] Système d'icônes et utilitaires UI

### 3.2 Feature Character
- [x] `CharacterSheet` avec variants (compact, interactive)
- [x] `CharacterSelection` et `CharacterSelectionCard`
- [x] `AbilityScores`, `SkillsList`, `XPBar`
- [x] `StatBlock` avec support des comparaisons

### 3.3 Feature Combat
- [x] `CombatPanel` principale avec Zustand
- [x] `CombatGrid` et système de positions
- [x] `CombatActionPanel` pour les actions joueur
- [x] `CombatTurnManager` pour l'automatisation IA
- [x] `CombatLog` pour le journal de combat

### 3.4 Features Inventory, Spells, Rest
- [x] **Inventory**: `InventoryPanel`, `InventoryGrid`, `InventoryItem`, `ItemDetailModal`
- [x] **Spells**: `SpellPanel`, `SpellList`, `SpellSlotTracker`, `SpellDetailModal`
- [x] **Rest**: `RestPanel`, `ShortRestManager`, `LongRestManager`, `RestTypeSelector`

## Phase 4: Migration App.jsx et Finalisation
### 4.1 App.jsx moderne
- [ ] Migration vers Zustand
- [ ] Simplification de la logique de routage
- [ ] Intégration des nouveaux composants
- [ ] Gestion d'erreur globale

### 4.2 Optimisations finales
- [ ] Tests de performance
- [ ] Optimisation des re-renders
- [ ] Bundle size analysis
- [ ] Lazy loading des composants

### 4.3 CSS et styles
- [ ] Organisation modulaire par feature
- [ ] Suppression des duplications CSS
- [ ] Variables CSS centralisées
- [ ] Responsive design amélioré

## Services Créés
- [x] `CharacterService` - Logique métier des personnages
- [x] `CombatService` - Moteur de combat et calculs
- [x] `SpellService` - Gestion des sorts et emplacements
- [x] `RestService` - Mécaniques de repos et récupération

## Fonctionnalités Préservées
✅ **Combat tactique** avec grille et positionnement
✅ **Système de sorts** complet avec emplacements
✅ **Gestion d'inventaire** avec équipement
✅ **Progression de personnage** (XP, niveau, compétences)
✅ **Système de repos** (court/long)
✅ **Navigation de scènes** et événements
✅ **Logs de combat** détaillés
✅ **Sauvegarde d'état** persistante

## Améliorations Apportées
🚀 **Performance** - Memoization et optimisations React
🎨 **UX/UI** - Interface modernisée et responsive
🏗️ **Architecture** - Separation of concerns claire
🔧 **Maintenabilité** - Code modulaire et testable
📱 **Accessibilité** - Support clavier et screen readers
⚡ **Developer Experience** - DevTools Zustand intégrés

## État Actuel
- **Phases 1-3**: ✅ **COMPLÉTÉES**
- **Phase 4**: 🔄 **EN COURS**
- **Prochaine étape**: Migration finale d'App.jsx