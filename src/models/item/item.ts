import { Document, model, Model, Schema } from "mongoose";
import Saveable from "../utils/Saveable";

interface IItem extends Document {
  name: string;
  description: string;
  weight: number;
  value: number;
}

const ItemSchema = new Schema<IItem>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  value: {
    type: Number,
    required: true,
  },
});

const ItemModel = model<IItem>("Item", ItemSchema);

export default class Item extends Saveable<IItem> {
  name: string;
  description: string;
  weight: number;
  value: number;

  constructor(
    name: string,
    description: string,
    weight: number,
    value: number
  ) {
    super();
    this.name = name;
    this.description = description;
    this.weight = weight;
    this.value = value;
  }

  protected getIdentifier(): {
    key: string;
    value: string;
    secondKey?: string;
    secondValue?: string;
  } {
    return {
      key: "name",
      value: this.name,
    };
  }

  protected getClassMap(): Record<string, any> {
    return {};
  }

  protected getModel(): Model<IItem> {
    return ItemModel;
  }

  static getModel(): Model<IItem> {
    return ItemModel;
  }
}
