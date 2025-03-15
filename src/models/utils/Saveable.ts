import { Document, Model } from "mongoose";
import log from "../../utils/log";

/**
 * Takes in a target object and a source object, and assigns the source values to the target object recursively.
 * @param target The target object
 * @param source
 * @param classMap
 * @returns
 */
function deepInstantiate<T extends object>(
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
        target[key] = deepInstantiate(target[key], source[key], classMap); // Recursively assign
      }
    } else {
      target[key] = source[key]; // Assign primitives directly
    }
  }
  return target;
}

// Define a specialized interface for the constructor
export interface SaveableConstructor<T extends Document, TInstance> {
  new (...args: any[]): TInstance;
  getModel(): Model<T>;
}

export default abstract class Saveable<T extends Document> {
  protected abstract getModel(): Model<T>;
  protected abstract getClassMap(): Record<string, any>;
  protected abstract getIdentifier(): {
    key: keyof T | string;
    value: string;
    secondKey?: keyof T | string;
    secondValue?: string;
  };

  async save(): Promise<void> {
    const { key, value } = this.getIdentifier();

    await this.getModel().findOneAndUpdate(
      { [key]: value } as Record<string, any>,
      this,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  // Static load method with better type control
  static async load<T extends Document, TInstance extends Saveable<T>>(
    // Ensure that this has a valid constructor
    this: SaveableConstructor<T, TInstance>,
    identifier: string
  ): Promise<TInstance | null> {
    // First fetch the model, this links to a collection in the db (namely players)
    const model = this.getModel();

    /*
     * Create a query to find the document
     *
     * Example:
     * this.prototype.getIdentifier() = { key: 'name' }
     * identifier = 'username'
     * query = { name: 'username' }
     *
     * Summary:
     * This creates a query object with the appropriate key and the identifier parameter
     */
    const query = {
      [this.prototype.getIdentifier().key as string]: identifier,
    };
    // Fetch the document
    let doc = await model.findOne(query as Record<string, any>);
    if (!doc) return null;

    // Create an instance and populate it
    const emptyInstance = new this() as TInstance;

    const initializedInstance = deepInstantiate(
      emptyInstance,
      doc.toObject(),
      this.prototype.getClassMap()
    );
    return initializedInstance;
  }

  static async delete<T extends Document>(
    this: SaveableConstructor<T, any>,
    identifier: any
  ): Promise<void> {
    const model = this.getModel();
    await model.findOneAndDelete({
      [this.prototype.getIdentifier().key]: identifier,
    } as Record<string, any>);
  }
}
