export default function deepInstantiate<T extends object>(
  target: T,
  source: any,
  classMap: Record<string, any> = {}
): T {
  for (const key of Object.keys(source)) {
    const sourceValue = source[key];
    const targetHasProperty = key in target;
    const classExistsInMap = key in classMap;
    const ClassFromMap = classMap[key];

    if (Array.isArray(sourceValue) && classExistsInMap) {
      // If it's an array and a class is mapped, instantiate each element
      target[key] = sourceValue.map((item: any) =>
        typeof item === "object" && item !== null
          ? deepInstantiate(new ClassFromMap(), item, classMap)
          : item
      );
    } else if (
      typeof sourceValue === "object" &&
      sourceValue !== null &&
      targetHasProperty
    ) {
      if (classExistsInMap) {
        target[key] = deepInstantiate(
          new ClassFromMap(),
          sourceValue,
          classMap
        );
      } else {
        target[key] = deepInstantiate(
          target[key] !== undefined
            ? target[key]
            : Array.isArray(sourceValue)
            ? []
            : {},
          sourceValue,
          classMap
        );
      }
    } else {
      target[key] = sourceValue; // Assign primitives directly
    }
  }

  return target;
}
