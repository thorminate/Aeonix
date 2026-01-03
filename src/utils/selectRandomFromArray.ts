import aeonix from "../index.js";

export default function selectRandomFromArray<T>(array: T[]): T {
  const randomIndex = Math.floor(Math.random() * array.length);
  if (!array[randomIndex]) {
    aeonix.logger.error(
      "selectRandomFromArray",
      "array[randomIndex] is undefined, returning first element instead.",
      { array, randomIndex, result: array[randomIndex] }
    );
    return array[0] as T;
  }
  return array[randomIndex];
}
