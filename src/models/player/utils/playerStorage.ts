import { modelOptions, prop, Severity } from "@typegoose/typegoose";
import zlib from "zlib";
import RawPlayer from "./rawPlayer.js";
import { encode } from "cbor2";

@modelOptions({
  schemaOptions: { collection: "players" },
  options: { allowMixed: Severity.ALLOW },
})
export default class PlayerStorage {
  @prop({ type: String, required: true })
  _id!: string;
  @prop({ type: Buffer, required: true })
  p!: Buffer; // rawPlayer

  constructor({ _id, ...rest }: RawPlayer) {
    this._id = _id;
    this.p = zlib.deflateSync(encode(rest));
  }
}
