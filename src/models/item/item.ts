import { randomUUID } from "node:crypto";
import ItemUsageContext from "./utils/itemUsageContext.js";
import ItemUsageResult from "./utils/itemUsageResult.js";
import ItemEventContext from "./utils/itemEventContext.js";
import ItemEventResult from "./utils/itemEventResult.js";

export default abstract class Item {
  private _id: string = "";
  abstract name: string;
  abstract type: string;
  abstract description: string;
  abstract weight: number;
  abstract value: number;
  abstract data: object;
  abstract useType: string;
  quantity: number = 1;

  abstract createData(): object;
  abstract use(context: ItemUsageContext): Promise<ItemUsageResult>;

  get id() {
    if (!this._id) this._id = randomUUID();
    return this._id;
  }

  set id(id: string) {
    this._id = id;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onDrop(context: ItemEventContext): ItemEventResult {
    return new ItemEventResult("", true);
  }
}
