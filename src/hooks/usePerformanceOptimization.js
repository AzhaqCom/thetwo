import { useMemo, useCallback, useRef } from 'react';

/**
 * Performance optimization hook
 * Provides caching and memoization utilities
 */
export const usePerformanceOptimization = () => {
    const cache = useRef(new Map());
    const computationCache = useRef(new Map());

    // Memoized calculation cache
    const memoizedCalculation = useCallback((key, calculationFn, dependencies = []) => {
        const cacheKey = `${key}-${JSON.stringify(dependencies)}`;
        
        if (computationCache.current.has(cacheKey)) {
            return computationCache.current.get(cacheKey);
        }

        const result = calculationFn();
        computationCache.current.set(cacheKey, result);
        
        // Clean cache if it gets too large
        if (computationCache.current.size > 100) {
            const firstKey = computationCache.current.keys().next().value;
            computationCache.current.delete(firstKey);
        }

        return result;
    }, []);

    // Clear cache when needed
    const clearCache = useCallback((pattern = null) => {
        if (pattern) {
            for (const key of cache.current.keys()) {
                if (key.includes(pattern)) {
                    cache.current.delete(key);
                }
            }
            for (const key of computationCache.current.keys()) {
                if (key.includes(pattern)) {
                    computationCache.current.delete(key);
                }
            }
        } else {
            cache.current.clear();
            computationCache.current.clear();
        }
    }, []);

    // Debounced function creator
    const createDebouncedFunction = useCallback((fn, delay = 300) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn(...args), delay);
        };
    }, []);

    return {
        memoizedCalculation,
        clearCache,
        createDebouncedFunction
    };
};

/**
 * Character calculations cache hook
 */
export const useCharacterCalculations = (character) => {
    const { memoizedCalculation } = usePerformanceOptimization();

    const calculations = useMemo(() => {
        if (!character) return {};

        return {
            // Attack bonuses
            meleeAttackBonus: memoizedCalculation(
                'meleeAttack',
                () => {
                    const stat = character.class === 'Roublard' ? 'dexterite' : 'force';
                    return Math.floor((character.stats[stat] - 10) / 2) + character.proficiencyBonus;
                },
                [character.stats, character.proficiencyBonus, character.class]
            ),

            rangedAttackBonus: memoizedCalculation(
                'rangedAttack',
                () => Math.floor((character.stats.dexterite - 10) / 2) + character.proficiencyBonus,
                [character.stats.dexterite, character.proficiencyBonus]
            ),

            spellAttackBonus: memoizedCalculation(
                'spellAttack',
                () => {
                    if (!character.spellcasting) return 0;
                    const ability = character.spellcasting.ability || 'intelligence';
                    return Math.floor((character.stats[ability] - 10) / 2) + character.proficiencyBonus;
                },
                [character.spellcasting, character.stats, character.proficiencyBonus]
            ),

            // Saving throws
            savingThrows: memoizedCalculation(
                'savingThrows',
                () => {
                    const saves = {};
                    for (const [stat, value] of Object.entries(character.stats)) {
                        const modifier = Math.floor((value - 10) / 2);
                        const proficient = character.proficiencies?.saves?.includes(stat) || false;
                        saves[stat] = modifier + (proficient ? character.proficiencyBonus : 0);
                    }
                    return saves;
                },
                [character.stats, character.proficiencies, character.proficiencyBonus]
            ),

            // Skills
            skills: memoizedCalculation(
                'skills',
                () => {
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

                    const skills = {};
                    for (const [skill, stat] of Object.entries(skillToStat)) {
                        const modifier = Math.floor((character.stats[stat] - 10) / 2);
                        const proficient = character.proficiencies?.skills?.includes(skill) || false;
                        const expertise = character.specialAbilities?.expertise?.skills?.includes(skill) || false;
                        
                        let bonus = modifier;
                        if (proficient) {
                            bonus += character.proficiencyBonus;
                            if (expertise) {
                                bonus += character.proficiencyBonus; // Double proficiency
                            }
                        }
                        
                        skills[skill] = bonus;
                    }
                    return skills;
                },
                [character.stats, character.proficiencies, character.specialAbilities, character.proficiencyBonus]
            )
        };
    }, [character, memoizedCalculation]);

    return calculations;
};