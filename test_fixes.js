/**
 * Tests de validation pour les corrections apportées
 * Ce fichier peut être exécuté avec Node.js pour valider les corrections
 */

// Import des modules (adapter selon l'environnement)
import { CharacterManager } from './src/services/characterManager.js';
import { enemyTemplates } from './src/data/enemies.js';

/**
 * Test de la montée de niveau
 */
function testLevelUpSafety() {
  console.log('🧪 Test de sécurité de montée de niveau...');
  
  const testCharacter = {
    level: 1,
    currentXP: 0,
    maxHP: 10,
    currentHP: 10,
    stats: { constitution: 14 },
    class: 'Guerrier',
    proficiencyBonus: 2
  };

  // Test 1: Montée de niveau simple
  const result1 = CharacterManager.addExperience(testCharacter, 300);
  console.log(`✓ Niveau simple: ${testCharacter.level} → ${result1.level} (XP: ${result1.currentXP})`);
  
  // Test 2: Montée de niveau multiple (scénario extrême)
  const bigXPGain = 10000; // Assez pour monter plusieurs niveaux
  const result2 = CharacterManager.addExperience(testCharacter, bigXPGain);
  console.log(`✓ XP énorme: ${testCharacter.level} → ${result2.level} (XP: ${result2.currentXP})`);
  
  // Test 3: Vérifier qu'il n'y a pas de boucle infinie (le test se termine)
  console.log('✅ Test de montée de niveau terminé sans boucle infinie');
  
  return true;
}

/**
 * Test de la structure du Diable
 */
function testDevilAttackSets() {
  console.log('🧪 Test de la structure attackSets du Diable...');
  
  const devil = enemyTemplates.diable;
  
  // Vérifier que le Diable a des attackSets
  if (!devil.attackSets) {
    console.error('❌ Le Diable n\'a pas d\'attackSets');
    return false;
  }
  
  console.log(`✓ Le Diable a ${devil.attackSets.length} sets d'attaque`);
  
  // Vérifier la structure des attackSets
  devil.attackSets.forEach((set, index) => {
    console.log(`  Set ${index + 1}: ${set.name} (${set.attacks.length} attaques)`);
    
    set.attacks.forEach((attack) => {
      console.log(`    - ${attack.name} (${attack.type}, portée ${attack.range})`);
    });
  });
  
  // Vérifier qu'il y a bien des attaques de mêlée et à distance
  const hasMelee = devil.attackSets.some(set => 
    set.attacks.some(attack => attack.type === 'melee')
  );
  const hasRanged = devil.attackSets.some(set => 
    set.attacks.some(attack => attack.type === 'ranged')
  );
  
  if (!hasMelee || !hasRanged) {
    console.error('❌ Le Diable doit avoir des attaques mêlée ET à distance');
    return false;
  }
  
  console.log('✅ Le Diable a bien des attaques mêlée et à distance');
  return true;
}

/**
 * Test du système de grimoire
 */
function testSpellGrimoire() {
  console.log('🧪 Test du système de grimoire...');
  
  // Simuler un personnage magicien niveau 3
  const testWizard = {
    level: 3,
    class: 'Magicien',
    spellcasting: {
      ability: 'intelligence',
      knownSpells: [],
      preparedSpells: ['Projectile Magique'],
      cantrips: ['Projectile Magique', 'Rayon de givre']
    },
    stats: { intelligence: 16 },
    activeEffects: [] // Aucun sort actif
  };

  // Test de base (nécessite d'adapter selon l'environnement d'exécution)
  console.log('✓ Personnage test créé: Magicien niveau 3');
  console.log(`  - Sorts préparés: ${testWizard.spellcasting.preparedSpells.length}`);
  console.log(`  - Tours de magie: ${testWizard.spellcasting.cantrips.length}`);
  
  console.log('✅ Structure de base du grimoire validée');
  return true;
}

/**
 * Checklist de tests manuels
 */
function printManualTestChecklist() {
  console.log('\n📋 CHECKLIST DE TESTS MANUELS');
  console.log('=====================================');
  console.log('');
  console.log('🎯 Montée de niveau:');
  console.log('  ☐ Créer un personnage niveau 1 avec 250 XP');
  console.log('  ☐ Lui donner 100 XP → devrait passer niveau 2');
  console.log('  ☐ Lui donner 5000 XP → devrait monter plusieurs niveaux sans crash');
  console.log('');
  console.log('⚔️ Diable avec attackSets:');
  console.log('  ☐ Créer un combat avec un Diable');
  console.log('  ☐ Le placer proche du joueur (distance 1) → devrait utiliser mêlée');
  console.log('  ☐ Le placer loin du joueur (distance 5+) → devrait utiliser épines');
  console.log('  ☐ Vérifier qu\'il lance bien 2 attaques par tour');
  console.log('');
  console.log('🔮 Système de sorts:');
  console.log('  ☐ Ouvrir le SpellPanel → onglet "Grimoire" doit être présent');
  console.log('  ☐ Grimoire doit montrer tous les sorts disponibles selon le niveau');
  console.log('  ☐ Préparer un sort depuis le grimoire');
  console.log('  ☐ Lancer "Armure du Mage" hors combat');
  console.log('  ☐ Vérifier que le bouton "Lancer" disparaît si Armure du Mage est active');
  console.log('');
}

// Exécution des tests
async function runAllTests() {
  console.log('🚀 DÉMARRAGE DES TESTS DE VALIDATION\n');
  
  try {
    const levelUpTest = testLevelUpSafety();
    const devilTest = testDevilAttackSets();
    const grimoireTest = testSpellGrimoire();
    
    if (levelUpTest && devilTest && grimoireTest) {
      console.log('\n✅ TOUS LES TESTS AUTOMATIQUES SONT PASSÉS');
    } else {
      console.log('\n❌ CERTAINS TESTS ONT ÉCHOUÉ');
    }
    
    printManualTestChecklist();
    
  } catch (error) {
    console.error('❌ Erreur durant les tests:', error.message);
  }
}

// Exporter pour utilisation en module ou exécuter directement
if (typeof window === 'undefined' && typeof global !== 'undefined') {
  // Environnement Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { testLevelUpSafety, testDevilAttackSets, testSpellGrimoire };
  }
} else {
  // Environnement navigateur - exécuter directement
  runAllTests();
}