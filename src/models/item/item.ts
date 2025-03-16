import Player from "../player/Player.js";
import Registrable from "../utils/Registrable.js";
import { InventoryEntry } from "../player/inventory/inventory.js";

export class ItemUsageContext {
  player: Player;
}

export default abstract class Item extends Registrable<typeof this> {
  abstract name: string;
  abstract description: string;
  abstract weight: number;
  abstract value: number;
  abstract data: object;
  abstract id: string;

  abstract createData(): object;

  async use(context: ItemUsageContext): Promise<void> {
    throw new Error("Method not implemented.");
  }

  toInventoryEntry(): InventoryEntry {
    const entry = new InventoryEntry(this.name, null, this.weight, this.data);

    entry.id = entry.constructor.name;

    return entry;
  }

  getRegistryLocation(): string {
    return "dist/models/content/items";
  }

  getIdentifier(): { key: string; value: string } {
    return {
      key: "name",
      value: this.id,
    };
  }

  constructor() {
    super();
  }
}
