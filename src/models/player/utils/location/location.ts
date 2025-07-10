import { PlayerSubclassBase } from "../types/PlayerSubclassBase.js";

export default class Location extends PlayerSubclassBase {
  id: string;
  channelId: string;

  getClassMap(): Record<string, new (...args: unknown[]) => unknown> {
    return {};
  }

  constructor(id: string = "", channelId: string = "") {
    super();

    this.id = id;
    this.channelId = channelId;
  }
}
