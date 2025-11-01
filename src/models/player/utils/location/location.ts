import {
  arrayOf,
  baseFields,
  defineField,
} from "../../../core/serializable.js";
import Player from "../../player.js";
import { PlayerSubclassBase } from "../playerSubclassBase.js";

export interface RawLocation {
  id: string; // id
  channelId: string; // channelId
  adjacents: string[]; // adjacents
}

const v1 = defineField(baseFields, {
  add: {
    id: { id: 1, type: String },
    channelId: { id: 2, type: String },
    adjacents: { id: 3, type: arrayOf(String) },
  },
});

export default class Location extends PlayerSubclassBase<RawLocation> {
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
