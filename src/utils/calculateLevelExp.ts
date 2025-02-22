/**
 * Calculate the experience required for the next level.
 */
export default (currentLevel: number) => {
  // Export the function.
  const nextLevel = currentLevel + 1;
  const output = nextLevel ** 2 || 1; // Calculate the output.

  const roundedOutput = Math.round(output); // Round the output.
  return roundedOutput; // Return the rounded output.
};
