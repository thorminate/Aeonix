import path from "path";
import url from "url";
import Item from "../models/item/item.js";
import { ConstructableManager } from "../models/core/constructibleManager.js";

type Holds = Item;

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export default class ItemManager extends ConstructableManager<Holds> {
  getKey(instance: Item): string {
    const id = instance.type;
    if (!id) throw new Error("No type found in item");
    return id;
  }

  folder(): string {
    return path.join(__dirname, "..", "content", "items");
  }
}
