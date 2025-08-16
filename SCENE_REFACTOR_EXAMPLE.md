# 🔄 Exemple de Refactorisation : Scene "kael_rejoint"

## ❌ **AVANT** (Format mixte avec action)

```javascript
"kael_rejoint": {
  metadata: {
    type: SCENE_TYPES.TEXT,
    chapter: "prologue",
    tags: ["companion", "success"],
    title: "Alliance Formée"
  },
  content: {
    text: "Kael hoche la tête avec satisfaction. 'Bien. J'ai repéré des tunnels sous le village qui mènent vers les anciennes fondations. C'est probablement là que se trouvent les réponses que tu cherches. Mais d'abord, nous devons nous préparer.'"
  },
  choices: [
    {
      text: "Explorer les tunnels immédiatement",
      next: "tunnels_entree",
      consequences: {
        flags: { exploringWithKael: true }
      }
    },
    {
      text: "Prendre du repos avant l'exploration",
      action: {                           // ❌ Action complexe
        type: "shortRest",
        nextScene: "repos_avec_kael"      // ❌ nextScene incohérent
      }
    }
  ]
}
```

## ✅ **APRÈS** (Format unifié)

```javascript
"kael_rejoint": {
  metadata: {
    type: SCENE_TYPES.TEXT,
    chapter: "prologue",
    tags: ["companion", "success"],
    title: "Alliance Formée"
  },
  content: {
    text: "Kael hoche la tête avec satisfaction. 'Bien. J'ai repéré des tunnels sous le village qui mènent vers les anciennes fondations. C'est probablement là que se trouvent les réponses que tu cherches. Mais d'abord, nous devons nous préparer.'"
  },
  choices: [
    {
      text: "Explorer les tunnels immédiatement",
      next: "tunnels_entree",
      consequences: {
        flags: { exploringWithKael: true }
      }
    },
    {
      text: "Prendre du repos avant l'exploration",
      next: "repos_court_avec_kael"       // ✅ Navigation directe
    }
  ]
},

// ✅ NOUVELLE SCÈNE DE REPOS DÉDIÉE
"repos_court_avec_kael": {
  metadata: {
    type: SCENE_TYPES.REST_SHORT,         // ✅ Type dédié
    title: "Repos avec Kael"
  },
  content: {
    text: "Kael approuve votre décision. 'Sage choix. Prenons quelques minutes pour nous reposer et planifier notre approche.' Vous vous installez confortablement pendant que Kael partage ses connaissances sur les tunnels."
  },
  next: "repos_avec_kael"                 // ✅ Scène après repos
}
```

## 🎯 **Changements Apportés**

### 1. **Suppression de l'Action Complexe**
- ❌ `action: { type: "shortRest", nextScene: "..." }`
- ✅ `next: "repos_court_avec_kael"`

### 2. **Création d'une Scène Dédiée**
- **Type** : `SCENE_TYPES.REST_SHORT` (reconnu par le système)
- **Contenu** : Description immersive du repos
- **Navigation** : `next` vers la scène finale

### 3. **Cohérence de Navigation**
- Toujours `next`, jamais `nextScene`
- Pipeline unifié et prévisible

## 💡 **Avantages**

✅ **Plus simple** : Navigation directe sans logique complexe  
✅ **Plus immersif** : Scène de repos avec description narrative  
✅ **Plus cohérent** : Format unifié avec les autres scènes  
✅ **Plus maintenable** : Pas de cas spéciaux dans le code  
✅ **Fonctionnel** : Le système de repos marchera correctement  

## 🔄 **Pattern de Migration**

Pour tous vos `choice.action`, suivez ce pattern :

1. **Identifier l'action** : `shortRest`, `longRest`, `combat`, etc.
2. **Créer une scène dédiée** avec le bon `SCENE_TYPES.*`
3. **Remplacer l'action** par `next: "nouvelle_scene"`
4. **Tester** que la navigation fonctionne