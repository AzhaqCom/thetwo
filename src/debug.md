Scene dialogue ok

Scene combat pas ok
probleme :
Quelque chose s'est mal passé :
Cannot access 'addCombatMessage' before initialization
j'ai quand meme les console.logs de app.jsx
🎯 Combat data for CombatPanel: {type: 'combat', enemies: Array(1), enemyPositions: {…}, playerPosition: null, companionPositions: null, …}
App.jsx:318 🎯 Enemy positions converted: {Ombre 1: {…}}
App.jsx:316 🎯 Combat scene data: {id: 'test_combat', type: 'combat', content: {…}, enemies: Array(1), enemyPositions: Array(1), …}
App.jsx:317 🎯 Combat data for CombatPanel: {type: 'combat', enemies: Array(1), enemyPositions: {…}, playerPosition: null, companionPositions: null, …}
App.jsx:318 🎯 Enemy positions converted: {Ombre 1: {…}}

l'erreur en question est ici :
App.jsx:322 ReferenceError: Cannot access 'addCombatMessage' before initialization
    at CombatPanel (CombatPanel.jsx:85:44)



scene interactive ok, j'ai pu trouver l'objet ( jai mis un objet présent dans weapon.js) et le retour au hub en cliquand sur le hotspot marche aussi !
scene marchand, a moitié ok:
La scene marchand se lance, mais si je clique sur acheter, je n'ai pas le components game/Shopinterface.jsx qui s'ouvre 
et voici le log:
SceneManager.js:79 Scène "openShop" non trouvée dans le nouveau système

Donc voir comment regler ce petit probleme.

les 3 scenes de repos s'affichent mais:

apres un repos court quand je cliquer sur le bouton terminer le repos il me dit 
 SceneManager.js:79 Scène "null" non trouvée dans le nouveau système

 les scenes de repos sont des anciens composants, peut etre doit on les adapter afin qu'il colle mieux a notre nouveau systeme de scene, parce que si on prend l'exemple de la scene test_rest_short, le choice est censé affiché Continuer et pas terminer le repos.
 Apres un repos court j'a ica comme message:
  App.jsx:274 Pas de scène suivante définie après le repos SceneManager.js:79 
SceneManager.js:79 Scène "null" non trouvée dans le nouveau système

encore une fois rien d'alarmant, il faut adapter les composants présent dans features/rest/

Test conséquence :
Xp ok
objet ok ! j'ai juste mis ca a la place comme objet ;) potionOfHealing
compagnon ok
Test de compétence erreur :
SceneManager.js:79 Scène "test_skill_result" non trouvée dans le nouveau système

ShopInterface.jsx:155 Received NaN for the `children` attribute. If this is expected, cast the value to a string.