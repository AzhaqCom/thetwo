// Scene de test pour tester le système d'IA des compagnons et les effets de combat

export const testScenes = {
  "test_recruit_companions": {
    id: "test_recruit_companions",
    type: "TEXT",
    title: "Test - Recrutement des Compagnons",
    content: `
# Test du Système de Compagnons

Vous vous trouvez dans une taverne mystérieuse où deux aventuriers extraordinaires vous attendent...

**Finn**, un gnome inventeur aux yeux pétillants, bricolait un étrange dispositif énergétique dans un coin. Ses mains expertes manipulaient des composants mécaniques avec une précision remarquable.

**Zara**, une sorcière humaine aux cheveux argentés, étudiait un grimoire planaire en murmurant des incantations. Des étincelles magiques dansaient autour de ses doigts.

"Nous avons entendu parler de votre quête," dit Finn en levant les yeux de son invention. "Nos compétences pourraient vous être utiles."

"En effet," ajoute Zara, "mes sorts et l'ingéniosité de Finn forment une combinaison redoutable."

Vous sentez que ces deux compagnons pourraient grandement vous aider dans les combats à venir.`,

    metadata: {
      location: "Taverne du Test",
      mood: "expectant",
      difficulty: "none"
    },

    choices: [
      {
        text: "Recruter Finn comme compagnon",
        next: "test_recruit_zara",
        action: {
          type: "ally",
          ally: "finn"
        }
      },
      {
        text: "[DEBUG] Retour au menu principal",
        next: "introduction"
      }
    ]
  },

  "test_recruit_zara": {
    id: "test_recruit_zara",
    type: "TEXT",
    title: "Test - Recrutement de Zara",
    content: `
# Finn rejoint l'équipe !

Finn range ses outils et ajuste son projectile énergétique. "Parfait ! Je vais pouvoir tester mes dernières inventions sur le terrain."

Zara lève les yeux de son grimoire. "Et moi ? Mes sorts de feu et de contrôle pourraient vous être très utiles. Surtout si vous rencontrez plusieurs ennemis à la fois..."

Elle ferme son livre d'un geste théâtral, des étincelles magiques dansant autour de ses doigts.`,

    metadata: {
      location: "Taverne du Test",
      mood: "expectant",
      difficulty: "none"
    },

    choices: [
      {
        text: "Recruter Zara également",
        next: "test_combat_goblins",
        action: {
          type: "ally",
          ally: "zara"
        }
      },
      {
        text: "Partir au combat avec Finn seulement",
        next: "test_combat_goblins"
      }
    ]
  },

  "test_combat_goblins": {
    metadata: {
      type: "combat",
      chapter: "acte1",
      tags: ["combat", "ombres"],
      title: "Attaque des Ombres Affamées",
      nextScene: "apres_premier_combat"
    },
    content: {
      text: "En sortant des tunnels vers les marais, vous êtes immédiatement attaqués par trois créatures d'ombre qui semblaient vous attendre. Leurs formes vaporeuses ondulent dans la brume nocturne, et leurs yeux rougeoyants fixent vos âmes avec une faim dévorante."
    },
    enemies: [{ type: 'gobelin', count: 2 }],
    enemyPositions: [
      { x: 7, y: 0 },
      { x: 7, y: 1 }
    ],
    choices: [
      {
        text: "Engager le combat !",
        action: {
          type: "combat"
        }
      }
    ]
  },



"test_combat_results": {
  id: "test_combat_results",
    type: "TEXT",
      title: "Test Réussi !",
        content: `
# Victoire ! Test du Système Réussi

Les gobelins gisent au sol, vaincus par votre équipe coordonnée !

## Résultats observés :

**Finn** a probablement :
- ✅ Utilisé "Détection de la magie" en priorité (support_skill)
- ✅ Effectué des attaques à distance avec son projectile énergétique  
- ✅ Soigné un allié blessé avec ses inventions si nécessaire

**Zara** a probablement :
- ✅ Lancé "Trait de feu" sur l'ennemi le plus faible (ranged_spell)
- ✅ Utilisé "Toile d'araignée" si les gobelins étaient groupés (area_damage)
- ✅ Les ennemis entravés n'ont pas pu bouger pendant 3 tours

**Système d'effets testé :**
- Les gobelins sous l'effet "restrained" ont eu leur mouvement bloqué
- Les effets se sont dissipés automatiquement après 3 tours
- L'IA ennemie a respecté les restrictions de mouvement

Excellente démonstration du nouveau système d'IA et d'effets de combat !`,

          metadata: {
    location: "Extérieur de la taverne",
      mood: "victorious",
        difficulty: "none"
  },

  choices: [
    {
      text: "Retourner au menu principal pour d'autres tests",
      next: "start"
    },
    {
      text: "Refaire le test de combat",
      next: "test_combat_goblins"
    }
  ]
},

"test_combat_defeat": {
  id: "test_combat_defeat",
    type: "TEXT",
      title: "Défaite - Test à Revoir",
        content: `
# Défaite...

Les gobelins vous ont vaincus ! Mais ne vous inquiétez pas, c'est juste un test.

Cela pourrait indiquer :
- Les compagnons n'utilisent pas encore optimalement leurs capacités
- Le système d'IA a besoin d'ajustements
- Les effets de combat ne fonctionnent pas comme prévu

Vous reprenez conscience dans la taverne, prêts à analyser ce qui s'est passé.`,

          metadata: {
    location: "Taverne du Test",
      mood: "contemplative",
        difficulty: "none"
  },

  choices: [
    {
      text: "Réessayer le combat",
      next: "test_combat_goblins"
    },
    {
      text: "Retourner au menu principal",
      next: "start"
    }
  ]
}
}