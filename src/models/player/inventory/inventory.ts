import Item from "../../item/item.js";

interface IInventoryEntry {
  name: string;
  id: string;
  quantity: number;
  data: object;
}

interface EntryQuery {
  key?: string;
  value: string;
}

interface IInventory {
  capacity: number;
  entries: InventoryEntry[];
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
    let content = {
      name: "",
      id: "",
      quantity: 0,
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
    if (pojo.hasOwnProperty("data")) {
      content.data = pojo.data;
    }
    return new InventoryEntry(
      content.name,
      content.id,
      content.quantity,
      content.data
    );
  }

  async toItem(): Promise<Item> {
    return await Item.find(this.id);
  }
}

export default class Inventory implements IInventory {
  private _capacity: number;
  private _entries: InventoryEntry[];

  public get capacity(): number {
    if (!this._capacity) {
      this._capacity = 20;
    }
    return this._capacity;
  }

  public set capacity(capacity: number) {
    this._capacity = capacity;
  }

  public get entries(): InventoryEntry[] {
    if (!this._entries) {
      this._entries = [];
      return this._entries as InventoryEntry[];
    }
    return new Proxy(this._entries, {
      get: (target, property, receiver) => {
        if (typeof property === "string" && !isNaN(Number(property))) {
          const raw = Reflect.get(target, property, receiver);

          return raw ? InventoryEntry.fromPOJO(raw) : raw;
        }

        const orig = Reflect.get(target, property, receiver);

        if (typeof orig === "function") {
          return function (...args: any[]) {
            return orig.apply(target, args);
          };
        }
      },
    });
  }

  public set entries(entries: InventoryEntry[]) {
    this._entries = entries;
  }

  add(entry: InventoryEntry): void {
    this.entries.push(entry);
  }

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

  findItem(query: EntryQuery): InventoryEntry | undefined {
    if (!query.key) query.key = "name";

    return this.entries.find(
      (e: InventoryEntry) => e[query.key] === query.value
    );
  }

  findItems(query: EntryQuery): InventoryEntry[] | [] {
    return this.entries.filter(
      (e: InventoryEntry) => e[query.key] === query.value
    );
  }
}
