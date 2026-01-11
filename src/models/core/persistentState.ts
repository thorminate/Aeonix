import { ClassConstructor } from "#root/utils/typeDescriptor.js";
import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import Serializable, {
  baseFields,
  defineField,
  SerializedData,
} from "./serializable.js";
import Time from "./time.js";
import { deflateSync, inflateSync } from "zlib";
import { decode, encode } from "cbor2";
import semibinaryToBuffer from "../player/utils/semibinaryToBuffer.js";

type RawPersistentState = {
  time: Time;
};

const v1 = defineField(baseFields, {
  add: {
    time: { id: 0, type: Time as ClassConstructor },
  },
});

export default class PersistentState extends Serializable<RawPersistentState> {
  static override fields = [v1];
  static override migrators = [];
  time = new Time(0, 0, 0, 0);

  async save() {
    const serialized = await this.serialize();
    const storage = new PersistentStateStorage(serialized);

    await persistentStateModel
      .findByIdAndUpdate("0", storage, { upsert: true })
      .lean();
  }

  static async fetch() {
    const state = (await persistentStateModel
      .findById("0")
      .lean()) as unknown as SerializedData;

    if (!state) {
      return new PersistentState();
    }

    const uncompressed = (() => {
      const uncompressed = decode(
        inflateSync(semibinaryToBuffer(state.d as Buffer))
      );
      const obj: SerializedData = {
        d: uncompressed,
        v: state.v,
      } as SerializedData;

      return obj;
    })();

    return PersistentState.deserialize(uncompressed);
  }
}

@modelOptions({ schemaOptions: { collection: "state", versionKey: false } })
export class PersistentStateStorage {
  @prop({ type: String, required: true })
  _id!: string;
  @prop({ type: Number, required: true })
  v!: number; // version
  @prop({ type: Buffer, required: true })
  d!: Buffer; // rawPlayer

  constructor({ d, v }: SerializedData) {
    this._id = "0";
    this.v = v!;
    this.d = deflateSync(encode(d));
  }
}

export const persistentStateModel = getModelForClass(PersistentStateStorage);
