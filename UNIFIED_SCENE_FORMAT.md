# 🎯 Format Unifié des Scènes

## 🏗️ Structure de Base (TOUTES les scènes)

```javascript
{
  metadata: {
    type: SCENE_TYPES.*,     // ✅ OBLIGATOIRE
    title: "string",         // ✅ OBLIGATOIRE
    chapter: "string",       // ✅ RECOMMANDÉ pour organisation
    tags: ["tag1", "tag2"],  // 📝 Optionnel
    location: "string"       // 📝 Optionnel
  },
  content: {
    text: "string",          // ✅ RECOMMANDÉ (texte principal)
    variations: {            // 📝 Optionnel (textes conditionnels)
      "condition_name": "texte alternatif"
    }
  },
  conditions: {              // 📝 Optionnel
    show_if: "condition",
    show_variation: {
      "variation_name": "condition"
    }
  },
  choices: [                 // ✅ STANDARD pour navigation
    {
      text: "string",        // ✅ OBLIGATOIRE
      next: "scene_id",      // ✅ STANDARD (PAS nextScene)
      condition: "string",   // 📝 Optionnel
      consequences: {        // 📝 Optionnel
        flags: { key: value },
        items: ["item_id"],
        companions: ["companion_id"]
      }
    }
  ]
}
```

---

## 🎭 **Formats Spécifiques par Type**

### 📝 **SCENE_TYPES.TEXT**
```javascript
{
  metadata: {
    type: SCENE_TYPES.TEXT,
    title: "Titre de la scène"
  },
  content: {
    text: "Votre texte narratif..."
  },
  choices: [
    {
      text: "Option 1",
      next: "scene_suivante"
    }
  ]
}
```

### 🎭 **SCENE_TYPES.DIALOGUE**
```javascript
{
  metadata: {
    type: SCENE_TYPES.DIALOGUE,
    title: "Conversation avec PNJ",
    character: "pnj_id"
  },
  content: {
    text: "Dialogue du PNJ...",
    speaker: "Nom du PNJ",
    portrait: "chemin/vers/image.jpg"
  },
  choices: [
    {
      text: "Réponse du joueur",
      next: "scene_suivante"
    }
  ]
}
```

### 🏪 **SCENE_TYPES.MERCHANT**
```javascript
{
  metadata: {
    type: SCENE_TYPES.MERCHANT,
    title: "Boutique",
    character: "marchand_id"
  },
  content: {
    text: "Bienvenue dans ma boutique !",
    speaker: "Nom du Marchand",
    portrait: "image.jpg"
  },
  shop: {
    inventory: [
      {
        id: "item_id",
        price: 100,
        stock: -1
      }
    ]
  },
  choices: [
    {
      text: "Au revoir",
      next: "scene_sortie"
    }
  ]
}
```

### 🎮 **SCENE_TYPES.INTERACTIVE**
```javascript
{
  metadata: {
    type: SCENE_TYPES.INTERACTIVE,
    title: "Scène Interactive",
    background: "image_fond.jpg"
  },
  content: {
    text: "Description de la scène..."
  },
  hotspots: [
    {
      id: "hotspot_id",
      coordinates: { x: 100, y: 200, width: 50, height: 50 },
      text: "Examiner l'objet",
      action: {
        type: "scene_transition",
        next: "scene_examen"
      }
    }
  ],
  choices: [
    {
      text: "Quitter la zone",
      next: "scene_sortie"
    }
  ]
}
```

### ⚔️ **SCENE_TYPES.COMBAT**
```javascript
{
  metadata: {
    type: SCENE_TYPES.COMBAT,
    title: "Combat contre les Gobelins"
  },
  enemies: [                 // ✅ OBLIGATOIRE
    {
      type: "gobelin",
      level: 1,
      count: 2
    }
  ],
  enemyPositions: [          // 📝 Optionnel
    { x: 6, y: 0 },
    { x: 7, y: 0 }
  ],
  next: "scene_apres_combat" // ✅ STANDARD (PAS nextScene)
}
```

### 🛏️ **SCENE_TYPES.REST_LONG**
```javascript
{
  metadata: {
    type: SCENE_TYPES.REST_LONG,
    title: "Repos Long"
  },
  content: {
    text: "Vous vous préparez pour un repos long..."
  },
  next: "scene_apres_repos"  // ✅ STANDARD
}
```

### 😴 **SCENE_TYPES.REST_SHORT**
```javascript
{
  metadata: {
    type: SCENE_TYPES.REST_SHORT,
    title: "Repos Court"
  },
  content: {
    text: "Vous prenez quelques minutes pour récupérer..."
  },
  next: "scene_apres_repos"  // ✅ STANDARD
}
```

---

## 🚫 **À ÉVITER / SUPPRIMER**

### ❌ **Actions dans les Choix** (Ancien Format)
```javascript
// ❌ À SUPPRIMER
choices: [
  {
    text: "Se reposer",
    action: {                    // ❌ Complexité inutile
      type: "longRest",
      nextScene: "apres_repos"   // ❌ nextScene incohérent
    }
  }
]

// ✅ REMPLACER PAR
choices: [
  {
    text: "Se reposer",
    next: "scene_repos_long"     // ✅ Simple et direct
  }
]
```

### ❌ **nextScene au lieu de next**
```javascript
// ❌ Incohérent
{
  metadata: { type: SCENE_TYPES.COMBAT },
  nextScene: "apres_combat"      // ❌ Format mixte
}

// ✅ Cohérent
{
  metadata: { type: SCENE_TYPES.COMBAT },
  next: "apres_combat"           // ✅ Format unifié
}
```

---

## 🔄 **Guide de Migration**

### 1. **Supprimer les `choice.action`**
- Remplacer par navigation directe avec `next`
- Créer des scènes dédiées pour repos/combats

### 2. **Unifier `nextScene` → `next`**
- Rechercher/remplacer tous les `nextScene`
- Utiliser `next` partout

### 3. **Créer les Scènes de Repos Manquantes**
```javascript
"repos_long_auberge": {
  metadata: {
    type: SCENE_TYPES.REST_LONG,
    title: "Repos à l'auberge"
  },
  content: {
    text: "Vous passez la nuit à l'auberge..."
  },
  next: "matin_suivant"
}
```

### 4. **Navigation Cohérente**
- Toujours utiliser `choices[].next`
- Supprimer `choices[].action` 
- Format simple et prévisible

---

## 🎯 **Bénéfices de l'Unification**

✅ **Code plus simple** - Un seul format de navigation  
✅ **Maintenance facile** - Structure prévisible  
✅ **Debugging simplifié** - Moins de cas spéciaux  
✅ **Performance** - Pipeline unifié  
✅ **Évolutivité** - Ajout facile de nouveaux types  

## 💡 **Commande de Nettoyage Rapide**

1. Rechercher : `nextScene:`
   Remplacer : `next:`

2. Rechercher : `action: {`
   Examiner et refactoriser en navigation directe

3. Créer les scènes de repos manquantes avec les bons types