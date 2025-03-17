import Player from "../player/Player.js";
import Registrable from "../utils/Registrable.js";
import { InventoryEntry } from "../player/inventory/inventory.js";

export class ItemUsageContext {
  player: Player;
}

export class ItemUsageResult {
  message: string;
  success: boolean;
  data;

  constructor(message: string, success: boolean) {
    this.message = message;
    this.success = success;
  }
}

export default abstract class Item extends Registrable<typeof this> {
  abstract name: string;
  abstract description: string;
  abstract weight: number;
  abstract value: number;
  abstract data: object;
  abstract id: string;
  abstract useType: string;

  abstract createData(): object;

  abstract use(context: ItemUsageContext): Promise<ItemUsageResult>;

  toInventoryEntry<T extends Item>(this: T): InventoryEntry {
    return new InventoryEntry(this.name, this.id, this.weight, this.data);
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
