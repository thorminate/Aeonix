import Item from "../Item/item.js";
import deepInstantiate from "../../../utils/deepInstantiate.js";

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

  constructor(
    name: string,
    id: string,
    quantity: number,
    weight: number,
    data: object
  ) {
    this.name = name;
    this.id = id;
    this.quantity = quantity;
    this.weight = weight;
    this.data = data;
  }

  static fromPOJO(o: Partial<IInventoryEntry>): InventoryEntry {
    return new InventoryEntry(
      o.name || "",
      o.id || "",
      o.quantity || 1,
      o.weight || 0,
      o.data || {}
    );
  }

  async toItem() {
    return deepInstantiate(
      new Item(),
      {
        name: this.name,
        data: this.data,
        id: this.id,
      },
      {}
    );
  }
}
