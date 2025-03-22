export default function deepInstantiate<T extends object>(
  target: T,
  source: any,
  classMap: Record<string, any>
): T {
  for (const key of Object.keys(source)) {
    const sourceIsObjectOrClass = typeof source[key] === "object";
    const sourcePropertyIsNotNull = source[key] !== null;
    const targetHasProperty = key in target;

    if (sourceIsObjectOrClass && sourcePropertyIsNotNull && targetHasProperty) {
      const ClassFromMap = classMap[key]; // Check if there's a class associated with this key

      const classExistsInMap = ClassFromMap !== undefined;
      if (classExistsInMap) {
        // Instantiate the class with the source data
        target[key] = deepInstantiate(
          new ClassFromMap(),
          source[key],
          classMap
        );
      } else {
        target[key] = deepInstantiate(
          target[key] !== undefined
            ? target[key]
            : Array.isArray(source[key])
            ? []
            : {},
          source[key],
          classMap
        ); // Recursively assign
      }
    } else {
      target[key] = source[key]; // Assign primitives directly
    }
  }
  return target;
}
