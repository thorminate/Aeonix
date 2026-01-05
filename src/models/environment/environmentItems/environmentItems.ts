import Item from "#item/item.js";
import Environment from "#environment/environment.js";
import Serializable, { baseFields, defineField } from "#core/serializable.js";
import aeonix from "#root/index.js";
import {
  ClassConstructor,
  arrayOf,
  dynamicType,
} from "#utils/typeDescriptor.js";

interface RawEnvironmentItems {
  arr: Item[];
}

const v1 = defineField(baseFields, {
  add: {
    arr: {
      id: 0,
      type: arrayOf(
        dynamicType(async (o) => {
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
        })
      ),
    },
  },
});

export default class EnvironmentItems extends Serializable<RawEnvironmentItems> {
  fields = [v1];
  migrators = [];

  arr: Item[] = [];
  parent: Environment | null = null;

  constructor(parent?: Environment) {
    super();
    if (parent) this.parent = parent;
  }

  add(item: Item) {
    if (this.parent === null) {
      aeonix.logger.error(
        "EnvironmentItems.add",
        "No parent set for EnvironmentItems"
      );
      return;
    }
    this.arr.push(item);
    this.parent.emit("itemAdded", item);
  }

  remove(item: Item) {
    if (this.parent === null) {
      aeonix.logger.error(
        "EnvironmentItems.remove",
        "No parent set for EnvironmentItems"
      );
      return;
    }
    this.arr = this.arr.filter((i) => i.id !== item.id);
    this.parent.emit("itemRemoved", item);
  }

  clear() {
    if (this.parent === null) {
      aeonix.logger.error(
        "EnvironmentItems.clear",
        "No parent set for EnvironmentItems"
      );
      return;
    }

    for (const item of this.arr) this.parent.emit("itemRemoved", item);

    this.arr = [];
  }
}
