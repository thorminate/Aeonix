/* eslint-disable @typescript-eslint/no-explicit-any */
import { Document, Model } from "mongoose";
import hardMerge from "../../utils/hardMerge.js";

// Define a specialized interface for the constructor
export interface SaveableConstructor<T extends Document, TInstance> {
  new (...args: never[]): TInstance;
  getModel(): Model<T>;
}

export default abstract class Saveable<T extends Document> {
  abstract _id: string;
  protected abstract getModel(): Model<T>;
  protected abstract getClassMap(): Record<string, object>;

  toObject(): Record<string, any> {
    const obj = { ...structuredClone(this) };
    delete (obj as any)._id;
    return obj;
  }

  async save(): Promise<void> {
    const thisCopy = this.toObject();

    await this.getModel().findOneAndUpdate(
      { _id: this._id } as Record<string, string>,
      thisCopy,
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
      _id: identifier,
    };
    const doc = await model.findOne(query as Record<string, string>);
    if (!doc) return undefined;

    const instance = hardMerge(
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
      _id: identifier,
    } as Record<string, string>);
  }
}
