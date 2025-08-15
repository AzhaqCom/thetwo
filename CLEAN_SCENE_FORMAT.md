# 🧹 Format de Scènes Nettoyé - Guide des Bonnes Pratiques

## ✅ Nouveau Système Unifié

Après la migration, toutes les scènes utilisent maintenant un format cohérent et scalable.

### **Propriétés Essentielles Seulement**

Chaque scène ne contient que les propriétés nécessaires à son fonctionnement :

```javascript
{
  metadata: {
    type: SCENE_TYPES.DIALOGUE,  // Obligatoire
    character: "Tyrion",         // Pour dialogues uniquement
    title: "Titre de la scène",  // Recommandé
    chapter: "chapitre",         // Organisation
    tags: ["tag1", "tag2"]       // Classification
  },
  content: {
    text: "Texte principal",     // Obligatoire
    variations: { ... }          // Si nécessaire
  },
  conditions: { ... },           // Si nécessaire
  choices: [ ... ]               // Obligatoire pour interactions
}
```


## 📋 Types de Scènes et Propriétés

### **1. Scènes de Dialogue (`SCENE_TYPES.DIALOGUE`)**
```javascript
{
  metadata: {
    type: SCENE_TYPES.DIALOGUE,
    character: "NpcId",          // Obligatoire
    title: "Titre"
  },
  content: {
    speaker: "Nom du PNJ",       // Obligatoire
    portrait: "/path/image.png", // Recommandé
    text: "Dialogue..."          // Obligatoire
  },
  choices: [ ... ]               // Obligatoire
}
```

### **2. Scènes de Combat (`SCENE_TYPES.COMBAT`)**
```javascript
{
  metadata: {
    type: SCENE_TYPES.COMBAT,
    nextScene: "apres_combat"    // Obligatoire
  },
  type: "combat",                // Pour compatibilité CombatPanel
  enemies: [{ type: 'gobelin', count: 2 }],
  enemyPositions: [
    { x: 6, y: 1 }, { x: 7, y: 2 }
  ],
  // Nouvelles fonctionnalités
  playerPosition: { x: 2, y: 3 },        // Optionnel
  companionPositions: [                   // Optionnel
    { x: 1, y: 2 }, { x: 3, y: 4 }
  ],
  content: {
    text: "Description du combat"
  }
}
```

### **3. Scènes de Repos (`SCENE_TYPES.REST_LONG/REST_SHORT`)**
```javascript
{
  metadata: {
    type: SCENE_TYPES.REST_LONG,
    nextScene: "apres_repos"     // Obligatoire
  },
  content: {
    text: "Description du repos"
  }
  // Pas besoin de choices - gestion automatique
}
```

## 🔄 Logique de Conséquences Unifiée

### **Recrutement de Compagnons**
```javascript
consequences: {
  companions: ["Tyrion", "Rhingann"],  // Ajout automatique au jeu
  flags: { tyrionRecruited: true },
  npcRelations: { tyrion: 25 }
}
```

### **Changements d'État**
```javascript
consequences: {
  flags: { 
    questCompleted: true,
    hasKey: true 
  },
  reputation: 5,                       // Changement de réputation
  items: ["sword", "potion"],          // Items à ajouter
  visitLocation: "tavern"              // Marquer lieu visité
}
```

## 📏 Règles de Nettoyage

### **1. Une Seule Source de Vérité**
- ✅ `next` pour la scène suivante
- ❌ Pas de `action.nextScene` redondant

### **2. Logique Centralisée**
- ✅ `consequences` pour tous les effets
- ❌ Pas de `action.type` legacy

### **3. Propriétés Minimales**
- ✅ Seulement les propriétés utilisées
- ❌ Pas de propriétés "au cas où"

### **4. Types Cohérents**
- ✅ `metadata.type` définit le comportement
- ✅ Propriétés spécifiques par type

## 🎯 Avantages du Nouveau Système

1. **📦 Simplicité** : Moins de propriétés, plus clair
2. **🔄 Cohérence** : Même logique partout
3. **🚀 Scalabilité** : Facile d'ajouter des types
4. **🛠️ Maintenabilité** : Code plus propre
5. **🎮 Fonctionnalités** : Positions tactiques, variations dynamiques

## 🧪 Exemples Complets

### **Dialogue de Recrutement Propre**
```javascript
"recruit_tyrion": {
  metadata: {
    type: SCENE_TYPES.DIALOGUE,
    character: "Tyrion",
    title: "Recrutement de Tyrion"
  },
  content: {
    speaker: "Tyrion le Guerrier",
    text: "Veux-tu faire équipe avec moi ?",
    variations: {
      experienced: "Un aventurier comme toi me serait utile."
    }
  },
  conditions: {
    show_variation: {
      experienced: "character.level >= 3"
    }
  },
  choices: [
    {
      text: "Accepter",
      next: "next_scene",
      consequences: {
        companions: ["Tyrion"],
        flags: { tyrionRecruited: true },
        npcRelations: { tyrion: 25 }
      }
    },
    {
      text: "Refuser", 
      next: "next_scene",
      consequences: {
        flags: { tyrionRejected: true },
        npcRelations: { tyrion: -5 }
      }
    }
  ]
}
```

### **Combat Tactique Avancé**
```javascript
"tactical_combat": {
  metadata: {
    type: SCENE_TYPES.COMBAT,
    title: "Embuscade Tactique",
    nextScene: "post_combat"
  },
  type: "combat",
  enemies: [{ type: 'gobelin', count: 3 }],
  enemyPositions: [
    { x: 6, y: 1 }, { x: 5, y: 0 }, { x: 7, y: 2 }
  ],
  playerPosition: { x: 2, y: 3 },
  companionPositions: [
    { x: 1, y: 2 }, { x: 3, y: 4 }
  ],
  content: {
    text: "Une formation tactique parfaite !",
    variations: {
      withCompanions: "Vos compagnons sont bien positionnés !",
      alone: "Vous êtes seul mais bien placé !"
    }
  },
  conditions: {
    show_variation: {
      withCompanions: "gameFlags.companions.length > 0",
      alone: "gameFlags.companions.length === 0"
    }
  }
}
```

---

✨ **Le système est maintenant propre, cohérent et prêt pour l'avenir !**