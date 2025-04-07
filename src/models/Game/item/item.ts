import Player from "../Player/Player.js";
import getAllFiles from "../../../utils/getAllFiles.js";
import path from "path";
import url from "url";
import deepInstantiate from "../../../utils/deepInstantiate.js";
import { InventoryEntry } from "../Inventory/inventoryUtils.js";

export class ItemUsageContext {
  player: Player;
}

export class ItemUsageResult {
  message: string;
  success: boolean;
  data;

  constructor(message: string, success: boolean) {
    this.message = message;
    this.success = success;
  }
}

export default abstract class Item {
  abstract name: string;
  abstract description: string;
  abstract weight: number;
  abstract value: number;
  abstract data: any;
  abstract id: string;
  abstract useType: string;

  abstract createData(): object;

  protected async createInstance<T extends Item>(itemType: string): Promise<T> {
    switch (itemType) {
      case "BackpackItem":
        const backpackItemModule = await import("./content/BackpackItem.js");
        const BackpackItem = backpackItemModule.default;
        return new BackpackItem() as T;
      case "WeaponItem":
        const WeaponItemModule = await import("./content/WeaponItem.js");
        const WeaponItem = WeaponItemModule.default;
        return new WeaponItem() as T;
      default:
        throw new Error("Invalid item type", {
          cause: `Item type ${itemType} is not a valid item type in item.createInstance()`,
        });
    }
  }

  abstract use(context: ItemUsageContext): Promise<ItemUsageResult>;

  toInventoryEntry<T extends Item>(
    this: T,
    quantity: number = 1
  ): InventoryEntry {
    return new InventoryEntry(
      this.name,
      this.id,
      quantity,
      this.weight,
      this.data
    );
  }

  static async findAll<T extends Item>(this: typeof Item): Promise<T[]> {
    const files = getAllFiles("dist/models/item/content");

    return (await Promise.all(
      files.map(async (file) => {
        const filePath = path.resolve(file);
        const fileUrl = url.pathToFileURL(filePath);
        const rawItem: Item = (await import(fileUrl.toString())).default;

        const item: Item = await deepInstantiate(
          this.prototype.createInstance(rawItem.name),
          rawItem,
          {}
        );

        return item;
      })
    )) as T[];
  }

  static async find<T extends Item>(id: string): Promise<T> {
    const items = await this.findAll();

    const result = items.find((item) => item.id === id) as T;

    if (!result) return Promise.reject("Item not found");
    else return result;
  }
}
