import { modelOptions, prop, Severity } from "@typegoose/typegoose";
import zlib from "zlib";
import { Binary } from "mongodb";
import type Player from "../player.js";

@modelOptions({
  schemaOptions: { collection: "players" },
  options: { allowMixed: Severity.ALLOW },
})
export default class PlayerStorage {
  @prop({ type: String, required: true })
  _id!: string;
  @prop({ default: Date.now(), type: Number })
  lastAccessed!: number;
  @prop({ default: 0, type: Number })
  dataVersion!: number;
  @prop({ type: Buffer, required: true })
  inboxCompressed!: Binary | Buffer;
  @prop({ type: Buffer, required: true })
  inventoryCompressed!: Binary | Buffer;
  @prop({ type: Buffer, required: true })
  locationCompressed!: Binary | Buffer;
  @prop({ type: Buffer, required: true })
  personaCompressed!: Binary | Buffer;
  @prop({ type: Buffer, required: true })
  questsCompressed!: Binary | Buffer;
  @prop({ type: Buffer, required: true })
  settingsCompressed!: Binary | Buffer;
  @prop({ type: Buffer, required: true })
  statsCompressed!: Binary | Buffer;
  @prop({ type: Buffer, required: true })
  statusEffectsCompressed!: Binary | Buffer;

  constructor(uncompressed: Player) {
    this._id = uncompressed._id;
    this.lastAccessed = uncompressed.lastAccessed;
    this.dataVersion = uncompressed.dataVersion;
    this.inboxCompressed = zlib.deflateSync(JSON.stringify(uncompressed.inbox));
    this.inventoryCompressed = zlib.deflateSync(
      JSON.stringify(uncompressed.inventory)
    );
    this.locationCompressed = zlib.deflateSync(
      JSON.stringify(uncompressed.location)
    );
    this.personaCompressed = zlib.deflateSync(
      JSON.stringify(uncompressed.persona)
    );
    this.questsCompressed = zlib.deflateSync(
      JSON.stringify(uncompressed.quests)
    );
    this.settingsCompressed = zlib.deflateSync(
      JSON.stringify(uncompressed.settings)
    );
    this.statsCompressed = zlib.deflateSync(JSON.stringify(uncompressed.stats));
    this.statusEffectsCompressed = zlib.deflateSync(
      JSON.stringify(uncompressed.statusEffects)
    );
  }
}
