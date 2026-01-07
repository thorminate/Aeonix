import { randomUUID } from "crypto";
import Player from "#player/player.js";
import Serializable, {
  baseFields,
  defineField,
  SerializerError,
} from "#core/serializable.js";
import { AnyPlayerEvent } from "#player/utils/playerEvents.js";

export interface RawQuest {
  id: string; // id
  type: string; // type
  completed: boolean; // completed
  data?: object | undefined; // data
}

const v1 = defineField(baseFields, {
  add: {
    id: { id: 0, type: String },
    type: { id: 1, type: String },
    completed: { id: 2, type: Boolean },
    data: { id: 3, type: Object },
  },
});

export default abstract class Quest<
  Data extends Record<string, unknown> = Record<string, unknown>
> extends Serializable<RawQuest> {
  fields = [v1];
  migrators = [];
  static override requiredFields = [
    "type",
    "name",
    "description",
    "onFulfill",
    "onFail",
    "onEvent",
  ];

  abstract createData(): Data;

  id = randomUUID();
  abstract type: string;
  abstract name: string;
  abstract description: string;
  completed = false;
  data: Data;

  constructor(data?: Data) {
    super();
    this.data = data || this.createData ? this.createData() : ({} as Data);
  }

  override onDeserialize() {
    if (!this.data && this.createData) {
      this.data = this.createData();
    }

    if (typeof this.onEvent !== "function") {
      throw new SerializerError(
        this.constructor.name,
        "Quest.onDeserialize",
        `Quest ${this.type} missing onEvent method after deserialization`,
        { this: this }
      );
    }
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
