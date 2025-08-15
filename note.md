● Pour intégrer cette refonte des scènes, voici les fichiers à modifier :     

  📁 Fichiers de données

  src/data/scenes.js

  - Migrer vers la nouvelle structure avec métadonnées et conditions
  - Ajouter gameFlags et StoryService

  src/data/gameFlags.js (nouveau)

  - Définir toutes les variables persistantes du jeu
  - Structure initiale des flags, réputation, companions

  🏪 Stores Zustand

  src/stores/gameStore.js

  - Ajouter gameFlags au state
  - Fonctions setFlag(), updateReputation(), addToHistory()
  - Getters pour évaluer les conditions

  src/stores/storyStore.js (nouveau)

  - Store dédié à la logique narrative
  - Gestion de l'historique des choix
  - Évaluation des conditions

  🛠️ Services

  src/services/StoryService.js (nouveau)

  - Logique d'évaluation des conditions
  - Sélection des variations de texte
  - Filtrage des choix disponibles

  src/components/utils/sceneUtils.js

  - Adapter processSceneAction() pour les nouvelles structures
  - Gérer les conséquences (flags, réputation)
  - Support des templates

  🎭 Composants

  src/components/game/Scene.jsx

  - Utiliser StoryService pour filtrer les choix
  - Afficher les variations de texte
  - Gérer les nouvelles actions/conséquences

  src/App.jsx

  - Importer le nouveau StoryService
  - Passer gameFlags aux composants
  - Adapter onChoice() pour les conséquences

  🔧 Types/Interfaces

  src/types/story.js (nouveau)

  - Définir les types pour scenes, choices, conditions
  - Interfaces pour gameFlags et métadonnées

  📊 Utilitaires

  src/utils/conditionEvaluator.js (nouveau)

  - Parser et évaluer les conditions string
  - Fonctions helper pour logique complexe

  src/utils/storyHelpers.js (nouveau)

  - Helpers pour templates et variations
  - Fonctions de debug pour tracer le flow

  🗂️ Organisation proposée

  src/
  ├── data/
  │   ├── scenes.js (refactorisé)
  │   ├── gameFlags.js (nouveau)
  │   └── storyTemplates.js (nouveau)
  ├── stores/
  │   ├── gameStore.js (modifié)
  │   └── storyStore.js (nouveau)
  ├── services/
  │   └── StoryService.js (nouveau)
  ├── components/
  │   └── game/
  │       └── Scene.jsx (modifié)
  │       └── MerchantScene.jsx (nouveau)
  │       └── DialogueScene.jsx (nouveau)
  │       └── InteractiveScene.jsx (nouveau)
  ├── utils/
  │   ├── conditionEvaluator.js (nouveau)
  │   └── storyHelpers.js (nouveau)
  └── types/
      └── story.js (nouveau)

  🚀 Plan de migration

  1. Phase 1 : Créer les nouveaux services et types
  2. Phase 2 : Adapter les stores pour supporter les flags
  3. Phase 3 : Migrer progressivement les scènes
  4. Phase 4 : Mettre à jour les composants
  5. Phase 5 : Tests et optimisations

  🚀 Plan de migration mis à jour

  Phase 1 : Fondations

  - Types/interfaces pour toutes les scènes (dialogue, interactive,
  marchand)
  - Service StoryService étendu
  - Variables de jeu (gameFlags)

  Phase 2 : Infrastructure

  - Stores adaptés (gameStore + storyStore)
  - Utilitaires (conditionEvaluator, sceneUtils)

  Phase 3 : Composants

  - DialogueScene, InteractiveScene, MerchantScene
  - ShopInterface, HotspotOverlay

  Phase 4 : Migration progressive

  - Adaptation de Scene.jsx et App.jsx
  - Migration d'exemples de scènes

  Commençons la migration !