import ConcreteConstructor from "../../../core/concreteConstructor.js";
import Item from "../../../item/item.js";
import { PlayerSubclassBase } from "../types/PlayerSubclassBase.js";

export default class Inventory extends PlayerSubclassBase {
  capacity: number = 10;
  entries: Item[] = [];

  add(...entries: Item[]): void {
    this.entries.push(...entries);
  }

  remove(entry: Item | string): void {
    if (typeof entry === "string") {
      this.entries = this.entries.filter((e: Item) => e.name !== entry);

      return;
    }

    this.entries = this.entries.filter((e: Item) => e.name != entry.name);
  }

  findOne(query: { key?: string; value: string }): Item | undefined {
    if (!query.key) query.key = "name";

    return this.entries.find(
      (e: Item) => e[query.key as keyof Item] === query.value
    );
  }

  find(query: { key?: string; value: string }): Item[] {
    if (!query.key) query.key = "name";

    return this.entries.filter(
      (e: Item) => e[query.key as keyof Item] === query.value
    );
  }

  clear(): void {
    this.entries = [];
  }

  getClassMap(): Record<string, new (...args: unknown[]) => unknown> {
    return {
      entries: Item as ConcreteConstructor<Item>,
    };
  }

  constructor(capacity: number = 20) {
    super();

    this.capacity = capacity;
  }
}
