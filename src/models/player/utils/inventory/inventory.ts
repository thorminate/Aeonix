import ItemReference from "../../../item/utils/itemReference.js";
import { PlayerSubclassBase } from "../types/PlayerSubclassBase.js";

export interface IInventory {
  capacity: number;
  entries: ItemReference[];
}

export default class Inventory
  extends PlayerSubclassBase
  implements IInventory
{
  capacity: number = 10;
  entries: ItemReference[] = [];

  add(...entries: ItemReference[]): void {
    this.entries.push(...entries);
  }

  remove(entry: ItemReference | string): void {
    if (typeof entry === "string") {
      this.entries = this.entries.filter(
        (e: ItemReference) => e.name !== entry
      );

      return;
    }

    this.entries = this.entries.filter(
      (e: ItemReference) => e.name != entry.name
    );
  }

  findItem(query: { key?: string; value: string }): ItemReference | undefined {
    if (!query.key) query.key = "name";

    return this.entries.find(
      (e: ItemReference) => e[query.key as keyof ItemReference] === query.value
    );
  }

  findItems(query: { key?: string; value: string }): ItemReference[] {
    if (!query.key) query.key = "name";

    return this.entries.filter(
      (e: ItemReference) => e[query.key as keyof ItemReference] === query.value
    );
  }

  clear(): void {
    this.entries = [];
  }

  getClassMap(): Record<string, new (...args: any) => any> {
    return {
      entries: ItemReference,
    };
  }

  constructor(capacity: number = 20) {
    super();

    this.capacity = capacity;
  }
}
