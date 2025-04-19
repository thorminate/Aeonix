import Item from "../Item/item.js";
import deepInstantiate from "../../../utils/deepInstantiate.js";
import { randomUUID } from "node:crypto";
import log from "../../../utils/log.js";

export interface IInventoryEntry {
  name: string;
  id: string;
  quantity: number;
  weight: number;
  data: object;
}

export interface EntryQuery {
  key?: string;
  value: string;
}

export interface IInventory {
  capacity: number;
  entries: InventoryEntry[];
}

export class InventoryEntry implements IInventoryEntry {
  name: string;
  id: string;
  quantity: number;
  weight: number;
  data: object;
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

    const modulePath = `../Item/content/${this.type}.js`;
    try {
      const module = await import(modulePath);

      const ItemClass: typeof Item = module.default;

      return deepInstantiate(new ItemClass(), {
        name: this.name,
        id: this.id,
        weight: this.weight,
        data: this.data,
      });
    } catch (e: unknown) {
      log({
        header: "Error instantiating item",
        processName: "InventoryEntry",
        type: "Error",
        payload: e,
      });
      return undefined;
    }
  }
}
