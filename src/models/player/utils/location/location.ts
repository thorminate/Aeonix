import Player from "../../player.js";
import { PlayerSubclassBase } from "../playerSubclassBase.js";

export interface RawLocation {
  0: string; // id
  1: string; // channelId
  2: string[]; // adjacents
}

export default class Location extends PlayerSubclassBase {
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
