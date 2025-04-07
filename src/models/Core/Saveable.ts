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
  new (...args: any[]): TInstance;
  getModel(): Model<T>;
}

export default abstract class Saveable<T extends Document> {
  protected abstract getModel(): Model<T>;
  protected abstract getClassMap(): Record<string, any>;
  protected abstract getIdentifier(): {
    key: Array<keyof T | string>;
    value: Array<string>;
  };

  async save(): Promise<void> {
    const { key, value } = this.getIdentifier();

    await this.getModel().findOneAndUpdate(
      { [key[0]]: value[0] } as Record<string, any>,
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
    const model = this.getModel();

    const query = {
      [this.prototype.getIdentifier().key[0]]: identifier,
    };
    let doc = await model.findOne(query as Record<string, any>);
    if (!doc) return undefined;

    const instance = deepInstantiate(
      new this() as TInstance,
      doc.toObject(),
      this.prototype.getClassMap()
    );
    return instance;
  }

  static async delete<T extends Document>(
    this: SaveableConstructor<T, any>,
    identifier: any
  ): Promise<void> {
    const model = this.getModel();
    await model.findOneAndDelete({
      [this.prototype.getIdentifier().key[0]]: identifier,
    } as Record<string, any>);
  }
}
