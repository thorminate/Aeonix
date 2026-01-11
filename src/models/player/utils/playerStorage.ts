import { modelOptions, prop, Severity } from "@typegoose/typegoose";
import { encode } from "cbor2";
import { SerializedData } from "#core/serializable.js";
import { deflateSync } from "zlib";

@modelOptions({
  schemaOptions: { collection: "players", versionKey: false },
  options: { allowMixed: Severity.ALLOW },
})
export default class PlayerStorage {
  @prop({ type: String, required: true })
  _id!: string;
  @prop({ type: Number, required: true })
  v!: number; // version
  @prop({ type: Buffer, required: true })
  d!: Buffer; // rawPlayer

  constructor({ _id, d, v }: SerializedData) {
    this._id = _id!;
    this.v = v!;
    this.d = deflateSync(encode(d));
  }
}
