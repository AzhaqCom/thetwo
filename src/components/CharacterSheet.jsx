// dans components/CharacterSheet.js

import React, { useState } from 'react'; // <-- Importez useState
import { getModifier } from '../components/utils/utils';
import { levels } from '../data/levels';
import { HeartIcon } from './Icons'; // Assurez-vous que le chemin est correct

const CharacterSheet = ({ character }) => {
    // onUseItem et onCastSpell ne sont plus nécessaires ici
    const mod = getModifier;
    const stats = character.stats;

    // Définissez l'état pour la visibilité des compétences
    const [skillsVisible, setSkillsVisible] = useState(false);

    // Fonction pour basculer la visibilité
    const toggleSkills = () => {
        setSkillsVisible(!skillsVisible);
    };

    const getSaveBonus = (statName) => {
        const isProficient = character.proficiencies.saves.includes(statName);
        return mod(stats[statName]) + (isProficient ? character.proficiencyBonus : 0);
    };

    const getSkillBonus = (skillName, baseStat) => {
        const isProficient = character.proficiencies.skills.includes(skillName);
        return mod(stats[baseStat]) + (isProficient ? character.proficiencyBonus : 0);
    };
    const getSpellAttackBonus = () => {
        const abilityMod = mod(character.stats[character.spellcasting.ability]);
        return abilityMod + character.proficiencyBonus;
    };
    const nextLevelXP = levels[character.level + 1]?.xpRequired || character.currentXP;
    const currentLevelXP = levels[character.level].xpRequired;
    const xpProgress = nextLevelXP > currentLevelXP ? ((character.currentXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100 : 100;

    const skillToStat = {
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

    return (
        <div className="character-sheet">
            <div className="header">
                <h3>{character.name}</h3>
                <div className="xp-bar">
                    <h4>Expérience</h4>
                    <div className="stat-block xp-bar-container">
                        <div className="xp-text">
                            <span>✨ XP: {character.currentXP}/{nextLevelXP}</span>
                        </div>
                        <div className="xp-bar-background">
                            <div
                                className="xp-bar-fill"
                                style={{
                                    width: `${xpProgress}%`,
                                }}
                            />
                        </div>
                    </div>
                </div>
                <p>Niv. {character.level} {character.race} {character.class}</p>
                <p>Historique : {character.historic}</p>
            </div>

            <div className="main-stats">
                <div className="stat-block">
                    <span>CA: {character.ac}</span>
                </div>
                <div className="stat-block hp-bar-container">
                    <div className="hp-text">
                        <span>❤️ PV: {character.currentHP}/{character.maxHP}</span>
                    </div>
                    <div className="hp-bar-background">
                        <div
                            className="hp-bar-fill"
                            style={{
                                width: `${character.maxHP > 0 ? Math.max(0, (character.currentHP / character.maxHP) * 100) : 0}%`,
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="abilities">
                {Object.entries(stats).map(([statName, score]) => (
                    <div className="ability-score" key={statName}>
                        <h4>{statName.slice(0, 3).toUpperCase()}</h4>
                        <span>{score}</span>
                        <p>Mod: {mod(score) >= 0 ? `+${mod(score)}` : mod(score)}</p>
                    </div>
                ))}
                <div className="proficiencies">
                    <p>Bonus de Maîtrise: +{character.proficiencyBonus}</p>
                    <p>Bonus d'attaque : <span className="font-semibold">+{getSpellAttackBonus()}</span></p>
                </div>
            </div>


            <div className="skills">
                <h4 onClick={toggleSkills} style={{ cursor: 'pointer' }}>
                    Compétences {skillsVisible ? '▼' : '►'} {/* Ajout d'un indicateur visuel */}
                </h4>
                {skillsVisible && ( // <-- La liste n'est rendue que si skillsVisible est true
                    <ul>
                        {Object.entries(skillToStat).map(([skill, stat]) => (
                            <li key={skill}>
                                <input type="checkbox" readOnly checked={character.proficiencies.skills.includes(skill)} />
                                {skill.charAt(0).toUpperCase() + skill.slice(1)} ({stat.slice(0, 3).toUpperCase()}) :
                                {getSkillBonus(skill, stat) >= 0 ? `+${getSkillBonus(skill, stat)}` : getSkillBonus(skill, stat)}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default CharacterSheet;