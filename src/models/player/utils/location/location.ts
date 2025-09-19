import { PlayerSubclassBase } from "../utils/playerSubclassBase.js";

export default class Location extends PlayerSubclassBase {
  id: string;
  channelId: string;
  adjacents: string[];

  getClassMap(): Record<string, new (...args: unknown[]) => unknown> {
    return {};
  }

  constructor(
    id: string = "",
    channelId: string = "",
    adjacents: string[] = []
  ) {
    super();

    this.id = id;
    this.channelId = channelId;
    this.adjacents = adjacents;
  }
}
