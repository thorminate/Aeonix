import { randomUUID } from "crypto";
import Player from "../../player.js";
import { AnyQuestEvent } from "./questEvents.js";
import Serializable, { Fields } from "../../../core/serializable.js";

export interface RawQuest {
  id: string; // id
  type: string; // type
  completed: boolean; // completed
  data?: object | undefined; // data
}

const v1: Fields<RawQuest> = {
  version: 1,
  shape: {
    id: { id: 0, type: String },
    type: { id: 1, type: String },
    completed: { id: 2, type: Boolean },
    data: { id: 3, type: Object },
  },
};

export default abstract class Quest<
  Data extends object = object
> extends Serializable<RawQuest> {
  version: number = 1;
  fields = [v1];
  migrators = [];

  id: string = randomUUID();
  abstract type: string;
  abstract name: string;
  abstract description: string;
  completed: boolean = false;
  data?: Data;

  constructor(data?: Data) {
    super();
    this.data = data;
  }

  async fulfill(player: Player) {
    this.completed = true;

    if (this.onFulfill) this.onFulfill(player);
  }

  abstract onEvent(event: AnyQuestEvent, player: Player): void;

  abstract onFulfill(player: Player): void;
}
