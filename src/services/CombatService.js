import { enemyTemplates } from '../data/enemies'
import { spells } from '../data/spells'
import { getModifier } from '../utils/calculations'
import { CombatEngine } from './combatEngine'
import { EntityAI_Hybrid } from './EntityAI_Hybrid'
import { SpellService } from './SpellService'
import { CombatEffects } from './combatEffects'

/**
 * Service gérant toute la logique métier du combat
 */
export class CombatService {
  /**
   * Initialise un nouveau combat
   */
  initializeCombat(playerCharacter, activeCompanions, encounterData) {
    // Créer les ennemis
    const enemies = this.createEnemiesFromEncounter(encounterData)
    
    // Créer l'ordre d'initiative
    const turnOrder = this.rollInitiative(playerCharacter, activeCompanions, enemies)
    
    // Positions initiales
    const positions = this.initializePositions(
      playerCharacter, 
      activeCompanions, 
      enemies, 
      encounterData.enemyPositions
    )
    
    return {
      enemies,
      turnOrder,
      positions,
      currentTurn: 0
    }
  }

  /**
   * Crée les ennemis à partir des données de rencontre
   */
  createEnemiesFromEncounter(encounterData) {
    if (!encounterData?.enemies?.length) {
      throw new Error('Aucun ennemi défini dans la rencontre')
    }

    return encounterData.enemies.flatMap((encounter, encounterIndex) => {
      const template = enemyTemplates[encounter.type]
      
      if (!template) {
        console.error(`Template non trouvé pour: ${encounter.type}`)
        return []
      }

      return Array(encounter.count)
        .fill(null)
        .map((_, index) => ({
          ...template,
          id: `${encounter.type}_${encounterIndex}_${index}`,
          name: encounter.count > 1 ? `${template.name} ${index + 1}` : template.name,
          type: 'enemy',
          currentHP: template.currentHP ?? template.maxHP ?? 10,
          maxHP: template.maxHP ?? 10,
          ac: template.ac ?? 10,
          stats: { ...template.stats },
          attacks: [...(template.attacks || [])],
          image: template.image || '',
          isAlive: true
        }))
    })
  }

  /**
   * Lance l'initiative pour tous les combattants
   */
  rollInitiative(playerCharacter, activeCompanions, enemies) {
    const combatants = []

    // Vérification de sécurité
    if (!playerCharacter || !playerCharacter.stats) {
      console.error('CombatService: playerCharacter ou playerCharacter.stats manquant')
      throw new Error('Personnage joueur requis pour initialiser le combat')
    }

    // Joueur
    const playerInit = this.rollD20() + CombatEngine.getInitiativeBonus(playerCharacter)
    combatants.push({
      ...playerCharacter,
      id: 'player',
      type: 'player',
      initiative: playerInit,
      isAlive: true
    })

    // Compagnons actifs
    if (activeCompanions && activeCompanions.length > 0) {
      activeCompanions.forEach(companion => {
        const companionInit = this.rollD20() + CombatEngine.getInitiativeBonus(companion)
        combatants.push({
          ...companion,
          id: companion.id || companion.name.toLowerCase(),
          type: 'companion',
          initiative: companionInit,
          isAlive: true
        })
      })
    }

    // Ennemis
    enemies.forEach(enemy => {
      const enemyInit = this.rollD20() + CombatEngine.getInitiativeBonus(enemy)
      combatants.push({
        ...enemy,
        initiative: enemyInit
      })
    })

    // Trier par initiative (plus haute en premier, joueur gagne les égalités)
    return combatants.sort((a, b) => {
      if (b.initiative === a.initiative) {
        // Priorité: player > companion > enemy
        if (a.type === 'player') return -1
        if (b.type === 'player') return 1
        if (a.type === 'companion') return -1
        if (b.type === 'companion') return 1
        return 0
      }
      return b.initiative - a.initiative
    })
  }

  /**
   * Initialise les positions de combat
   */
  initializePositions(playerCharacter, activeCompanions, enemies, customPositions = null) {
    const positions = {
      // Positions par défaut du joueur
      player: { x: 1, y: 2 },
      
      // État de mouvement
      playerHasMoved: false
    }

    // Ajouter les positions des compagnons actifs
    if (activeCompanions && activeCompanions.length > 0) {
      activeCompanions.forEach((companion, index) => {
        const companionId = companion.id || companion.name.toLowerCase()
        positions[companionId] = { x: 0, y: index + 1 }
        positions[`${companionId}HasMoved`] = false
      })
    }

    // Positions des ennemis
    if (customPositions) {
      // Utiliser les positions personnalisées
      enemies.forEach((enemy, index) => {
        const customPos = customPositions[index]
        if (customPos) {
          positions[enemy.id] = { x: customPos.x, y: customPos.y }
        } else {
          // Position par défaut si pas de position custom
          positions[enemy.id] = this.getDefaultEnemyPosition(index, enemies.length)
        }
      })
    } else {
      // Positions par défaut
      enemies.forEach((enemy, index) => {
        positions[enemy.id] = this.getDefaultEnemyPosition(index, enemies.length)
      })
    }

    return positions
  }

  /**
   * Calcule une position par défaut pour un ennemi
   */
  getDefaultEnemyPosition(index, totalEnemies) {
    const cols = 8
    const rows = 6
    
    // Placer les ennemis du côté droit
    const startX = Math.floor(cols * 0.6)
    const availableWidth = cols - startX
    
    if (totalEnemies === 1) {
      return { x: startX + Math.floor(availableWidth / 2), y: Math.floor(rows / 2) }
    }
    
    // Répartir sur plusieurs lignes si nécessaire
    const enemiesPerRow = Math.min(availableWidth, totalEnemies)
    const row = Math.floor(index / enemiesPerRow)
    const col = index % enemiesPerRow
    
    return {
      x: startX + col,
      y: Math.max(1, Math.min(rows - 2, row + 1))
    }
  }

  /**
   * Exécute une action du joueur
   */
  executePlayerAction(playerCharacter, action, targets, enemies, positions) {
    const messages = []
    const results = {
      damage: [],
      effects: [],
      messages
    }

    if (!action || !targets.length) {
      messages.push({ text: "Aucune action ou cible sélectionnée", type: 'error' })
      return results
    }

    switch (action.type) {
      case 'attack':
        return this.executeAttack(playerCharacter, action, targets, results)
      
      case 'spell':
        return this.executeSpell(playerCharacter, action, targets, results)
      
      default:
        messages.push({ text: `Type d'action inconnu: ${action.type}`, type: 'error' })
        return results
    }
  }

  /**
   * Exécute une attaque
   */
  executeAttack(attacker, weapon, targets, results) {
    targets.forEach(target => {
      // Jet d'attaque
      const attackRoll = this.rollD20()
      const attackBonus = this.getAttackBonus(attacker, weapon)
      const totalAttack = attackRoll + attackBonus
      
      const criticalHit = attackRoll === 20
      const hit = totalAttack >= target.ac || criticalHit
      
      if (hit) {
        // Dégâts
        let damage = this.rollDamage(weapon.damage)
        if (criticalHit) {
          damage *= 2
          results.messages.push({
            text: `💥 Coup critique ! ${attacker.name} inflige ${damage} dégâts à ${target.name} !`,
            type: 'critical'
          })
        } else {
          results.messages.push({
            text: `⚔️ ${attacker.name} touche ${target.name} et inflige ${damage} dégâts`,
            type: 'hit'
          })
        }
        
        results.damage.push({ targetId: target.id, damage })
      } else {
        results.messages.push({
          text: `❌ ${attacker.name} manque ${target.name} (${totalAttack} vs CA ${target.ac})`,
          type: 'miss'
        })
      }
    })
    
    return results
  }

  /**
   * Exécute un sort
   */
  executeSpell(caster, spell, targets, results) {
    // Gestion spéciale pour les sorts de zone
    if (spell.isAreaEffect && targets.length > 1) {
      results.messages.push({
        text: `🔮💥 ${caster.name} lance ${spell.name} (zone d'effet sur ${targets.length} cibles)`,
        type: 'spell'
      })
      
      // Pour les sorts de zone, calculer les dégâts une fois et les appliquer à tous
      let baseDamage = 0
      if (spell.damage) {
        baseDamage = this.rollDamage(spell.damage.dice) + (spell.damage.bonus || 0)
      }
      
      targets.forEach(target => {
        let finalDamage = baseDamage
        
        // Jets de sauvegarde pour AoE (si applicable)
        if (spell.saveType) {
          const saveRoll = this.rollD20()
          const saveBonus = this.getSaveBonus(target, spell.saveType)
          const saveDC = spell.saveDC || (8 + this.getSpellAttackBonus(caster))
          
          if (saveRoll + saveBonus >= saveDC) {
            finalDamage = Math.floor(finalDamage / 2) // Demi-dégâts en cas de réussite
            results.messages.push({
              text: `🛡️ ${target.name} résiste partiellement (${finalDamage} dégâts)`,
              type: 'save-success'
            })
          } else {
            results.messages.push({
              text: `💥 ${target.name} subit les pleins effets (${finalDamage} dégâts)`,
              type: 'save-fail'
            })
            
            // Appliquer les effets supplémentaires si échec de sauvegarde
            if (spell.effect) {
              const effect = CombatEffects.applyEffect(target, spell.effect, 3, caster.name)
              results.effects.push({
                type: spell.effect,
                targetId: target.id || target.name,
                source: caster.name,
                duration: 3,
                effectId: effect?.id
              })
            }
          }
        } else if (spell.effect) {
          // Effet automatique sans sauvegarde
          const effect = CombatEffects.applyEffect(target, spell.effect, 3, caster.name)
          results.effects.push({
            type: spell.effect,
            targetId: target.id || target.name,
            source: caster.name,
            duration: 3,
            effectId: effect?.id
          })
        }
        
        if (finalDamage > 0) {
          results.damage.push({ targetId: target.id || target.name, damage: finalDamage })
        }
      })
    } else {
      // Gestion normale pour sorts à cible unique ou multiple sans AoE
      results.messages.push({
        text: `🔮 ${caster.name} lance ${spell.name}`,
        type: 'spell'
      })
      
      // Traiter chaque cible individuellement
      targets.forEach(target => {
        if (spell.requiresAttackRoll) {
          // Sorts nécessitant un jet d'attaque (comme Rayon de givre)
          const attackRoll = this.rollD20()
          const spellAttackBonus = this.getSpellAttackBonus(caster)
          const totalAttack = attackRoll + spellAttackBonus
          
          const criticalHit = attackRoll === 20
          const hit = totalAttack >= target.ac || criticalHit
          
          if (hit) {
            let damage = 0
            if (spell.damage) {
              damage = this.rollDamage(spell.damage.dice) + (spell.damage.bonus || 0)
              if (criticalHit) damage *= 2
            }
            
            results.messages.push({
              text: `⚔️ ${spell.name} touche ${target.name} et inflige ${damage} dégâts`,
              type: criticalHit ? 'critical' : 'hit'
            })
            
            results.damage.push({ targetId: target.id || target.name, damage })
          } else {
            results.messages.push({
              text: `❌ ${spell.name} manque ${target.name} (${totalAttack} vs CA ${target.ac})`,
              type: 'miss'
            })
          }
        } else {
          // Sorts à touche automatique (comme Projectile Magique)
          let damage = 0
          if (spell.damage) {
            damage = this.rollDamage(spell.damage.dice) + (spell.damage.bonus || 0)
          }
          
          results.messages.push({
            text: `💥 ${spell.name} touche automatiquement ${target.name} et inflige ${damage} dégâts`,
            type: 'spell-hit'
          })
          
          results.damage.push({ targetId: target.id || target.name, damage })
        }
      })
    }
    
    return results
  }

  /**
   * Calcule le bonus d'attaque (délègue au CombatEngine)
   */
  getAttackBonus(character, weapon) {
    return CombatEngine.calculateAttackBonus(character, weapon)
  }

  /**
   * Calcule le bonus d'attaque de sort (délègue au CombatEngine)
   */
  getSpellAttackBonus(caster) {
    return CombatEngine.calculateSpellAttackBonus(caster)
  }

  /**
   * Calcule le bonus de sauvegarde (délègue au CombatEngine)
   */
  getSaveBonus(creature, saveType) {
    return CombatEngine.calculateSaveBonus(creature, saveType)
  }

  /**
   * Lance les dégâts d'une arme (délègue au CombatEngine)
   */
  rollDamage(damageString) {
    return CombatEngine.rollDamage(damageString)
  }

  /**
   * Lance un dé à 20 faces (délègue au CombatEngine)
   */
  rollD20() {
    return CombatEngine.rollD20()
  }

  /**
   * Vérifie si un combattant est vaincu (délègue au CombatEngine)
   */
  isDefeated(character) {
    return CombatEngine.isDefeated(character)
  }

  /**
   * Vérifie les conditions de victoire/défaite
   */
  checkCombatEnd(playerCharacter, activeCompanions, enemies) {
    const playerDefeated = this.isDefeated(playerCharacter)
    const allCompanionsDefeated = activeCompanions.length === 0 || activeCompanions.every(companion => this.isDefeated(companion))
    const allEnemiesDefeated = enemies.every(enemy => this.isDefeated(enemy))
    
    if (playerDefeated && allCompanionsDefeated) {
      return 'defeat'
    }
    
    if (allEnemiesDefeated) {
      return 'victory'
    }
    
    return null
  }

  /**
   * Exécute une attaque d'entité (ennemi ou compagnon)
   */
  executeEntityAttack(attacker, attack, target, addCombatMessage) {
    // Validation des paramètres
    if (!attacker || !attack || !target) {
      console.error('❌ Paramètres manquants pour executeEntityAttack')
      return { success: false, damage: 0 }
    }

    // Vérifier que la cible est vivante
    if (target.character && target.character.currentHP <= 0) {
      console.warn(`⚠️ ${attacker.name} tente d'attaquer ${target.name} qui est déjà mort`)
      addCombatMessage(`${attacker.name} réalise que ${target.name} est déjà tombé au combat.`)
      return { success: false, damage: 0 }
    }

    // Jet d'attaque
    const attackRoll = this.rollD20()
    const attackBonus = this.getAttackBonus(attacker, attack)
    
    if (isNaN(attackBonus)) {
      console.error('❌ Attack bonus est NaN pour:', attacker, attack)
      return { success: false, damage: 0 }
    }
    
    const totalAttack = attackRoll + attackBonus
    const criticalHit = attackRoll === 20
    const targetAC = target.character ? target.character.ac : (target.ac || 10)
    
    if (isNaN(targetAC)) {
      console.error('❌ Target AC est NaN pour:', target)
      return { success: false, damage: 0 }
    }
    
    const hit = totalAttack >= targetAC || criticalHit
    
    if (hit) {
      // Calculer les dégâts
      let damage = 0
      if (attack.damageDice) {
        damage = this.rollDamage(attack.damageDice) + (attack.damageBonus || 0)
      } else if (attack.damage) {
        damage = this.rollDamage(attack.damage)
      } else {
        damage = 1 // Fallback
      }
      
      if (criticalHit) {
        damage *= 2
        addCombatMessage(
          `💥 Coup critique ! ${attacker.name} utilise ${attack.name} et inflige ${damage} dégâts à ${target.name} !`,
          'critical'
        )
      } else {
        addCombatMessage(
          `⚔️ ${attacker.name} utilise ${attack.name} et inflige ${damage} dégâts à ${target.name}`,
          attacker.type === 'enemy' ? 'enemy-hit' : 'companion-hit'
        )
      }
      
      return { success: true, damage, critical: criticalHit }
    } else {
      addCombatMessage(
        `❌ ${attacker.name} manque ${target.name} avec ${attack.name} (${totalAttack} vs CA ${targetAC})`,
        'miss'
      )
      return { success: false, damage: 0 }
    }
  }

  /**
   * Valide et exécute un mouvement d'entité
   */
  executeEntityMovement(entity, currentPos, targetPos, combatState, addCombatMessage) {
    // Valider le mouvement
    const isValid = CombatEngine.validateMovement(entity, currentPos, targetPos, combatState)
    
    if (!isValid) {
      console.warn(`❌ Mouvement invalide pour ${entity.name}`)
      addCombatMessage(`${entity.name} ne peut pas se déplacer à cette position.`)
      return false
    }
    
    return true
  }

  /**
   * NOUVELLE MÉTHODE : Exécute le tour d'un compagnon avec la nouvelle IA
   */
  executeCompanionAction(companionId, companion, gameState) {
    const results = {
      messages: [],
      damage: [],
      healing: [],
      effects: [],
      success: false
    }

    try {
      // 1. Obtenir la meilleure action via l'IA unifiée
      const bestAction = EntityAI_Hybrid.getBestAction(companion, gameState)
      
      if (!bestAction) {
        results.messages.push({
          text: `${companion.name} ne trouve aucune action à effectuer`,
          type: 'info'
        })
        return results
      }

      // 2. Calculer le mouvement optimal
      const currentPosition = gameState.combatPositions[companionId]
      const optimalPosition = CombatEngine.calculateOptimalMovement(
        companion, 
        currentPosition, 
        gameState
      )

      // 3. Exécuter l'action selon son type
      switch (bestAction.type) {
        case 'attack':
          return this.executeCompanionAttack(companion, bestAction, gameState, results)
          
        case 'spell':
          return this.executeCompanionSpell(companion, bestAction, gameState, results)
          
        case 'heal_support':
          return this.executeCompanionHeal(companion, bestAction, gameState, results)
          
        case 'protect':
        case 'taunt':
          return this.executeCompanionSupport(companion, bestAction, gameState, results)
          
        default:
          results.messages.push({
            text: `Action inconnue: ${bestAction.type}`,
            type: 'error'
          })
          return results
      }
    } catch (error) {
      console.error('Erreur lors de l\'exécution de l\'action du compagnon:', error)
      results.messages.push({
        text: `Erreur lors de l'action de ${companion.name}`,
        type: 'error'
      })
      return results
    }
  }

  /**
   * Exécute une attaque de compagnon (physique ou ranged)
   */
  executeCompanionAttack(companion, action, gameState, results) {
    const attack = action.attack || companion.attacks[0]
    const target = action.target

    if (!attack || !target) {
      results.messages.push({
        text: `${companion.name} ne peut pas attaquer`,
        type: 'error'
      })
      return results
    }

    // Jet d'attaque
    const attackRoll = this.rollD20()
    const attackBonus = this.getAttackBonus(companion, attack)
    const totalAttack = attackRoll + attackBonus
    
    const criticalHit = attackRoll === 20
    const hit = totalAttack >= target.ac || criticalHit
    
    if (hit) {
      let damage = CombatEngine.calculateDamage(attack).damage
      if (criticalHit) damage *= 2
      
      const attackTypeIcon = attack.type === 'ranged' ? '🏹' : '⚔️'
      const criticalText = criticalHit ? ' (CRITIQUE!)' : ''
      
      results.messages.push({
        text: `${attackTypeIcon} ${companion.name} utilise ${attack.name} sur ${target.name} (${damage} dégâts)${criticalText}`,
        type: criticalHit ? 'critical' : 'success'
      })
      
      results.damage.push({ 
        targetId: target.name, 
        damage,
        source: companion.name,
        attackType: attack.type 
      })
      results.success = true
    } else {
      results.messages.push({
        text: `💨 ${companion.name} rate son attaque sur ${target.name}`,
        type: 'miss'
      })
    }
    
    return results
  }

  /**
   * Exécute un sort de compagnon
   */
  executeCompanionSpell(companion, action, gameState, results) {
    const spellName = action.spell
    const target = action.target
    
    // Vérifier si le sort peut être lancé
    if (!SpellService.canCastSpell(companion, spells[spellName])) {
      results.messages.push({
        text: `${companion.name} ne peut pas lancer ${spellName}`,
        type: 'error'
      })
      return results
    }

    // Exécuter selon le type de sort
    switch (spellName) {
      case 'Soins':
        if (target && target.id) {
          const healAmount = this.rollD8() + 4 // Sort de soin de base
          results.healing.push({
            targetId: target.id,
            amount: healAmount,
            source: companion.name
          })
          results.messages.push({
            text: `✨ ${companion.name} soigne ${target.name} (+${healAmount} PV)`,
            type: 'healing'
          })
        }
        break
        
      case 'Trait de feu':
        if (target) {
          const damage = this.rollD10() + getModifier(companion.stats.charisme)
          results.damage.push({
            targetId: target.name,
            damage,
            source: companion.name,
            damageType: 'feu'
          })
          results.messages.push({
            text: `🔥 ${companion.name} lance un trait de feu sur ${target.name} (${damage} dégâts de feu)`,
            type: 'spell'
          })
        }
        break
        
      case 'Boule de Feu':
        if (Array.isArray(target)) {
          // Sort de zone - appliquer à tous les ennemis du groupe
          target.forEach(enemy => {
            const damage = this.rollD6() * 6 + getModifier(companion.stats.charisme) // 6d6
            results.damage.push({
              targetId: enemy.name,
              damage,
              source: companion.name,
              damageType: 'feu'
            })
          })
          results.messages.push({
            text: `🔥💥 ${companion.name} lance une boule de feu sur ${target.length} ennemis`,
            type: 'spell'
          })
        }
        break
        
      case 'Toile d\'araignée':
        if (Array.isArray(target)) {
          // Sort de contrôle de zone - appliquer l'effet "restrained"
          target.forEach(enemy => {
            const effect = CombatEffects.applyEffect(enemy, 'restrained', 3, companion.name)
            results.effects.push({
              type: 'restrained',
              targetId: enemy.name,
              source: companion.name,
              duration: 3,
              effectId: effect?.id
            })
          })
          results.messages.push({
            text: `🕸️ ${companion.name} entoile ${target.length} ennemis (entravés pour 3 tours)`,
            type: 'spell'
          })
        }
        break
        
      case 'Détection de la magie':
        results.messages.push({
          text: `🔍 ${companion.name} détecte les auras magiques environnantes`,
          type: 'spell'
        })
        results.effects.push({
          type: 'detection',
          source: companion.name,
          duration: 10
        })
        break
        
      default:
        results.messages.push({
          text: `✨ ${companion.name} lance ${spellName}`,
          type: 'spell'
        })
    }
    
    // Consommer le slot de sort
    this.consumeSpellSlot(companion, spellName)
    results.success = true
    return results
  }

  /**
   * Exécute une action de soin/support
   */
  executeCompanionHeal(companion, action, gameState, results) {
    const target = action.target
    
    if (!target) {
      results.messages.push({
        text: `${companion.name} ne trouve personne à soigner`,
        type: 'info'
      })
      return results
    }

    // Soin via inventions (pour Finn)
    const healAmount = this.rollD6() + 2
    results.healing.push({
      targetId: target.id,
      amount: healAmount,
      source: companion.name
    })
    
    results.messages.push({
      text: `🔧 ${companion.name} soigne ${target.name} avec ses inventions (+${healAmount} PV)`,
      type: 'healing'
    })
    
    results.success = true
    return results
  }

  /**
   * Exécute une action de support tactique
   */
  executeCompanionSupport(companion, action, gameState, results) {
    switch (action.type) {
      case 'protect':
        results.messages.push({
          text: `🛡️ ${companion.name} protège ${action.target.name}`,
          type: 'support'
        })
        results.effects.push({
          type: 'protection',
          targetId: action.target.id,
          source: companion.name,
          duration: 1
        })
        break
        
      case 'taunt':
        results.messages.push({
          text: `💢 ${companion.name} attire l'attention des ennemis`,
          type: 'support'
        })
        results.effects.push({
          type: 'taunt',
          source: companion.name,
          targets: action.targets.map(t => t.name),
          duration: 1
        })
        break
    }
    
    results.success = true
    return results
  }

  /**
   * Utilitaires pour les dés (délègue au CombatEngine)
   */
  rollD6() { return CombatEngine.rollD6() }
  rollD8() { return CombatEngine.rollD8() }
  rollD10() { return CombatEngine.rollD10() }

  /**
   * Trouve la meilleure cible pour une entité (logique d'orchestration)
   */
  findBestTarget(attacker, attackerPos, combatState) {
    return CombatEngine.findBestTarget(attacker, attackerPos, combatState)
  }

  /**
   * Consomme un slot de sort
   */
  consumeSpellSlot(companion, spellName) {
    // TODO: Implémenter la consommation de slots
    // Pour l'instant, on log juste
    console.log(`${companion.name} a utilisé un slot pour ${spellName}`)
  }
}