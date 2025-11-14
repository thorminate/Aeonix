import { randomUUID } from "node:crypto";
import ItemUsageResult from "./utils/itemUsageResult.js";
import ItemEventResult from "./utils/itemEventResult.js";
import Player from "../player/player.js";
import Serializable, { baseFields, defineField } from "../core/serializable.js";

export interface RawItem {
  id: string; // id
  type: string; // type
  createdAt: number; // createdAt
  quantity: number; // quantity
  weight: number; // weight
  value: number; // value
  data: object; // data
  isInteracted: boolean; // isInteracted
}

const v1 = defineField(baseFields, {
  add: {
    id: { id: 1, type: String },
    type: { id: 2, type: String },
    createdAt: { id: 3, type: Number },
    quantity: { id: 4, type: Number },
    weight: { id: 5, type: Number },
    value: { id: 6, type: Number },
    data: { id: 7, type: Object },
    isInteracted: { id: 8, type: Boolean },
  },
});

export default abstract class Item<
  Data extends object = object
> extends Serializable<RawItem> {
  fields = [v1];
  migrators = [];

  id: string = randomUUID();
  abstract name: string;
  abstract type: string;
  abstract description: string;
  abstract weight: number;
  abstract value: number;
  abstract interactionType: string;
  abstract interactable: boolean;
  abstract oneTimeInteraction: boolean;
  abstract canDrop: boolean;

  createdAt: number = Date.now();
  isInteracted: boolean = false;
  quantity: number = 1;
  data: Data;

  onInteract?(player: Player): Promise<ItemUsageResult>;
  onDrop?(player: Player): Promise<ItemEventResult>;

  async drop(player: Player): Promise<ItemEventResult> {
    const result = await this.onDrop?.(player);
    await player.emit("inventoryItemDropped", this);
    return result || new ItemEventResult("You dropped the item!", true);
  }

  async use(player: Player): Promise<ItemUsageResult> {
    this.isInteracted = true;
    const result = await this.onInteract?.(player);
    await player.emit("inventoryItemUsed", this);
    return result || new ItemUsageResult("You used the item!", true);
  }

  constructor(data?: Data) {
    super();
    this.data = data || ({} as Data);
  }
}
