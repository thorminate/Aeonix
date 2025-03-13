export interface InventoryEntry {
  name: string;
  quantity: number;
  state: string;
}

export interface IInventory {
  capacity: number;
  entries: InventoryEntry[];
}

export default class Inventory implements IInventory {
  capacity: number;
  entries: InventoryEntry[];

  add(entry: InventoryEntry): void {
    this.entries.push(entry);
  }

  /**
   *
   * @param entry Takes in an InventoryEntry or a string, string searches and removes all entries with the same content as the string-
   * @returns Returns an array of the removed entries
   */
  remove(entry: InventoryEntry | string): InventoryEntry[] {
    if (typeof entry === "string") {
      const appliedEntries = this.entries.filter(
        (e: InventoryEntry) => e.name === entry
      );

      this.entries = this.entries.filter(
        (e: InventoryEntry) => e.name !== entry
      );
      return appliedEntries;
    }

    this.entries = this.entries.filter((e: InventoryEntry) =>
      e.name !== entry.name ? entry.name : entry
    );
  }
}
