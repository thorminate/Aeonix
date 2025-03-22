import Item from "../../item/item.js";
import deepInstantiate from "../../misc/deepInstantiate.js";

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

  static fromPOJO(pojo: IInventoryEntry): InventoryEntry {
    let content = {
      name: "",
      id: "",
      quantity: 0,
      weight: 0,
      data: {},
    };

    if (pojo.hasOwnProperty("id")) {
      content.id = pojo.id;
    }
    if (pojo.hasOwnProperty("name")) {
      content.name = pojo.name;
    }
    if (pojo.hasOwnProperty("quantity")) {
      content.quantity = pojo.quantity;
    }
    if (pojo.hasOwnProperty("weight")) {
      content.weight = pojo.weight;
    }
    if (pojo.hasOwnProperty("data")) {
      content.data = pojo.data;
    }
    return new InventoryEntry(
      content.name,
      content.id,
      content.quantity,
      content.weight,
      content.data
    );
  }

  async toItem(): Promise<Item> {
    const itemStructure = await Item.find(this.id);

    return deepInstantiate(
      itemStructure,
      {
        name: this.name,
        data: this.data,
      },
      {}
    );
  }
}
