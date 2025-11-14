import { modelOptions, Severity, prop } from "@typegoose/typegoose";
import { encode } from "cbor2";
import { deflateSync } from "zlib";
import EnvironmentSerializedData from "./environmentSerializedData.js";

@modelOptions({
  schemaOptions: { collection: "environments" },
  options: { allowMixed: Severity.ALLOW },
})
export default class EnvironmentStorage {
  @prop({ type: String, required: true })
  _id!: string;
  @prop({ type: String, required: true })
  type!: string;
  @prop({ type: Number, required: true })
  v!: number; // version
  @prop({ type: Buffer, required: true })
  d!: Buffer; // rawPlayer

  constructor({ _id, type, d, v }: EnvironmentSerializedData) {
    this._id = _id!;
    this.type = type!;
    this.v = v!;
    this.d = deflateSync(encode(d));
  }
}
