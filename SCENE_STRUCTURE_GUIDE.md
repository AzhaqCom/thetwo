# 📖 Guide des Structures de Scènes

Basé sur l'analyse du code `renderNewSceneFormat`, voici les propriétés **requises** et **optionnelles** pour chaque type de scène.

## 🏗️ Structure de Base (Toutes les Scènes)

### ✅ **Propriétés OBLIGATOIRES**
```javascript
{
  metadata: {
    type: SCENE_TYPES.*, // OBLIGATOIRE - Détermine le rendu
    title: "string"      // OBLIGATOIRE - Affiché dans l'interface
  }
}
```

### 📝 **Propriétés OPTIONNELLES communes**
```javascript
{
  metadata: {
    chapter: "string",    // Pour organisation
    tags: ["array"],      // Pour recherche/filtrage
    location: "string",   // Contexte narratif
    character: "string"   // ID du PNJ principal
  },
  content: {
    text: "string",       // Texte principal (fallback si StoryService échoue)
    variations: {}        // Textes conditionnels
  },
  conditions: {
    show_if: "string",           // Condition pour afficher la scène
    show_variation: {}           // Conditions pour les variations
  }
}
```

---

## 🎭 Types de Scènes Spécifiques

### 1. **SCENE_TYPES.DIALOGUE**
Utilisé par le composant `DialogueScene`

#### ✅ **Obligatoire**
```javascript
{
  metadata: {
    type: SCENE_TYPES.DIALOGUE,
    title: "string"
  }
}
```

#### 📝 **Optionnel (pour DialogueScene)**
```javascript
{
  content: {
    speaker: "string",    // Nom du PNJ
    portrait: "string"    // Image du PNJ
  }
}
```

#### 🎮 **Gestion des Choix**
- Passe `scene` et `gameState` à `DialogueScene`
- Les choix sont gérés par `handleNewChoice`

---

### 2. **SCENE_TYPES.INTERACTIVE**
Utilisé par le composant `InteractiveScene`

#### ✅ **Obligatoire**
```javascript
{
  metadata: {
    type: SCENE_TYPES.INTERACTIVE,
    title: "string"
  }
}
```

#### 📝 **Optionnel (pour InteractiveScene)**
```javascript
{
  metadata: {
    background: "string"  // Image de fond
  },
  hotspots: [             // Zones cliquables
    {
      id: "string",
      coordinates: { x, y, width, height },
      text: "string",
      action: {}
    }
  ]
}
```

#### 🎮 **Gestion des Interactions**
- Hotspots gérés par `handleHotspotClick`
- Choix gérés par `handleNewChoice`

---

### 3. **SCENE_TYPES.MERCHANT**
Utilisé par le composant `MerchantScene`

#### ✅ **Obligatoire**
```javascript
{
  metadata: {
    type: SCENE_TYPES.MERCHANT,
    title: "string"
  }
}
```

#### 📝 **Optionnel (pour MerchantScene)**
```javascript
{
  shop: {
    inventory: [          // Items à vendre
      {
        id: "string",
        price: number,
        stock: number
      }
    ]
  }
}
```

#### 🎮 **Gestion du Commerce**
- Achats gérés par `handlePurchase`
- Ventes gérées par `handleSell`
- Choix gérés par `handleNewChoice`

---

### 4. **SCENE_TYPES.REST_LONG / SCENE_TYPES.REST_SHORT**
Utilisé par le composant `RestPanel`

#### ✅ **Obligatoire**
```javascript
{
  metadata: {
    type: SCENE_TYPES.REST_LONG, // ou REST_SHORT
    title: "string"
  }
}
```

#### 📝 **Optionnel**
```javascript
{
  choices: {
    next: "string"        // Scène suivante après le repos
  }
}
```

#### 🎮 **Gestion du Repos**
- Type automatiquement détecté (long/short)
- Callback `onRestComplete` avec navigation automatique

---

### 5. **SCENE_TYPES.COMBAT**
Utilisé par le composant `CombatPanel`

#### ✅ **Obligatoire**
```javascript
{
  metadata: {
    type: SCENE_TYPES.COMBAT,
    title: "string"
  },
  enemies: [              // OBLIGATOIRE - Liste des ennemis
    {
      type: "string",     // Type d'ennemi (utilisé pour nommage)
      // ... autres propriétés d'ennemi
    }
  ]
}
```

#### 📝 **Optionnel**
```javascript
{
  metadata: {
    nextScene: "string"   // Scène après victoire
  },
  enemyPositions: [       // Positions des ennemis
    { x: number, y: number }
  ],
  playerPosition: { x, y },
  companionPositions: { x, y },
  next: "string"          // Fallback si nextScene absent
}
```

#### 🎮 **Gestion du Combat**
- Conversion automatique positions tableau → objet
- Nommage automatique des ennemis (`Gobelin 1`, `Gobelin 2`)
- Gestion victoire via `handleCombatVictory`

---

### 6. **SCENE_TYPES.TEXT (ou default)**
Rendu direct dans `App.jsx`

#### ✅ **Obligatoire**
```javascript
{
  metadata: {
    type: SCENE_TYPES.TEXT, // ou n'importe quel type non reconnu
    title: "string"
  }
}
```

#### 📝 **Optionnel**
```javascript
{
  content: {
    text: "string"        // Texte de base (si StoryService échoue)
  },
  choices: [              // Choix disponibles
    {
      text: "string",
      next: "string",
      // ... autres propriétés de choix
    }
  ]
}
```

#### 🎮 **Gestion du Texte**
- Texte récupéré via `StoryService.getSceneText(scene, gameState)`
- Choix récupérés via `StoryService.getAvailableChoices(scene, gameState)`
- Choix gérés par `handleNewChoice`

---

## 🚨 Type Spécial : Gestion d'Erreur

#### ✅ **Structure Automatique**
```javascript
{
  metadata: { 
    type: 'error', 
    title: 'Erreur' 
  },
  content: { 
    text: "Message d'erreur",
    error: true
  }
}
```

---

## 🎯 Résumé - Propriétés Minimales par Type

| Type | metadata.type | metadata.title | Spécifique |
|------|---------------|----------------|------------|
| **DIALOGUE** | ✅ | ✅ | `content.speaker`, `content.portrait` |
| **INTERACTIVE** | ✅ | ✅ | `hotspots[]`, `metadata.background` |
| **MERCHANT** | ✅ | ✅ | `shop.inventory[]` |
| **REST_LONG/SHORT** | ✅ | ✅ | `choices.next` |
| **COMBAT** | ✅ | ✅ | **`enemies[]`** (obligatoire) |
| **TEXT** | ✅ | ✅ | `content.text`, `choices[]` |

## 💡 Conseils d'Unification

1. **Utilisez toujours** `metadata.type` et `metadata.title`
2. **Pour le contenu textuel**, privilégiez le `StoryService` via `content.text` et `content.variations`
3. **Pour les choix**, utilisez le format unifié avec `choices[]`
4. **Pour les combats**, `enemies[]` est indispensable
5. **Testez vos scènes** - le build vous dira si quelque chose manque !