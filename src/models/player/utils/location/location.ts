import { arrayOf, Fields } from "../../../core/serializable.js";
import Player from "../../player.js";
import { PlayerSubclassBase } from "../playerSubclassBase.js";

export interface RawLocation {
  id: string; // id
  channelId: string; // channelId
  adjacents: string[]; // adjacents
}

const v1: Fields<RawLocation> = {
  version: 1,
  shape: {
    id: { id: 0, type: String }, // id
    channelId: { id: 1, type: String }, // channelId
    adjacents: { id: 2, type: arrayOf(String) }, // adjacents
  },
};

export default class Location extends PlayerSubclassBase<RawLocation> {
  version = 1;
  fields = [v1];
  migrators = [];

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
