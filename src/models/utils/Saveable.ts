import { Document, FilterQuery, Model } from "mongoose";

// Define a specialized interface for the constructor
export interface SaveableConstructor<T extends Document, TInstance> {
  new (...args: any[]): TInstance;
  getModel(): Model<T>;
}

export default abstract class Saveable<T extends Document> {
  protected abstract getModel(): Model<T>;
  protected abstract getIdentifier(): { key: string; value: any };

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
    identifier: any
  ): Promise<TInstance | null> {
    const model = this.getModel();
    const doc = await model.findOne({
      [this.prototype.getIdentifier().key]: identifier,
    } as Record<string, any>);

    if (!doc) return null;

    // Create an instance and populate it
    const instance = new this() as TInstance;
    Object.assign(instance, doc.toObject());
    return instance;
  }

  static async loadOrCreate<T extends Document, TInstance extends Saveable<T>>(
    this: SaveableConstructor<T, TInstance>,
    identifier: any
  ): Promise<TInstance> {
    const model = this.getModel();
    const doc = await model.findOne({
      [this.prototype.getIdentifier().key]: identifier,
    } as Record<string, any>);

    if (doc) {
      // Create an instance and populate it
      const instance = new this() as TInstance;
      Object.assign(instance, doc.toObject());
      return instance;
    } else {
      const instance = new this(identifier) as TInstance;
      await instance.save();
      return instance;
    }
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
