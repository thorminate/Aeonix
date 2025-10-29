import { modelOptions, prop, Severity } from "@typegoose/typegoose";
import zlib from "zlib";
import { encode } from "cbor2";
import { SerializedData } from "../../core/serializable.js";

@modelOptions({
  schemaOptions: { collection: "players" },
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
    this.d = zlib.deflateSync(encode(d));
  }
}
