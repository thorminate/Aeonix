import ConcreteConstructor from "../models/core/concreteConstructor.js";
import merge from "./merge.js";

export default async function elementsFixer<T extends object>(
  arr: T[],
  fetchRawConstructible: (
    id: string
  ) => Promise<ConcreteConstructor<T> | undefined>,
  getId: (inst: T) => string
): Promise<T[]> {
  return await Promise.all(
    arr.map(async (o) => {
      const RealClass = await fetchRawConstructible(getId(o));

      if (!RealClass || RealClass === o) {
        // If no concrete class found, return the letter as is
        return o;
      }

      return o instanceof RealClass ? o : merge(new RealClass(), o);
    })
  );
}
