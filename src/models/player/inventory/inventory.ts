import Item from "../../item/item.js";

export interface IInventoryEntry {
  name: string;
  id: string;
  quantity: number;
  data: object;
}

export class InventoryEntry implements IInventoryEntry {
  name: string;
  id: string;
  quantity: number;
  data: object;

  constructor(name: string, id: string, quantity: number, data: object) {
    this.name = name;
    this.id = id;
    this.quantity = quantity;
    this.data = data;
  }

  static fromPOJO(pojo: IInventoryEntry): InventoryEntry {
    return new InventoryEntry(pojo.name, pojo.id, pojo.quantity, pojo.data);
  }

  async toItem(): Promise<Item> {
    return await Item.find(this.id);
  }
}

export interface IInventory {
  capacity: number;
  entries: InventoryEntry[];
}

export default class Inventory implements IInventory {
  capacity: number;
  private _entries: InventoryEntry[];

  public get entries(): InventoryEntry[] {
    return this._entries.map((entry: IInventoryEntry) => {
      return InventoryEntry.fromPOJO(entry);
    });
  }

  public set entries(entries: InventoryEntry[]) {
    this._entries = entries;
  }

  add(entry: InventoryEntry): void {
    this.entries.push(entry);
  }

  /**
   *
   * @param entry Takes in an InventoryEntry or a string, string searches and removes all entries with the same content as the string-
   * @returns Returns an array of the removed entries
   */
  remove(entry: InventoryEntry | string): void {
    if (typeof entry === "string") {
      this.entries = this.entries.filter(
        (e: InventoryEntry) => e.name !== entry
      );

      return;
    }

    this.entries = this.entries.filter((e: InventoryEntry) =>
      e.name !== entry.name ? entry.name : entry
    );
  }
}
