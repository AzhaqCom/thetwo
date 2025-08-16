 📊 RAPPORT D'ANALYSE APPROFONDIE - LOGIQUE DE COMBAT

  🎯 Synthèse Exécutive

  Après analyse complète des répertoires /utils, /stores, et /services, j'ai
  identifié 27 fonctions/méthodes liées au combat réparties dans 12 fichiers 
  différents. La logique de combat est significativement dispersée avec des
  redondances importantes.

  ---
  📁 ANALYSE /utils - Utilitaires

  ✅ BIEN PLACÉES (À CONSERVER)

  | Fichier         | Fonction                    | Raison
                             |
  |-----------------|-----------------------------|-------------------------------     
  ---------------------------|
  | calculations.js | getModifier()               | ✅ Utilitaire pur D&D,
  réutilisé partout                  |
  | calculations.js | rollDie(), rollD20()        | ✅ Utilitaires de base, mais       
  redondants avec CombatEngine |
  | calculations.js | calculateDistance()         | ✅ Utilitaire spatial pur
                              |
  | validation.js   | isValidGridPosition()       | ✅ Validation pure de grille       
                              |
  | constants.js    | COMBAT_PHASES, ENTITY_TYPES | ✅ Constantes partagées
                              |

  ❌ MAL PLACÉES (À DÉPLACER)

  | Fichier         | Fonction              | Destination    | Raison
                                    |
  |-----------------|-----------------------|----------------|--------------------     
  ----------------------------------|
  | calculations.js | doesAttackHit()       | → CombatEngine | Logique de combat       
  pure                               |
  | calculations.js | getInitiativeBonus()  | → CombatEngine | Calcul de combat        
  spécifique                          |
  | calculations.js | getAttackBonus()      | → CombatEngine | DUPLIQUÉ avec
  CombatEngine.calculateAttackBonus      |
  | calculations.js | getSaveBonus()        | → CombatEngine | DUPLIQUÉ avec
  CombatEngine.calculateSaveBonus        |
  | calculations.js | getSpellAttackBonus() | → CombatEngine | DUPLIQUÉ avec
  CombatEngine.calculateSpellAttackBonus |
  | calculations.js | rollDice()            | → CombatEngine | DUPLIQUÉ avec
  CombatEngine.rollDamage                |
  | validation.js   | validateSpellcast()   | → SpellService | Validation
  spécifique aux sorts                      |
  | validation.js   | isTargetInRange()     | → CombatEngine | Logique de combat       
  de ciblage                         |
  | validation.js   | isPositionOccupied()  | → CombatEngine | Logique de combat       
  de mouvement                       |

  ---
  📁 ANALYSE /stores - Gestion d'État

  ✅ BIEN PLACÉES (À CONSERVER)

  | Fichier           | Fonction                                      | Raison
                       |
  |-------------------|-----------------------------------------------|-----------     
  ---------------------|
  | combatStore.js    | initCombat(), playerAction()                  | ✅
  Orchestration d'état Zustand |
  | characterStore.js | takeDamagePlayer(), takeDamageCompanionById() | ✅
  Mutation d'état persistant   |
  | gameStore.js      | addCombatMessage(), clearCombatLog()          | ✅ État        
  global de l'UI          |

  ❌ MAL PLACÉES (À DÉPLACER)

  | Fichier           | Fonction                        | Destination    | Raison      
                                    |
  |-------------------|---------------------------------|----------------|--------     
  ----------------------------------|
  | characterStore.js | Calculs dans shortRest()        | → CombatEngine |
  rollDie() pour healing = logique pure    |
  | gameStore.js      | rollSkillCheck()                | → CombatEngine | Utilise     
   rollD20WithModifier = calcul pur |
  | gameStore.js      | Logique dans updateSpellSlots() | → SpellService | Logique     
   métier des sorts                 |

  ---
  📁 ANALYSE /services - Logique Métier

  ✅ BIEN PLACÉES (À CONSERVER)

  | Fichier          | Fonction                                  | Raison
                |
  |------------------|-------------------------------------------|----------------     
  --------------|
  | CombatService.js | initializeCombat(), executePlayerAction() | ✅
  Orchestration de combat    |
  | combatEngine.js  | Calculs purs existants                    | ✅ Architecture     
   correcte      |
  | EntityAI.js      | Modules d'IA par rôle                     | ✅ Logique de       
  décision        |
  | combatEffects.js | Gestion des effets de combat              | ✅ Logique
  métier spécialisée |

  ❌ REDONDANCES MAJEURES DÉTECTÉES

  | Fonction               | Fichier 1             | Fichier 2       | Impact
   |
  |------------------------|-----------------------|-----------------|------------     
  -|
  | Calcul bonus d'attaque | utils/calculations.js | combatEngine.js | 🔴 CRITIQUE     
   |
  | Calcul de sorts        | spellSystem.js        | SpellService.js | 🔴 CRITIQUE     
   |
  | Validation sorts       | utils/validation.js   | EntityAI.js     | 🟡 MOYEN        
   |
  | Dés et damage          | utils/calculations.js | combatEngine.js | 🟡 MOYEN        
   |
  | Recherche cibles       | EntityAI.js           | combatEngine.js | 🟡 MOYEN        
   |

  ⚠️ LOGIQUE FRAGMENTÉE

  | Service                           | Problème                            |
  Solution                         |
  |-----------------------------------|-------------------------------------|-----     
  -----------------------------|
  | characterManager.js               | Mélange gestion XP + calculs combat |
  Séparer : calculs → CombatEngine |
  | gameLogic.js                      | Fonction rollSkillCheck redondante  |
  Déplacer → CombatEngine          |
  | spellSystem.js vs SpellService.js | Double gestion des sorts            |
  Unifier dans SpellService        |

  ---
  🎯 PLAN DE RESTRUCTURATION RECOMMANDÉ

  Phase 1 - Élimination des Redondances Critiques

  // ❌ SUPPRIMER de utils/calculations.js
  - getAttackBonus() // Dupliqué dans CombatEngine
  - getSaveBonus() // Dupliqué dans CombatEngine
  - getSpellAttackBonus() // Dupliqué dans CombatEngine
  - rollDice() // Utiliser CombatEngine.rollDamage

  // ✅ CENTRALISER dans CombatEngine.js
  + doesAttackHit() // Depuis utils/calculations.js
  + isTargetInRange() // Depuis utils/validation.js
  + isPositionOccupied() // Depuis utils/validation.js

  Phase 2 - Unification Système de Sorts

  // ❌ SUPPRIMER spellSystem.js
  // ✅ TOUT CENTRALISER dans SpellService.js
  // ✅ EntityAI.canCastSpell() utilise SpellService

  Phase 3 - Déplacement Logique de Combat

  // ❌ DÉPLACER de stores vers CombatEngine
  - rollSkillCheck() // gameStore.js → CombatEngine
  - Calculs healing dans shortRest() // characterStore.js → CombatEngine

  // ❌ DÉPLACER de utils vers CombatEngine
  - getInitiativeBonus() // calculations.js → CombatEngine

  ---
  🚨 IMPACT SUR L'OPTIMISATION

  REDONDANCES CONFIRMÉES pour votre optimisation :
  1. ✅ Recherche de cibles : EntityAI vs CombatEngine (justifiée - niveaux
  différents)
  2. ❌ Gestion des sorts : Triple système injustifié (spellSystem + SpellService      
  + EntityAI)
  3. ❌ Calculs de distance : Redondance pure injustifiée

  NOUVELLE DÉCOUVERTE MAJEURE :
  - Quadruple système de calculs de combat : utils/calculations + CombatEngine +       
  characterManager + gameLogic
  - Impact : Code très fragile, maintenance difficile, bugs potentiels

  RECOMMANDATION : Procéder à l'optimisation + restructuration complète pour un        
  système unifié et maintenable.





  🎯 ARCHITECTURE RECOMMANDÉE POUR LES SORTS

  📊 État Actuel - Triple Système Problématique

  SpellService.js     ← Bonus d'attaque, DD sauvegarde, sorts connus
  spellSystem.js      ← Casting, validation, consommation slots
  EntityAI.js         ← Vérification rapide canCastSpell()
  characterManager.js ← Consommation slots aussi

  ✅ ARCHITECTURE CIBLE - Séparation Claire des Responsabilités

  1. SpellService.js - 🏗️ LOGIQUE MÉTIER CENTRALISÉE

  // ✅ RESPONSABILITÉ : Toute la logique métier des sorts
  class SpellService {
    // Calculs purs
    static getSpellAttackBonus(character)
    static getSpellSaveDC(character)
    static getProficiencyBonus(level)

    // Gestion des sorts
    static getKnownSpells(character)
    static canCastSpell(character, spell)
    static validateSpellcast(character, spell)
    static consumeSpellSlot(character, spellLevel)
    static castSpell(character, spell, targets, options)

    // Effets des sorts
    static processSpellEffects(spell, targets, caster)
    static applySpellDamage(target, damage, damageType)
    static applySpellHealing(target, healing)
  }

  2. CombatEngine.js - ⚙️ CALCULS PURS DE COMBAT

  // ✅ RESPONSABILITÉ : Calculs purs liés au combat de sorts
  class CombatEngine {
    // Seulement les calculs purs utilisés pendant le combat
    static rollSpellDamage(diceString)
    static calculateSpellAttackRoll(caster, spell)
    static calculateSaveResult(target, saveType, dc)
  }

  3. EntityAI.js - 🤖 DÉCISIONS TACTIQUES

  // ✅ RESPONSABILITÉ : Utiliser SpellService pour prendre des décisions
  class EntityAI {
    static canCastSpell(entity, spellName) {
      return SpellService.canCastSpell(entity, spellName) // Délégation
    }

    static getAvailableSpells(entity) {
      return SpellService.getKnownSpells(entity)
        .filter(spell => this.canCastSpell(entity, spell.name))
    }
  }

  4. CombatService.js - 🎭 ORCHESTRATION

  // ✅ RESPONSABILITÉ : Orchestrer les sorts pendant le combat
  class CombatService {
    executeSpell(caster, spell, targets) {
      // 1. Validation via SpellService
      // 2. Calculs via CombatEngine
      // 3. Application des effets via SpellService
      // 4. Mise à jour de l'état
    }
  }

  ---
  🎯 RAISONS DE CETTE ARCHITECTURE

  1. SpellService = Hub Central ✅

  - Avantage : Un seul point de vérité pour toute la logique des sorts
  - Justification : Les sorts ont une logique métier complexe (slots, validation,      
  effets)
  - Exemple : canCastSpell() doit vérifier slots, sorts connus, composants →
  logique métier

  2. CombatEngine = Calculs Purs Uniquement ⚙️

  - Avantage : Testable, prévisible, sans état
  - Justification : Le combat a besoin de calculs rapides et fiables
  - Exemple : rollSpellDamage("3d6") → calcul pur, pas de logique métier

  3. EntityAI = Interface Légère 🤖

  - Avantage : Décisions rapides sans dupliquer la logique
  - Justification : L'IA a besoin de vérifications rapides, pas de logique
  complète
  - Exemple : canCastSpell() → délègue à SpellService

  ---
  📋 PLAN D'ACTION RECOMMANDÉ

  Phase 1 - Consolidation

  1. SUPPRIMER spellSystem.js complètement
  2. MIGRER toute sa logique vers SpellService.js
  3. SIMPLIFIER EntityAI.canCastSpell() pour déléguer vers SpellService

  Phase 2 - Nettoyage

  1. DÉPLACER rollSpellDamage vers CombatEngine
  2. GARDER uniquement les calculs purs dans CombatEngine
  3. CENTRALISER toute la logique métier dans SpellService

  Phase 3 - Intégration

  1. MODIFIER CombatService.executeSpell() pour utiliser SpellService
  2. TESTER que tous les appels passent par le hub central
  3. DOCUMENTER la nouvelle architecture

  ---
  ✅ VERDICT FINAL

  La gestion des sorts doit être centralisée dans SpellService.js avec délégation      
  des calculs purs vers CombatEngine.js.

  Cette approche élimine le triple système actuel tout en respectant la séparation     
   des responsabilités :
  - SpellService = Métier
  - CombatEngine = Calculs
  - EntityAI = Décisions
  - CombatService = Orchestration