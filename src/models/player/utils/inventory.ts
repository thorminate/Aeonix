import hardMerge from "../../../utils/hardMerge.js";
import ItemReference from "../../item/utils/itemReference.js";

export interface IInventory {
  capacity: number;
  entries: ItemReference[];
}

export default class Inventory implements IInventory {
  private _capacity: number = 10;
  private _entries: ItemReference[] = [];

  public get capacity(): number {
    if (!this._capacity) {
      this._capacity = 20;
    }
    return this._capacity;
  }

  public set capacity(capacity: number) {
    this._capacity = capacity;
  }

  public get entries(): ItemReference[] {
    if (!Array.isArray(this._entries)) {
      this._entries = [];
    }

    this._entries = this._entries.map((entry: ItemReference) => {
      entry = hardMerge(new ItemReference(), entry);
      return entry;
    });

    return this._entries;
  }

  public set entries(entries: ItemReference[]) {
    this._entries = entries;
  }

  add(...entries: ItemReference[]): void {
    this._entries.push(...entries);
  }

  remove(entry: ItemReference | string): void {
    if (typeof entry === "string") {
      this._entries = this.entries.filter(
        (e: ItemReference) => e.name !== entry
      );

      return;
    }

    this._entries = this.entries.filter(
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
    this._entries = [];
  }

  constructor(capacity: number = 20) {
    this._capacity = capacity;
  }
}
