import log from "./log.js";

export default function selectRandomFromArray<T>(array: T[]): T {
  const randomIndex = Math.floor(Math.random() * array.length);
  if (!array[randomIndex]) {
    log({
      header:
        "array[randomIndex] is undefined, returning first element instead.",
      processName: "selectRandomFromArray",
      type: "Error",
      payload: { array, randomIndex, result: array[randomIndex] },
    });
    return array[0] as T;
  }
  return array[randomIndex];
}
