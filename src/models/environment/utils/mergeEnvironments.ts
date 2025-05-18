/* eslint-disable @typescript-eslint/no-explicit-any */
export default function mergeEnvironments<
  T extends object,
  U extends { [key: string]: any }
>(
  target: T,
  source: U,
  classMap: Record<string, new (...args: any[]) => any> = {}
): T & U {
  for (const key of Object.keys(source)) {
    const sourceValue = source[key];

    if (!sourceValue) {
      continue;
    }

    const targetHasProperty = key in target;
    const classExistsInMap = key in classMap;
    const ClassFromMap = classMap[key];

    if (Array.isArray(sourceValue) && classExistsInMap) {
      // If it's an array and a class is mapped, instantiate each element
      (target as Record<string, unknown>)[key] = sourceValue.map(
        (item: unknown) =>
          typeof item === "object" && item
            ? mergeEnvironments(new ClassFromMap!(), item, classMap)
            : item
      );
    } else if (
      typeof sourceValue === "object" &&
      sourceValue &&
      targetHasProperty
    ) {
      if (classExistsInMap) {
        (target as Record<string, any>)[key] = mergeEnvironments(
          new ClassFromMap!(),
          sourceValue,
          classMap
        );
      } else {
        (target as Record<string, any>)[key] = mergeEnvironments(
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

  // Now that we've merged all the properties, we can merge the classes' methods too.

  const sourcePrototype = Object.getPrototypeOf(source);
  const targetPrototype = Object.getPrototypeOf(target);

  // Copy methods from source prototype to target prototype
  for (const method of Object.getOwnPropertyNames(sourcePrototype)) {
    if (method !== "constructor") {
      Object.defineProperty(targetPrototype, method, {
        value: sourcePrototype[method],
        enumerable: false,
        configurable: true,
        writable: true,
      });
    }
  }

  // Set new merged prototype as target's prototype
  Object.setPrototypeOf(target, targetPrototype);

  return target as T & U;
}
