import path from "path";
import url from "url";
import Item, { RawItem } from "../models/item/item.js";
import { ConstructableManager } from "../models/core/constructibleManager.js";
import merge from "../utils/merge.js";

type Holds = Item;

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export default class ItemManager extends ConstructableManager<Holds> {
  getKey(instance: Item): string {
    const id = instance.type;
    if (!id) throw new Error("No type found in item", { cause: instance });
    return id;
  }

  folder(): string {
    return path.join(__dirname, "..", "content", "items");
  }

  async fromRaw(raw: RawItem): Promise<Item> {
    const cls = await this.loadRaw(raw[1]);
    if (!cls) throw new Error("No class found for item", { cause: raw });
    return merge(new cls(), {
      id: raw[0],
      type: raw[1],
      createdAt: raw[2],
      quantity: raw[3],
      weight: raw[4],
      value: raw[5],
      data: raw[6],
      isInteracted: raw[7],
    } as Partial<Item>);
  }
}
