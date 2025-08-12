import React, { useMemo } from 'react'
import { useCharacterStore, characterSelectors } from '../../../stores'
import { CharacterManager } from '../../../services/characterManager'
import { getModifier } from '../../../utils/calculations'
import {
  Card,
  CardHeader,
  CardBody,
  CollapsibleSection,
  ResourceBars,
  HealthBar
} from '../../ui'

import { StatBlock } from './StatBlock'
import { AbilityScores } from './AbilityScores'
import { SkillsList } from './SkillsList'
import { XPBar } from './XPBar'

/**
 * Fiche de personnage modernisée avec stores Zustand
 */
export const CharacterSheet = ({ 
  characterType = 'player', // 'player' ou 'companion'
  compact = false,
  showControls = false 
}) => {
  const character = useCharacterStore(
    characterType === 'player' 
      ? characterSelectors.getPlayerCharacter
      : characterSelectors.getPlayerCompanion
  )

  // Calculs memoïsés du personnage
  const characterStats = useMemo(() => {
    if (!character) return null

    const xpToNext = CharacterManager.getXPToNextLevel(character.level)
    const xpProgress = xpToNext > 0 ? (character.experience / xpToNext) * 100 : 100

    // Bonus d'attaque de sorts
    const spellAttackBonus = character.spellcasting
      ? CharacterManager.getAttackBonus(character, { actionType: 'spell' })
      : null

    // Bonus d'attaque d'armes (utilise la stat primaire)
    const primaryStat = character.class === 'Roublard' ? 'dexterite' : 'force'
    const weaponAttackBonus = getModifier(character.stats[primaryStat]) + 
      CharacterManager.getProficiencyBonus(character.level)

    // DD des sorts
    const spellSaveDC = character.spellcasting 
      ? CharacterManager.getSpellSaveDC(character)
      : null

    return {
      xpToNext,
      xpProgress,
      spellAttackBonus,
      weaponAttackBonus,
      spellSaveDC,
      proficiencyBonus: CharacterManager.getProficiencyBonus(character.level)
    }
  }, [character])

  if (!character) {
    return (
      <Card className="character-sheet character-sheet--empty">
        <CardBody>
          <p>Aucun {characterType === 'player' ? 'personnage' : 'compagnon'}</p>
        </CardBody>
      </Card>
    )
  }

  const containerClass = [
    'character-sheet',
    compact && 'character-sheet--compact',
    `character-sheet--${characterType}`
  ].filter(Boolean).join(' ')

  return (
    <Card className={containerClass}>
      <CardHeader>
        <div className="character-sheet__header">
          <div className="character-sheet__identity">
            <h3 className="character-sheet__name">{character.name}</h3>
            <p className="character-sheet__details">
              Niv. {character.level} {character.race} {character.class}
            </p>
            {character.historic && (
              <p className="character-sheet__background">{character.historic}</p>
            )}
          </div>
          
          {!compact && (
            <XPBar
              currentXP={character.experience || 0}
              nextLevelXP={characterStats.xpToNext}
              progress={characterStats.xpProgress}
              level={character.level}
            />
          )}
        </div>
      </CardHeader>

      <CardBody>
        {/* Stats principales */}
        <div className="character-sheet__main-stats">
          <div className="character-sheet__combat-stats">
            <StatBlock 
              label="CA" 
              value={character.ac} 
              tooltip="Classe d'Armure"
            />
            <StatBlock 
              label="Initiative" 
              value={`+${getModifier(character.stats.dexterite)}`}
              tooltip="Modificateur d'initiative"
            />
          </div>
          
          {/* Barre de vie */}
          <HealthBar
            current={character.currentHP}
            max={character.maxHP}
            label={compact ? null : "❤️ Points de vie"}
            size={compact ? 'small' : 'medium'}
            showNumbers={true}
          />
        </div>

        {/* Caractéristiques */}
        <CollapsibleSection
          id={`${characterType}-abilities`}
          title="Caractéristiques"
          defaultExpanded={!compact}
        >
          <AbilityScores 
            stats={character.stats}
            saves={character.proficiencies?.saves || []}
            proficiencyBonus={characterStats.proficiencyBonus}
            compact={compact}
          />
        </CollapsibleSection>

        {/* Bonus de maîtrise et attaques */}
        <CollapsibleSection
          id={`${characterType}-combat`}
          title="Combat"
          defaultExpanded={!compact}
        >
          <div className="character-sheet__combat-info">
            <div className="character-sheet__proficiency">
              <StatBlock
                label="Bonus de Maîtrise"
                value={`+${characterStats.proficiencyBonus}`}
              />
            </div>

            <div className="character-sheet__attack-bonuses">
              {characterStats.spellAttackBonus !== null && (
                <StatBlock
                  label="Att. Sorts"
                  value={`+${characterStats.spellAttackBonus}`}
                  tooltip="Bonus d'attaque des sorts"
                />
              )}
              <StatBlock
                label="Att. Armes"
                value={`+${characterStats.weaponAttackBonus}`}
                tooltip="Bonus d'attaque des armes"
              />
            </div>

            {characterStats.spellSaveDC && (
              <StatBlock
                label="DD des sorts"
                value={characterStats.spellSaveDC}
                tooltip="Difficulté des jets de sauvegarde contre vos sorts"
              />
            )}
          </div>
        </CollapsibleSection>

        {/* Compétences */}
        <CollapsibleSection
          id={`${characterType}-skills`}
          title="Compétences"
          defaultExpanded={false}
        >
          <SkillsList
            character={character}
            proficiencyBonus={characterStats.proficiencyBonus}
            compact={compact}
          />
        </CollapsibleSection>

        {/* Ressources (HP, sorts, dés de vie) */}
        {!compact && (
          <CollapsibleSection
            id={`${characterType}-resources`}
            title="Ressources"
            defaultExpanded={true}
          >
            <ResourceBars
              character={character}
              layout="vertical"
            />
          </CollapsibleSection>
        )}
      </CardBody>
    </Card>
  )
}

/**
 * Version compacte pour les interfaces restreintes
 */
export const CompactCharacterSheet = ({ characterType = 'player' }) => (
  <CharacterSheet characterType={characterType} compact={true} />
)

/**
 * Fiche de personnage avec contrôles
 */
export const InteractiveCharacterSheet = ({ 
  characterType = 'player',
  onLevelUp,
  onRest,
  onEditCharacter 
}) => {
  const character = useCharacterStore(
    characterType === 'player' 
      ? characterSelectors.getPlayerCharacter
      : characterSelectors.getPlayerCompanion
  )
  
  const canLevelUp = useCharacterStore(characterSelectors.canLevelUp)

  if (!character) return <CharacterSheet characterType={characterType} />

  return (
    <div className="interactive-character-sheet">
      <CharacterSheet characterType={characterType} showControls={true} />
      
      {/* Contrôles additionnels */}
      <div className="character-sheet__controls">
        {canLevelUp && (
          <button
            className="btn btn--success"
            onClick={() => onLevelUp?.(character)}
          >
            🎯 Monter de niveau !
          </button>
        )}
        
        <button
          className="btn btn--secondary"
          onClick={() => onRest?.(character)}
        >
          😴 Se reposer
        </button>
        
        {onEditCharacter && (
          <button
            className="btn btn--ghost"
            onClick={() => onEditCharacter(character)}
          >
            ✏️ Modifier
          </button>
        )}
      </div>
    </div>
  )
}

export default CharacterSheet