import { arrayOf } from "#utils/typeDescriptor.js";
import { baseFields, defineField } from "#core/serializable.js";
import Player from "#player/player.js";
import { PlayerSubclassBase } from "#player/utils/playerSubclassBase.js";

export interface RawLocation {
  id: string; // id
  channelId: string; // channelId
  adjacents: string[]; // adjacents
}

const v1 = defineField(baseFields, {
  add: {
    id: { id: 0, type: String },
    channelId: { id: 1, type: String },
    adjacents: { id: 2, type: arrayOf(String) },
  },
});

export default class Location extends PlayerSubclassBase<RawLocation> {
  static override fields = [v1];
  static override migrators = [];

  id: string;
  channelId: string;
  adjacents: string[];

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
