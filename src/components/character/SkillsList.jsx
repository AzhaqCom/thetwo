import React from 'react';
import { getModifier } from '../utils/utils';

const SKILL_TO_STAT = {
  acrobaties: "dexterite",
  arcane: "intelligence",
  athletisme: "force",
  discretion: "dexterite",
  dressage: "sagesse",
  escamotage: "dexterite",
  histoire: "intelligence",
  intimidation: "charisme",
  intuition: "sagesse",
  investigation: "intelligence",
  medecine: "sagesse",
  nature: "intelligence",
  perception: "sagesse",
  persuasion: "charisme",
  religion: "intelligence",
  representation: "charisme",
  survie: "sagesse",
  tromperie: "charisme"
};

const SkillItem = React.memo(({ skill, stat, character }) => {
  const getSkillBonus = (skillName, baseStat) => {
    const isProficient = character.proficiencies.skills.includes(skillName);
    return getModifier(character.stats[baseStat]) + (isProficient ? character.proficiencyBonus : 0);
  };

  const bonus = getSkillBonus(skill, stat);
  const isProficient = character.proficiencies.skills.includes(skill);

  return (
    <li>
      <input type="checkbox" readOnly checked={isProficient} />
      {skill.charAt(0).toUpperCase() + skill.slice(1)} ({stat.slice(0, 3).toUpperCase()}) :
      {bonus >= 0 ? `+${bonus}` : bonus}
    </li>
  );
});

export const SkillsList = ({ character }) => (
  <ul>
    {Object.entries(SKILL_TO_STAT).map(([skill, stat]) => (
      <SkillItem 
        key={skill} 
        skill={skill} 
        stat={stat} 
        character={character} 
      />
    ))}
  </ul>
);