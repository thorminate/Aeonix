import { modelOptions, Severity, prop } from "@typegoose/typegoose";
import { encode } from "cbor2";
import { deflateSync } from "zlib";
import { SerializedData } from "#core/serializable.js";

@modelOptions({
  schemaOptions: { collection: "environments", versionKey: false },
  options: { allowMixed: Severity.ALLOW },
})
export default class EnvironmentStorage {
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
