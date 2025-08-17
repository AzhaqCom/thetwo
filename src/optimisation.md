
  🔥 OPTIMISATIONS PRIORITAIRES

  1. Lazy Loading & Code Splitting

  // Au lieu de tout importer d'un coup
  const CombatPanel = lazy(() => import('./features/combat/CombatPanel'));
  const SpellPanel = lazy(() => import('./features/spells/SpellPanel'));
  Impact : Réduction drastique du bundle initial, chargement plus rapide

  2. Éliminer le code mort

  - Beaucoup de TODOs dans votre code qui ne sont jamais implémentés
  - Variables déclarées mais non utilisées
  - Imports d'anciennes fonctions supprimées
  Impact : -500 à -800 lignes facilement

  3. Consolidation des stores Zustand

  // Au lieu de 4 stores séparés, potentiellement 2-3 stores mieux organisés
  const useGameState = create() // UI + Game + Flags
  const useCombatState = create() // Combat seul
  const useCharacterState = create() // Character seul

  🏗️ REFACTORING STRUCTUREL

  4. Extraction de composants depuis les gros fichiers

  - combatEngine.js (851 lignes) → Diviser en modules spécialisés
  - characterStore.js (740 lignes) → Séparer gestion personnage/compagnons
  - SpellService.js (671 lignes) → Extraire logique spécifique

  5. Système de cache intelligent

  // Pour éviter les recalculs coûteux
  const memoizedEnemyStats = useMemo(() => calculateStats(enemy), [enemy.level]);

  6. Migration vers des services plus fins

  // Au lieu d'un gros CombatService, plusieurs petits
  class CombatActions, CombatCalculations, CombatAnimations

  📊 DONNÉES & PERFORMANCE

  7. Optimisation des données de scènes

  - Vos scènes sont chargées en entier au démarrage
  - Système de lazy loading par chapitre
  - Compression/minification des textes

  8. Normalisation des données

  // Structure plus efficace pour items/sorts/ennemis
  const normalized = {
    items: { byId: {}, allIds: [] },
    spells: { byId: {}, allIds: [] }
  }

  🎯 GAINS ESTIMÉS

  | Optimisation        | Lignes sauvées | Perf gain |
  |---------------------|----------------|-----------|
  | Code mort           | -600 lignes    | ⭐⭐⭐       |
  | Lazy loading        | 0 lignes       | ⭐⭐⭐⭐⭐     |
  | Services fins       | -300 lignes    | ⭐⭐⭐       |
  | Store consolidation | -150 lignes    | ⭐⭐        |
  | Composants extraits | -400 lignes    | ⭐⭐⭐       |

  💡 RECOMMANDATION

  Je suggère de commencer par :
  1. Lazy loading (impact immédiat sur l'UX)
  2. Nettoyage du code mort (gain rapide en lignes)
  3. Division de combatEngine.js (votre plus gros fichier)
