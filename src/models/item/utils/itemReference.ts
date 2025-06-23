import { randomUUID } from "crypto";
import Item, { TemplateItem } from "../item.js";
import hardMerge from "../../../utils/hardMerge.js";
import log from "../../../utils/log.js";
import { modelOptions, prop, Severity } from "@typegoose/typegoose";
import { Schema } from "mongoose";

@modelOptions({ options: { allowMixed: Severity.ALLOW } })
export default class ItemReference {
  @prop({ default: "" })
  name: string;
  @prop({ default: "" })
  id: string;
  @prop({ default: 1 })
  quantity: number;
  @prop({ default: 1 })
  weight: number;
  @prop({ type: () => Schema.Types.Mixed, default: {} })
  data: object;
  @prop({ default: "" })
  type: string;

  constructor(
    name: string = "",
    id: string = randomUUID(),
    quantity: number = 1,
    weight: number = 1,
    data: object = {},
    type: string = ""
  ) {
    this.name = name;
    this.id = id;
    this.quantity = quantity;
    this.weight = weight;
    this.data = data;
    this.type = type;
  }

  async toItem(): Promise<Item | undefined> {
    if (!this.type) return undefined;

    const modulePath = `../../../content/items/${this.type}.js`;
    try {
      const module = await import(modulePath);

      const ItemClass: typeof TemplateItem = module.default;

      return hardMerge(new ItemClass(), {
        name: this.name,
        id: this.id,
        weight: this.weight,
        data: this.data,
      });
    } catch (e) {
      log({
        header: "Error instantiating item",
        processName: "ItemReferenceToItemMethod",
        type: "Error",
        payload: e,
      });
      return undefined;
    }
  }
}
