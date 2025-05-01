import deepInstantiate from "../../utils/deepInstantiate.js";
import InventoryEntry from "./utils/inventoryEntry.js";

export interface IInventory {
  capacity: number;
  entries: InventoryEntry[];
}

export default class Inventory implements IInventory {
  private _capacity: number = 10;
  private _entries: InventoryEntry[] = [];

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
    if (!Array.isArray(this._entries)) {
      this._entries = [];
    }

    this._entries = this._entries.map((entry: InventoryEntry) => {
      entry = deepInstantiate(new InventoryEntry(), entry);
      return entry;
    });

    return this._entries;
  }

  public set entries(entries: InventoryEntry[]) {
    this._entries = entries;
  }

  add(...entries: InventoryEntry[]): void {
    this._entries.push(...entries);
  }

  remove(entry: InventoryEntry | string): void {
    if (typeof entry === "string") {
      this._entries = this.entries.filter(
        (e: InventoryEntry) => e.name !== entry
      );

      return;
    }

    this._entries = this.entries.filter(
      (e: InventoryEntry) => e.name != entry.name
    );
  }

  findItem(query: { key?: string; value: string }): InventoryEntry | undefined {
    if (!query.key) query.key = "name";

    return this.entries.find(
      (e: InventoryEntry) =>
        e[query.key as keyof InventoryEntry] === query.value
    );
  }

  findItems(query: { key?: string; value: string }): InventoryEntry[] {
    if (!query.key) query.key = "name";

    return this.entries.filter(
      (e: InventoryEntry) =>
        e[query.key as keyof InventoryEntry] === query.value
    );
  }

  clear(): void {
    this._entries = [];
  }

  constructor(capacity: number = 20) {
    this._capacity = capacity;
  }
}
