import aeonix from "../../../../index.js";
import { ClassConstructor } from "../../../../utils/typeDescriptor.js";
import { dynamicArrayOf, SerializedData } from "../../../core/serializable.js";
import Item, { RawItem } from "../../../item/item.js";
import Player from "../../player.js";
import { PlayerSubclassBase } from "../playerSubclassBase.js";

export interface RawInventory {
  entries: RawItem[]; // entries
  capacity: number; // capacity
}

const v1 = {
  version: 1,
  shape: {
    entries: {
      id: 0,
      type: dynamicArrayOf(async (o: SerializedData) => {
        if (
          !o ||
          !(typeof o === "object") ||
          !("d" in o) ||
          !(typeof o.d === "object") ||
          !("2" in o.d!) ||
          !(typeof o.d[2] === "string")
        )
          return Item as unknown as ClassConstructor;
        const cls = await aeonix.items.loadRaw(o.d[2]);
        return cls ? cls : (Item as unknown as ClassConstructor);
      }),
    },
    capacity: { id: 1, type: Number },
  },
};

export default class Inventory extends PlayerSubclassBase<RawInventory> {
  version = 1;
  fields = [v1];
  migrators = [];

  capacity: number = 10;
  entries: Item[] = [];

  add(...entries: Item[]): void {
    for (const entry of entries) {
      this.entries.push(entry);
      this.parent.quests.callEvent({ type: "inventoryAdd", args: [entry] });
    }
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

  constructor(player: Player, capacity: number = 20) {
    super(player);

    this.capacity = capacity;
  }
}
