export default (currentLevel: number): number => {
  const nextLevel = currentLevel + 1;

  if (nextLevel <= 0) return 1;

  if (nextLevel <= 5) return 5 * nextLevel; // max 25

  if (nextLevel <= 50) return 10 * (nextLevel - 5) + 25; // max 475

  if (nextLevel <= 100) return 20 * (nextLevel - 50) + 475; // max 1475

  return 50 * (nextLevel - 100) + 1475; // max infinite
};
