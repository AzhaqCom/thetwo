export const getModifier = (score) => Math.floor((score - 10) / 2);
export function rollD20() {
  // Génère un nombre aléatoire entre 1 et 20 inclus
  return Math.floor(Math.random() * 20) + 1;
}
