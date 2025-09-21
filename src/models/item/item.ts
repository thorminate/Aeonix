import { randomUUID } from "node:crypto";
import ItemUsageResult from "./utils/itemUsageResult.js";
import ItemEventContext from "./utils/itemEventContext.js";
import ItemEventResult from "./utils/itemEventResult.js";
import Player from "../player/player.js";

export interface RawItem {
  0: string; // id
  1: string; // type
  2: number; // createdAt
  3: number; // quantity
  4: number; // weight
  5: number; // value
  6: object; // data
  7: boolean; // isInteracted
}

export default abstract class Item {
  id: string = randomUUID();
  abstract name: string;
  abstract type: string;
  abstract description: string;
  abstract weight: number;
  abstract value: number;
  abstract data: object;
  abstract interactionType: string;
  abstract interactable: boolean;
  abstract oneTimeInteraction: boolean;
  abstract canDrop: boolean;
  createdAt: number = Date.now();
  isInteracted: boolean = false;
  quantity: number = 1;

  abstract createData(): object;
  interact?(player: Player): Promise<ItemUsageResult>;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onDrop(context: ItemEventContext): ItemEventResult {
    return new ItemEventResult("", true);
  }

  toRaw(): RawItem {
    return {
      0: this.id,
      1: this.type,
      2: this.createdAt,
      3: this.quantity,
      4: this.weight,
      5: this.value,
      6: this.data,
      7: this.isInteracted,
    };
  }
}
