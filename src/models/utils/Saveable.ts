import { Document, FilterQuery, Model } from "mongoose";
import log from "../../utils/log";

// Define a specialized interface for the constructor
export interface SaveableConstructor<T extends Document, TInstance> {
  new (...args: any[]): TInstance;
  getModel(): Model<T>;
}

export default abstract class Saveable<T extends Document> {
  protected abstract getModel(): Model<T>;
  protected abstract getIdentifier(): {
    key: keyof T | string;
    value: string;
    secondKey?: keyof T | string;
    secondValue?: string;
  };

  async save(data?: Partial<T>): Promise<void> {
    const { key, value } = this.getIdentifier();
    const updateData = data ? { ...data } : this;

    await this.getModel().findOneAndUpdate(
      { [key]: value } as Record<string, any>,
      updateData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  // Static load method with better type control
  static async load<T extends Document, TInstance extends Saveable<T>>(
    this: SaveableConstructor<T, TInstance>,
    identifier: string
  ): Promise<TInstance | null> {
    // First fetch the model, this links to a collection in the db (namely players)
    const model = this.getModel();

    /**
     * Create a query to find the document
     *
     * Example:
     * this.prototype.getIdentifier() = { key: 'name', value: 'username' }
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
    const instance = new this() as TInstance;
    Object.assign(instance, doc.toObject());
    return instance;
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
