import {
  EntryQuery,
  IInventory,
  IInventoryEntry,
  InventoryEntry,
} from "./inventoryUtils.js";

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

    this._entries.forEach((entry: IInventoryEntry) => {
      if (!(entry instanceof InventoryEntry))
        entry = InventoryEntry.fromPOJO(entry);
    });

    return this._entries;
  }

  public set entries(entries: InventoryEntry[]) {
    this._entries = entries;
  }

  add(entry: InventoryEntry): void {
    this._entries.push(entry);
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

  findItem(query: EntryQuery): InventoryEntry | undefined {
    if (!query.key) query.key = "name";

    return this.entries.find(
      (e: InventoryEntry) => e[query.key] === query.value
    );
  }

  findItems(query: EntryQuery): InventoryEntry[] | [] {
    if (!query.key) query.key = "name";

    return this.entries.filter(
      (e: InventoryEntry) => e[query.key] === query.value
    );
  }

  clear(): void {
    this._entries = [];
  }

  constructor(capacity: number = 20) {
    this._capacity = capacity;
  }
}
