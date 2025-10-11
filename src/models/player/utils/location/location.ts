import { arrayOf, FieldSchema } from "../../../core/versionedSerializable.js";
import Player from "../../player.js";
import { PlayerSubclassBase } from "../playerSubclassBase.js";

export interface RawLocation {
  id: string; // id
  channelId: string; // channelId
  adjacents: string[]; // adjacents
}

export default class Location extends PlayerSubclassBase<RawLocation> {
  version = 1;
  fields = {
    id: { id: 0, type: String }, // id
    channelId: { id: 1, type: String }, // channelId
    adjacents: { id: 2, type: arrayOf(String) }, // adjacents
  } satisfies FieldSchema<RawLocation>;

  id: string;
  channelId: string;
  adjacents: string[];

  getClassMap(): Record<string, new (...args: unknown[]) => unknown> {
    return {};
  }

  constructor(
    player: Player,
    id: string = "",
    channelId: string = "",
    adjacents: string[] = []
  ) {
    super(player);

    this.id = id;
    this.channelId = channelId;
    this.adjacents = adjacents;
  }
}
