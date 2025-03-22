import {
  EntryQuery,
  IInventory,
  IInventoryEntry,
  InventoryEntry,
} from "./inventoryUtils.js";

export default class Inventory implements IInventory {
  private rawCapacity: number = 10;
  private rawEntries: InventoryEntry[] = [];

  public get capacity(): number {
    if (!this.rawCapacity) {
      this.rawCapacity = 20;
    }
    return this.rawCapacity;
  }

  public set capacity(capacity: number) {
    this.rawCapacity = capacity;
  }

  public get entries(): InventoryEntry[] {
    if (!Array.isArray(this.rawEntries)) {
      this.rawEntries = [];
    }

    this.rawEntries.forEach((entry: IInventoryEntry) => {
      if (!(entry instanceof InventoryEntry))
        entry = InventoryEntry.fromPOJO(entry);
    });

    return this.rawEntries;
  }

  public set entries(entries: InventoryEntry[]) {
    this.rawEntries = entries;
  }

  add(entry: InventoryEntry): void {
    this.rawEntries.push(entry);
  }

  remove(entry: InventoryEntry | string): void {
    if (typeof entry === "string") {
      this.rawEntries = this.entries.filter(
        (e: InventoryEntry) => e.name !== entry
      );

      return;
    }

    this.rawEntries = this.entries.filter(
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
    this.rawEntries = [];
  }

  constructor(capacity: number = 20) {
    this.rawCapacity = capacity;
  }
}
