/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * @param subMemberName The name of the sub-member to filter by
 * @param classMap The class map to filter from
 * @returns A new class map containing only the sub-members that start with the given subMemberName
 * @example
 * getClassMapSubMembers("key", {
 *  "key": Class,
 *  "subMemberName.subKey": Class,
 *  "subMemberName.subKey2": Class,
 *  "key.subKey1": Class,
 *  "key.subKey2butDifferent": Class,
 * })
 * returns {
 *  "subKey1": Class,
 *  "subKey2butDifferent": Class,
 * }
 */
function getClassMapSubMembers(
  subMemberName: string,
  classMap: Record<string, new (...args: any[]) => any>
) {
  const subMembers: Record<string, new (...args: any[]) => any> = {};

  for (const key of Object.keys(classMap)) {
    if (key.startsWith(subMemberName + ".")) {
      const subKey = key.slice(subMemberName.length + 1);
      if (subKey.length !== 0) {
        subMembers[subKey] = classMap[key]!;
      }
    }
  }

  return subMembers;
}

export default function hardMerge<T extends object>(
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
            ? hardMerge(
                new ClassFromMap!(),
                item,
                getClassMapSubMembers(key, classMap)
              )
            : item
      );
    } else if (
      typeof sourceValue === "object" &&
      sourceValue &&
      targetHasProperty
    ) {
      if (classExistsInMap) {
        (target as Record<string, any>)[key] = hardMerge(
          new ClassFromMap!(),
          sourceValue,
          getClassMapSubMembers(key, classMap)
        );
      } else {
        (target as Record<string, any>)[key] = hardMerge(
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
