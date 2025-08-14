Changements nécessaires dans les stores

  CharacterStore (src/stores/characterStore.js:24)

  Actuellement stocke playerCompanion (singulier). Il faudrait :
  - Remplacer par playerCompanions: [] (array de 2 compagnons max)
  - Dupliquer toutes les méthodes pour gérer les 2 compagnons :
    - updatePlayerCompanion1, updatePlayerCompanion2
    - takeDamageCompanion1, takeDamageCompanion2
    - etc.

  CombatStore (src/stores/combatStore.js:87-98)

  L'initialisation du combat gère déjà un compagnon optionnel. Il faudrait :
  - Modifier l'initiative pour supporter 2 compagnons
  - Adapter calculateInitialPositions pour placer 2 compagnons
  - Modifier executeCompanionTurn pour gérer les 2

  Changements dans l'interface utilisateur

  CompanionDisplay (src/components/features/character/CompanionDisplay.jsx)

  Le composant est déjà flexible, il suffirait de l'instancier 2 fois.

  App.jsx

  Plusieurs endroits à modifier :
  - Ligne 63 : playerCompanion → array de compagnons
  - Ligne 135 : Distribution XP aux 2 compagnons
  - Ligne 188 : Passer les 2 compagnons au CombatPanel
  - Ligne 244 : Afficher 2 CompanionDisplay

  CombatGrid (src/components/features/combat/CombatGrid.jsx:108)

  Vérifier les positions des 2 compagnons au lieu d'un seul.

  CombatTurnManager (src/components/features/combat/CombatTurnManager.jsx)

  Gérer les tours des 2 compagnons séparément.

  Changements dans le système de combat

  Positions initiales

  - Joueur : (0,5)
  - Compagnon 1 : (1,5)
  - Compagnon 2 : (0,4) ou (2,5)

  Ordre d'initiative

  Chaque compagnon aurait sa propre initiative.

  IA des compagnons

  Le système d'IA actuel (executeCompanionTurn) devrait être dupliqué.

  Estimation de complexité

  Impact moyen-élevé : Beaucoup de code à dupliquer/adapter mais la structure existe déjà. Les principales     
   difficultés :
  1. Gestion des états multiples dans les stores
  2. Coordination des 2 compagnons en combat
  3. Interface utilisateur pour différencier les 2 compagnons
  4. Tests pour s'assurer qu'aucun bug n'est introduit



  fin de claude :


  ● Parfait ! Maintenant je vois le problème. L'IA fonctionne correctement et choisit bien les compagnons :

  🏹 Squelette 1 choisit: Rhingann (companion) à distance 2
  🏹 Squelette 2 choisit: Rhingann (companion) à distance 2

  Mais ensuite elle échoue à attaquer :

  🤷 Squelette 1 est trop loin pour attaquer (distance: 2)
  🤷 Squelette 2 est trop loin pour attaquer (distance: 2)

  Le problème est que les squelettes ont une portée d'attaque de 1 case mais choisissent des cibles à 2        
  cases. L'IA de mouvement ne les rapproche pas assez !

  Regardons l'IA de mouvement :

● Read(src\services\combatEngine.js)
  ⎿  Read 20 lines (ctrl+r to expand)

● Read(src\services\combatEngine.js)
  ⎿  Read 15 lines (ctrl+r to expand)

● Le problème est à la ligne 116 : l'IA ne bouge que si la cible est plus loin que la distance idéale.
  Mais pour des attaques de mêlée (distance idéale = 1), si la cible est à distance 2, l'IA devrait se
  rapprocher !

  La condition est inversée. Changeons cela :

● Update(src\services\combatEngine.js)
  ⎿  Updated src\services\combatEngine.js with 1 addition and 1 removal
       112
       113        const idealDistance = this.getIdealDistance(entity)
       114
       115 -      // If already at ideal distance, don't move
       115 +      // If already at ideal distance or closer, don't move
       116        if (closestTarget.distance <= idealDistance) return null
       117
       118        // Find best position within movement range

● Attendez, la logique semble correcte. Le problème est ailleurs. Regardons les logs plus attentivement :

  1. Squelette 1 à (0,0) choisit Rhingann à (2,0) distance 2
  2. Squelette 2 à (1,1) choisit Rhingann à (2,0) distance 2

  La cible est à distance 2, distance idéale = 1, donc ils devraient bouger pour se rapprocher. Mais ils
  ne bougent pas assez près !

  Le problème est que l'IA de mouvement et l'IA de ciblage utilisent des cibles différentes ! Vérifions        
  findPotentialTargets vs findBestTarget :

● Read(src\services\combatEngine.js)
  ⎿  Read 25 lines (ctrl+r to expand)

● Voilà le problème ! findPotentialTargets (utilisé pour le mouvement) utilise encore l'ancien système
  avec companionCharacter et combatPositions.companion, tandis que findBestTarget (utilisé pour le
  ciblage) utilise le nouveau système activeCompanions.

  Donc :
  1. L'IA bouge vers l'ancien companionCharacter (inexistant ou mauvaise position)
  2. L'IA cible vers les nouveaux activeCompanions (positions correctes)

  Il faut mettre à jour findPotentialTargets :

● Update(src\services\combatEngine.js)
  ⎿  Updated src\services\combatEngine.js with 17 additions and 2 removals
       151       * @returns {Array} Array of potential targets with positions
       152       */
       153      static findPotentialTargets(entity, combatState) {
       154 -      const { playerCharacter, companionCharacter, combatEnemies, combatPositions } = 
     combatState
           - combatState
       154 +      const { playerCharacter, companionCharacter, combatEnemies, combatPositions, 
     activeCompanions = [] } = combatState
           + activeCompanions = [] } = combatState
       155        const targets = []
       156
       157        if (entity.type === ENTITY_TYPES.ENEMY) {
       158 -        // Enemies target player and companion
       158 +        // Enemies target player and companions
       159          if (playerCharacter?.currentHP > 0 && combatPositions.player) {
       160            targets.push({ entity: playerCharacter, position: combatPositions.player })
       161          }
       162 +        
       163 +        // Ajouter tous les compagnons actifs (nouveau système)
       164 +        if (activeCompanions && activeCompanions.length > 0) {
       165 +          activeCompanions.forEach(companion => {
       166 +            if (companion && companion.currentHP > 0) {
       167 +              const companionId = companion.id || companion.name.toLowerCase()
       168 +              const companionPos = combatPositions[companionId]
       169 +              if (companionPos) {
       170 +                targets.push({ entity: companion, position: companionPos })
       171 +              }
       172 +            }
       173 +          })
       174 +        }
       175 +        
       176 +        // Compatibilité avec l'ancien système
       177          if (companionCharacter?.currentHP > 0 && combatPositions.companion) {
       178            targets.push({ entity: companionCharacter, position: combatPositions.companion })        
       179          }

● Il faut aussi s'assurer que activeCompanions est passé à calculateOptimalMovement. Vérifions comment
  c'est appelé dans CombatTurnManager :

● Read(src\components\features\combat\CombatTurnManager.jsx)
  ⎿  Read 10 lines (ctrl+r to expand)

● Il faut ajouter activeCompanions au gameState pour le mouvement :

● Update(src\components\features\combat\CombatTurnManager.jsx)
  ⎿  Updated src\components\features\combat\CombatTurnManager.jsx with 3 additions and 1 removal
       297        }
       298    
       299        // État du jeu actuel
       300 +      const activeCompanions = getActiveCompanions()
       301        const gameState = {
       302          combatPositions: useCombatStore.getState().combatPositions,
       303          combatEnemies: enemies,
       304          playerCharacter,
       305 -        companionCharacter: playerCompanion
       305 +        companionCharacter: playerCompanion,
       306 +        activeCompanions: activeCompanions
       307        }
       308
       309        // 1. MOUVEMENT

● Update(src\components\features\combat\CombatTurnManager.jsx)
  ⎿  Error editing file

● Update(src\components\features\combat\CombatTurnManager.jsx)
  ⎿  Updated src\components\features\combat\CombatTurnManager.jsx with 4 additions and 2 removals
       323        // Mettre à jour l'état du jeu après mouvement
       324        const updatedGameState = {
       325          ...gameState,
       326 -        combatPositions: useCombatStore.getState().combatPositions
       326 +        combatPositions: useCombatStore.getState().combatPositions,
       327 +        activeCompanions: activeCompanions
       328        }
       329    
       330        // 2. CIBLAGE
     ...
       416        // Mettre à jour l'état du jeu après mouvement
       417        const updatedGameState = {
       418          ...gameState,
       419 -        combatPositions: useCombatStore.getState().combatPositions
       419 +        combatPositions: useCombatStore.getState().combatPositions,
       420 +        activeCompanions: activeCompanions
       421        }
       422
       423        // 2. CIBLAGE ET ATTAQUE (utilise la même logique que les ennemis)

● Update Todos
  ⎿  ☒ Analyser l'IA actuelle des monstres
     ☒ Mettre à jour findBestTarget pour voir tous les compagnons
     ☒ Tester la nouvelle IA des monstres
     ☒ Corriger la désynchronisation mouvement/ciblage IA
     ☐ Tester que les monstres attaquent maintenant les compagnons

● Parfait ! J'ai corrigé le problème de désynchronisation entre l'IA de mouvement et l'IA de ciblage. Le
  problème était que :

  1. L'IA de mouvement (findPotentialTargets) utilisait l'ancien système avec companionCharacter et
  positions.companion
  2. L'IA de ciblage (findBestTarget) utilisait le nouveau système avec activeCompanions

  Donc les ennemis bougeaient vers de mauvaises positions mais ciblaient les bonnes !

  Corrections apportées :
  - Mis à jour findPotentialTargets() pour utiliser activeCompanions
  - Ajouté activeCompanions dans gameState pour le mouvement des ennemis
  - Maintenu la compatibilité avec l'ancien système

  Maintenant les ennemis devraient :
  1. Se déplacer vers les vraies positions des compagnons
  2. S'approcher suffisamment pour attaquer (distance 1 pour le mêlée)
  3. Cibler intelligemment entre joueur et compagnons selon la proximité

  Testez un nouveau combat ! Les squelettes devraient maintenant vraiment attaquer vos compagnons quand        
  ils sont plus proches que vous.