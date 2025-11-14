import { randomUUID } from "crypto";
import Player from "../../player.js";
import Serializable, {
  baseFields,
  defineField,
} from "../../../core/serializable.js";
import { AnyPlayerEvent } from "../playerEvents.js";

export interface RawQuest {
  id: string; // id
  type: string; // type
  completed: boolean; // completed
  data?: object | undefined; // data
}

const v1 = defineField(baseFields, {
  add: {
    id: { id: 1, type: String },
    type: { id: 2, type: String },
    completed: { id: 5, type: Boolean },
    data: { id: 6, type: Object },
  },
});

export default abstract class Quest<
  Data extends Record<string, unknown> = Record<string, unknown>
> extends Serializable<RawQuest> {
  fields = [v1];
  migrators = [];

  abstract createData(): Data;

  id: string = randomUUID();
  abstract type: string;
  abstract name: string;
  abstract description: string;
  completed: boolean = false;
  data: Data;

  constructor(data?: Data) {
    super();
    this.data = data || this.createData();
  }

  async fulfill(player: Player) {
    this.completed = true;

    await player.emit("questFulfilled", this);

    if (this.onFulfill) this.onFulfill(player);
  }

  async fail(player: Player) {
    await player.emit("questFailed", this);

    if (this.onFail) this.onFail(player);
  }

  abstract onFulfill(player: Player): void;

  abstract onFail(player: Player): void;

  abstract onEvent(event: AnyPlayerEvent): void;
}
