import React from 'react';
import { getModifier } from '../components/utils/utils';
import { spells } from '../data/spells';
import { levels } from '../data/levels';
import { HeartIcon } from './Icons';
const CharacterSheet = ({ character, onUseItem }) => {
    const mod = getModifier;
    const stats = character.stats;

    const getSaveBonus = (statName) => {
        const isProficient = character.proficiencies.saves.includes(statName);
        return mod(stats[statName]) + (isProficient ? character.proficiencyBonus : 0);
    };

    const getSkillBonus = (skillName, baseStat) => {
        const isProficient = character.proficiencies.skills.includes(skillName);
        return mod(stats[baseStat]) + (isProficient ? character.proficiencyBonus : 0);
    };

    const getSpellAttackBonus = () => {
        const abilityMod = mod(stats[character.spellcasting.ability]);
        return abilityMod + character.proficiencyBonus;
    };

    const getSpellSaveDC = () => {
        return 8 + getSpellAttackBonus();
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
                <div className="stat-block">
                    <span>Vitesse: {character.speed}</span>
                </div>
            </div>
            <div className="inventory">
                <h4>Inventaire</h4>
                <ul>
                    {character.inventory.length === 0 ? (
                        <li>Ton inventaire est vide.</li>
                    ) : (
                        character.inventory.map((item) => (
                            <li key={item.id}>
                                <strong>{item.name}</strong>: {item.description}
                                <button onClick={() => onUseItem(item)}>Utiliser</button>
                            </li>
                        ))
                    )}
                </ul>
            </div>
            <div className="abilities">
                {Object.entries(stats).map(([statName, score]) => (
                    <div className="ability-score" key={statName}>
                        <h4>{statName.slice(0, 3).toUpperCase()}</h4>
                        <span>{score}</span>
                        <p>Mod: {mod(score) >= 0 ? `+${mod(score)}` : mod(score)}</p>
                        <p>Sauvegarde: {getSaveBonus(statName) >= 0 ? `+${getSaveBonus(statName)}` : getSaveBonus(statName)}</p>
                    </div>
                ))}
            </div>

            <div className="proficiencies-and-skills">
                <p>Bonus de Maîtrise: +{character.proficiencyBonus}</p>
                <p>Initiative: {mod(stats.dexterite) >= 0 ? `+${mod(stats.dexterite)}` : mod(stats.dexterite)}</p>

                <h4>Compétences</h4>
                <ul>
                    {Object.entries(skillToStat).map(([skill, stat]) => (
                        <li key={skill}>
                            <input type="checkbox" readOnly checked={character.proficiencies.skills.includes(skill)} />
                            {skill.charAt(0).toUpperCase() + skill.slice(1)} ({stat.slice(0, 3).toUpperCase()}) :
                            {getSkillBonus(skill, stat) >= 0 ? `+${getSkillBonus(skill, stat)}` : getSkillBonus(skill, stat)}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="spellcasting">
                <h4>Sorts de Magicien</h4>
                <p>Caractéristique : {character.spellcasting.ability.charAt(0).toUpperCase() + character.spellcasting.ability.slice(1)}</p>
                <p>DD de Sauvegarde : {getSpellSaveDC()}</p>
                <p>Bonus d'attaque : +{getSpellAttackBonus()}</p>

                <h5>Emplacements de sorts</h5>
                <ul>
                    {Object.entries(character.spellcasting.spellSlots).map(([level, slots]) => (
                        // On n'affiche pas le niveau 0 car il est infini
                        level !== "0" && (
                            <li key={level}>
                                Niv. {level}: {slots.used}/{slots.total}
                            </li>
                        )
                    ))}
                </ul>

                <h5>Sorts Mineurs (Cantrips)</h5>
                <ul>
                    {character.spellcasting.cantrips.map((spellName, index) => (
                        <li key={index}>
                            <strong>{spellName}</strong>: {spells[spellName]?.description}
                        </li>
                    ))}
                </ul>

                <h5>Sorts Préparés</h5>
                <ul>
                    {character.spellcasting.preparedSpells.map((spellName, index) => {
                        const spell = spells[spellName];
                        return (
                            <li key={index}>
                                <strong>{spell.name}</strong> (Niv. {spell.level}, {spell.school}): {spell.description}
                            </li>
                        );
                    })}
                </ul>
            </div>

        </div>
    );
};

export default CharacterSheet;