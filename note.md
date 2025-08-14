# Note de développement

## Partie 1 — Bug à corriger
**Problème : montée de niveau**
- Actuellement, la montée de niveau se fait **dans la fonction `AddExperience`** (fichier `characterManager`).
- La montée de niveau **ne se déclenche pas correctement** et peut provoquer **des boucles infinies** si aucune protection n’est mise.
- 💡 Idée d’amélioration : créer **une fonction dédiée** à la montée de niveau pour mieux isoler et contrôler la logique.

---

## Partie 2 — Améliorations

### 2a — Ajout de fonctionnalité : attaques multiples ennemies
**Contexte :**
- Dans la fonction `executeAttack` (fichier `CombatTurnManager`), on ne gère pas les ennemis pouvant attaquer **plusieurs fois**.
- Exemple : le **Diable** (défini dans `data/enemies.js`) possède une propriété `attackSets` (tableau d’objets).
- Pour le Diable :
  - Il a **soit** un set de **2 attaques en mêlée**  
  - **Soit** un set de **2 attaques à distance**  
  - L’ennemi doit **choisir intelligemment** quel set utiliser.

**Tâche :**
- Ajouter une logique dans `executeAttack` pour :
  - Détecter si `attackSets` existe.
  - Laisser l’ennemi effectuer toutes les attaques du set choisi.
  - Déterminer le meilleur set selon la situation.

---

### 2b — Refonte : gestion et affichage des sorts
**Objectif :**
- Modifier le fonctionnement du `SpellPanel` pour se rapprocher de **DnD**.

**Nouveau fonctionnement :**
1. Afficher un **grimoire** avec tous les sorts disponibles (même ceux que le joueur ne connaît pas encore, mais auxquels il peut avoir accès de par son niveau).
2. Le joueur peut **préparer** certains sorts (hors combat).
3. Les sorts préparés deviennent **utilisables en combat et hors combat**.
4. Gestion spéciale :
   - Pour les sorts ayant `castableOutOfCombat: true` (exemple : *Armure du Mage*), ne pas afficher le bouton **"Lancer"** si le sort est déjà actif.

**Contraintes :**
- Veiller à **ne rien casser** dans le fonctionnement actuel.
