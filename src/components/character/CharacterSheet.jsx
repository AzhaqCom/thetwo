import React, { useState, useMemo } from 'react';
import { getModifier } from '../utils/utils';
import { levels } from '../../data/levels';
import { CollapsibleSection } from '../ui/CollapsibleSection';
import { StatBlock } from './StatBlock';
import { AbilityScores } from './AbilityScores';
import { SkillsList } from './SkillsList';
import { HPBar } from './HPBar';
import { XPBar } from './XPBar';

const CharacterSheet = ({ character }) => {
  const [skillsVisible, setSkillsVisible] = useState(false);

  // Memoized calculations
  const characterStats = useMemo(() => {
    const nextLevelXP = levels[character.level + 1]?.xpRequired || character.currentXP;
    const currentLevelXP = levels[character.level].xpRequired;
    const xpProgress = nextLevelXP > currentLevelXP 
      ? ((character.currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100 
      : 100;

    const spellAttackBonus = getModifier(character.stats[character.spellcasting.ability]) + character.proficiencyBonus;

    return {
      nextLevelXP,
      currentLevelXP,
      xpProgress,
      spellAttackBonus
    };
  }, [character]);

  const getSaveBonus = (statName) => {
    const isProficient = character.proficiencies.saves.includes(statName);
    return getModifier(character.stats[statName]) + (isProficient ? character.proficiencyBonus : 0);
  };

  return (
    <div className="character-sheet">
      <div className="header">
        <h3>{character.name}</h3>
        <XPBar 
          currentXP={character.currentXP}
          nextLevelXP={characterStats.nextLevelXP}
          xpProgress={characterStats.xpProgress}
        />
        <p>Niv. {character.level} {character.race} {character.class}</p>
        <p>Historique : {character.historic}</p>
      </div>

      <div className="main-stats">
        <StatBlock label="CA" value={character.ac} />
        <HPBar 
          currentHP={character.currentHP}
          maxHP={character.maxHP}
        />
      </div>

      <AbilityScores stats={character.stats} />

      <div className="proficiencies">
        <p>Bonus de Maîtrise: +{character.proficiencyBonus}</p>
        <p>Bonus d'attaque : <span className="font-semibold">+{characterStats.spellAttackBonus}</span></p>
      </div>

      <CollapsibleSection
        title="Compétences"
        isVisible={skillsVisible}
        onToggle={() => setSkillsVisible(!skillsVisible)}
      >
        <SkillsList 
          character={character}
          getSaveBonus={getSaveBonus}
        />
      </CollapsibleSection>
    </div>
  );
};

export default React.memo(CharacterSheet);