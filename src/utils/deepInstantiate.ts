/* eslint-disable @typescript-eslint/no-explicit-any */
export default function deepInstantiate<T extends object>(
  target: T,
  source: any,
  classMap: Record<string, new (...args: any[]) => any> = {}
): T {
  for (const key of Object.keys(source)) {
    const sourceValue = source[key];
    const targetHasProperty = key in target;
    const classExistsInMap = key in classMap;
    const ClassFromMap = classMap[key];

    if (Array.isArray(sourceValue) && classExistsInMap) {
      // If it's an array and a class is mapped, instantiate each element
      (target as Record<string, unknown>)[key] = sourceValue.map(
        (item: unknown) =>
          typeof item === "object" && item
            ? deepInstantiate(new ClassFromMap!(), item, classMap)
            : item
      );
    } else if (
      typeof sourceValue === "object" &&
      sourceValue &&
      targetHasProperty
    ) {
      if (classExistsInMap) {
        (target as Record<string, any>)[key] = deepInstantiate(
          new ClassFromMap!(),
          sourceValue,
          classMap
        );
      } else {
        (target as Record<string, any>)[key] = deepInstantiate(
          (target as Record<string, any>)[key] !== undefined
            ? (target as Record<string, any>)[key]
            : Array.isArray(sourceValue)
            ? []
            : {},
          sourceValue,
          classMap
        );
      }
    } else {
      (target as Record<string, any>)[key] = sourceValue; // Assign primitives directly
    }
  }

  return target;
}
