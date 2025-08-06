import { randomUUID } from "node:crypto";
import ItemUsageResult from "./utils/itemUsageResult.js";
import ItemEventContext from "./utils/itemEventContext.js";
import ItemEventResult from "./utils/itemEventResult.js";
import Player from "../player/player.js";

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
  isInteracted: boolean = false;
  quantity: number = 1;

  abstract createData(): object;
  interact?(player: Player): Promise<ItemUsageResult>;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onDrop(context: ItemEventContext): ItemEventResult {
    return new ItemEventResult("", true);
  }
}
