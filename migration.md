Basé sur mon analyse du code, voici ce qui devrait être modernisé par
   ordre de priorité :

  🚀 Priorité 1 - Migration critique

  1. Système de scènes unifié

  - Problème : Coexistence de l'ancien système (renderLegacyScene) et
  nouveau (renderNewSceneFormat)
  - Action : Migrer toutes les scènes vers le nouveau format défini
  dans types/story.js
  - Impact : Simplification majeure du code, suppression de la double
  logique

  2. Système multi-compagnons

  - Problème : companionCharacter coexiste avec playerCompanions[]
  - Action : Supprimer complètement companionCharacter, utiliser
  uniquement activeCompanions[]
  - Impact : Code plus cohérent, support natif de plusieurs compagnons

  🔧 Priorité 2 - Architecture technique

  3. Migration TypeScript

  - Justification : Les types sont déjà définis dans types/story.js, le
   projet est prêt
  - Bénéfices :
    - Documentation automatique du code
    - Détection d'erreurs à la compilation
    - Meilleure maintenabilité
  - Commencer par : Services (fonctions pures) puis stores

  4. Gestion d'état optimisée

  - Déplacer la logique métier des stores vers les services :
    - getKnownSpells() / getSpellSlotsForLevel() → CharacterManager
    - Calculs de combat → CombatEngine
    - Validation → Services dédiés

  5. Système de persistance

  - Problème : Aucune sauvegarde des parties
  - Solution : localStorage/sessionStorage pour l'état de jeu
  - Urgence : Haute (perte de progression utilisateur)

  ⚡ Priorité 3 - Performance et UX

  6. Optimisations React

  // Ajouter React.memo sur les composants lourds
  const CombatGrid = React.memo(({ positions, enemies }) => {
    // Composant lourd qui se re-rend souvent
  })

  // Lazy loading des scènes
  const InteractiveScene = React.lazy(() =>
  import('./InteractiveScene'))

  7. Gestion d'erreurs robuste

  - Error boundaries plus granulaires par fonctionnalité
  - Retry automatique pour les actions critiques
  - Fallbacks pour les composants défaillants

  🔄 Priorité 4 - Refactoring graduel

  8. Simplification des composants UI

  - Supprimer les variants inutilisés dans UI_VARIANTS
  - Audit d'utilisation des composants complexes (Loading, Modal
  variants)
  - Standardisation sur un design system minimal

  9. Consolidation des utilitaires

  // Fusionner les fonctions similaires
  // Au lieu de : takeDamagePlayer, takeDamageCompanion,
  takeDamageCompanionById
  // Avoir : takeDamage(characterId, damage, characterType)

  10. Tests automatisés

  - Services (fonctions pures) → Tests unitaires prioritaires
  - Stores → Tests d'intégration des actions
  - Composants critiques → Tests de snapshot

  📋 Plan de migration suggéré

  Phase 1 (1-2 semaines)

  1. ✅ Commenter le code obsolète (Déjà fait)
  2. Migrer toutes les scènes vers le nouveau format
  3. Supprimer companionCharacter, utiliser uniquement
  activeCompanions[]

  Phase 2 (2-3 semaines)

  4. Ajouter persistance localStorage
  5. Déplacer logique métier stores → services
  6. Migration TypeScript des services

  Phase 3 (1-2 semaines)

  7. Optimisations React (memo, lazy loading)
  8. Error boundaries granulaires
  9. Nettoyage composants UI

  Phase 4 (En continu)

  10. Tests automatisés
  11. Migration TypeScript complète
  12. Monitoring et analytics

  🎯 ROI par modernisation

  | Modernisation         | Effort | Impact    | ROI   |
  |-----------------------|--------|-----------|-------|
  | Système scènes unifié | Moyen  | Très haut | ⭐⭐⭐⭐⭐ |
  | Multi-compagnons      | Faible | Haut      | ⭐⭐⭐⭐⭐ |
  | Persistance           | Faible | Très haut | ⭐⭐⭐⭐⭐ |
  | TypeScript            | Haut   | Haut      | ⭐⭐⭐⭐  |
  | Optimisations React   | Moyen  | Moyen     | ⭐⭐⭐   |
