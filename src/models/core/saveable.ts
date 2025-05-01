import { Document, Model } from "mongoose";
import deepInstantiate from "../../utils/deepInstantiate.js";

/**
 * Takes in a target object and a source object, and assigns the source values to the target object recursively.
 * @param target The target object
 * @param source
 * @param classMap
 * @returns
 */

// Define a specialized interface for the constructor
export interface SaveableConstructor<T extends Document, TInstance> {
  new (...args: never[]): TInstance;
  getModel(): Model<T>;
}

export default abstract class Saveable<T extends Document> {
  protected abstract getModel(): Model<T>;
  protected abstract getClassMap(): Record<string, object>;
  protected abstract getIdentifier(): {
    key: string;
    value: string;
  };

  async save(): Promise<void> {
    const { key, value } = this.getIdentifier();

    await this.getModel().findOneAndUpdate(
      { [key]: value } as Record<string, string>,
      this,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  // Static load method with better type control
  static async find<T extends Document, TInstance extends Saveable<T>>(
    // Ensure that this has a valid constructor
    this: SaveableConstructor<T, TInstance>,
    identifier: string
  ): Promise<TInstance | undefined> {
    const model = this.getModel();

    const query = {
      [this.prototype.getIdentifier().key]: identifier,
    };
    const doc = await model.findOne(query as Record<string, string>);
    if (!doc) return undefined;

    const instance = deepInstantiate(
      new this() as TInstance,
      doc.toObject(),
      this.prototype.getClassMap()
    );
    return instance;
  }

  static async delete<T extends Document, TInstance extends Saveable<T>>(
    this: SaveableConstructor<T, TInstance>,
    identifier: string
  ): Promise<void> {
    const model = this.getModel();
    await model.findOneAndDelete({
      [this.prototype.getIdentifier().key]: identifier,
    } as Record<string, string>);
  }
}
