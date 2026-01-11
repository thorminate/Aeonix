import aeonix from "#root/index.js";
import {
  ClassConstructor,
  arrayOf,
  dynamicType,
} from "#utils/typeDescriptor.js";
import { baseFields, defineField, SerializedData } from "#core/serializable.js";
import Item, { RawItem } from "#item/item.js";
import Player from "#player/player.js";
import { PlayerSubclassBase } from "#player/utils/playerSubclassBase.js";

export interface RawInventory {
  arr: RawItem[]; // entries
  capacity: number; // capacity
}

const v1 = defineField(baseFields, {
  add: {
    entries: {
      id: 0,
      type: arrayOf(
        dynamicType(async (o: SerializedData) => {
          if (
            !o ||
            !(typeof o === "object") ||
            !("d" in o) ||
            !(typeof o.d === "object") ||
            !("1" in o.d!) ||
            !(typeof o.d[1] === "string")
          )
            return Item as unknown as ClassConstructor;
          const cls = await aeonix.items.loadRaw(o.d[1]);
          return cls ? cls : (Item as unknown as ClassConstructor);
        })
      ),
    },
    capacity: { id: 1, type: Number },
  },
});

export default class Inventory extends PlayerSubclassBase<RawInventory> {
  static override fields = [v1];
  static override migrators = [];

  capacity: number = 10;
  arr: Item[] = [];

  add(...entries: Item[]): void {
    for (const entry of entries) {
      this.arr.push(entry);
      this.parent.emit("inventoryItemAdded", entry);
    }
  }

  remove(entry: Item | string): void {
    if (typeof entry === "string") {
      this.arr = this.arr.filter((e: Item) => e.name !== entry);

      return;
    }

    this.parent.emit("inventoryItemRemoved", entry);

    this.arr = this.arr.filter((e: Item) => e.name != entry.name);
  }

  findOne(query: { key?: string; value: string }): Item | undefined {
    if (!query.key) query.key = "name";

    return this.arr.find(
      (e: Item) => e[query.key as keyof Item] === query.value
    );
  }

  find(query: { key?: string; value: string }): Item[] {
    if (!query.key) query.key = "name";

    return this.arr.filter(
      (e: Item) => e[query.key as keyof Item] === query.value
    );
  }

  clear(): void {
    for (const entry of this.arr)
      this.parent.emit("inventoryItemRemoved", entry);

    this.arr = [];
  }

  constructor(player: Player, capacity: number = 20) {
    super(player);

    this.capacity = capacity;
  }
}
