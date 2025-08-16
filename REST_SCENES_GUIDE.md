# 🛏️ Guide Complet des Scènes de Repos

## 🎯 **3 Types de Repos Disponibles**

### 1. **SCENE_TYPES.REST_SHORT** - Repos Court Obligatoire
Impose un repos court au joueur, pas de choix ni d'annulation.

#### ✅ **Structure Requise**
```javascript
{
  metadata: {
    type: SCENE_TYPES.REST_SHORT,
    title: "Repos Court"
  },
  content: {
    text: "Description narrative du repos court..."
  },
  next: "scene_apres_repos"  // ✅ OBLIGATOIRE - Où aller après
}
```

#### 🎮 **Comportement**
- ✅ Repos court automatique
- ❌ Pas de sélecteur de type
- ❌ Pas de bouton annuler
- ✅ Navigation vers `scene.next`

---

### 2. **SCENE_TYPES.REST_LONG** - Repos Long Obligatoire
Impose un repos long au joueur, pas de choix ni d'annulation.

#### ✅ **Structure Requise**
```javascript
{
  metadata: {
    type: SCENE_TYPES.REST_LONG,
    title: "Repos Long"
  },
  content: {
    text: "Description narrative du repos long..."
  },
  next: "scene_apres_repos"  // ✅ OBLIGATOIRE - Où aller après
}
```

#### 🎮 **Comportement**
- ✅ Repos long automatique
- ❌ Pas de sélecteur de type
- ❌ Pas de bouton annuler
- ✅ Navigation vers `scene.next`

---

### 3. **SCENE_TYPES.REST_CHOICE** - Choix de Repos
Permet au joueur de choisir entre repos court et long, avec bouton retour.

#### ✅ **Structure Requise**
```javascript
{
  metadata: {
    type: SCENE_TYPES.REST_CHOICE,
    title: "Choix de Repos"
  },
  content: {
    text: "Vous pouvez vous reposer. Quel type de repos voulez-vous ?"
  },
  next: "scene_apres_repos",  // ✅ OBLIGATOIRE - Après n'importe quel repos
  back: "scene_precedente"    // ✅ OBLIGATOIRE - Si bouton retour
}
```

#### 🎮 **Comportement**
- ✅ Sélecteur court/long affiché
- ✅ Bouton "← Retour" affiché
- ✅ Navigation vers `scene.next` après repos
- ✅ Navigation vers `scene.back` si retour

---

## 🔧 **Exemples Pratiques**

### **Exemple 1 : Repos Court Forcé**
```javascript
"repos_court_obligatoire": {
  metadata: {
    type: SCENE_TYPES.REST_SHORT,
    title: "Récupération Rapide"
  },
  content: {
    text: "Épuisé par le combat, vous devez absolument prendre quelques minutes pour récupérer vos forces."
  },
  next: "suite_aventure"
}
```

### **Exemple 2 : Repos Long Forcé**
```javascript
"repos_long_auberge": {
  metadata: {
    type: SCENE_TYPES.REST_LONG,
    title: "Nuit à l'Auberge"
  },
  content: {
    text: "L'aubergiste vous montre votre chambre. Vous passez une nuit réparatrice dans un lit confortable."
  },
  next: "matin_suivant"
}
```

### **Exemple 3 : Choix de Repos**
```javascript
"choix_repos_avec_kael": {
  metadata: {
    type: SCENE_TYPES.REST_CHOICE,
    title: "Repos avec Kael"
  },
  content: {
    text: "Kael vous propose de vous reposer avant d'explorer les tunnels. Vous pouvez prendre un repos court pour récupérer rapidement, ou un repos long pour être en pleine forme."
  },
  next: "exploration_tunnels",
  back: "discussion_avec_kael"
}
```

---

## 🔄 **Migration des Anciennes Scènes**

### ❌ **Ancien Format à Migrer**
```javascript
// ❌ À SUPPRIMER
{
  text: "...",
  choices: [
    {
      text: "Se reposer",
      action: {
        type: "shortRest",
        nextScene: "apres_repos"
      }
    }
  ]
}
```

### ✅ **Nouveau Format Unifié**
```javascript
// ✅ REMPLACER PAR
{
  text: "...",
  choices: [
    {
      text: "Se reposer",
      next: "scene_repos_court"  // Scène dédiée
    }
  ]
}

// ET CRÉER
"scene_repos_court": {
  metadata: {
    type: SCENE_TYPES.REST_SHORT,
    title: "Repos Court"
  },
  content: {
    text: "Vous prenez quelques minutes pour récupérer..."
  },
  next: "apres_repos"
}
```

---

## 🎯 **Résumé des Propriétés**

| Type | metadata.type | metadata.title | next | back | Sélecteur | Annulation |
|------|---------------|----------------|------|------|-----------|------------|
| **REST_SHORT** | ✅ Obligatoire | ✅ Obligatoire | ✅ Obligatoire | ❌ | ❌ | ❌ |
| **REST_LONG** | ✅ Obligatoire | ✅ Obligatoire | ✅ Obligatoire | ❌ | ❌ | ❌ |
| **REST_CHOICE** | ✅ Obligatoire | ✅ Obligatoire | ✅ Obligatoire | ✅ Obligatoire | ✅ | ✅ Retour |

---

## 🚨 **Erreurs Communes à Éviter**

### ❌ **Structure Incorrecte**
```javascript
// ❌ Manque la propriété next
{
  metadata: { type: SCENE_TYPES.REST_LONG, title: "Repos" }
  // ❌ Pas de next = erreur !
}

// ❌ Utilise choices.next au lieu de next
{
  metadata: { type: SCENE_TYPES.REST_SHORT, title: "Repos" },
  choices: { next: "scene" }  // ❌ Format incorrect
}
```

### ✅ **Structure Correcte**
```javascript
// ✅ Propriété next au bon niveau
{
  metadata: { type: SCENE_TYPES.REST_LONG, title: "Repos" },
  next: "scene_suivante"  // ✅ Correct
}
```

---

## 💡 **Conseils d'Utilisation**

### **Quand utiliser REST_SHORT :**
- Après un combat difficile
- Point de récupération dans un donjon
- Pause forcée dans l'histoire

### **Quand utiliser REST_LONG :**
- Arrivée dans une auberge/ville
- Fin de chapitre/journée
- Récupération complète obligatoire

### **Quand utiliser REST_CHOICE :**
- Le joueur peut choisir sa stratégie
- Situation où les deux options sont valides
- Quand on veut donner du contrôle au joueur

---

## 🎉 **Avantages du Nouveau Système**

✅ **Narratif** : Chaque repos a son contexte et sa description  
✅ **Flexible** : 3 types couvrent tous les cas d'usage  
✅ **Cohérent** : Navigation unifiée avec `next` et `back`  
✅ **Simple** : Plus de logique complexe dans les choix  
✅ **Maintenable** : Structure prévisible et documentée  

Le système de repos est maintenant parfaitement intégré dans votre architecture de scènes unifiée ! 🎯