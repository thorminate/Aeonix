import { PlayerSubclassBase } from "../types/playerSubclassBase.js";

export default class Settings extends PlayerSubclassBase {
  indexShowArchived: boolean = false;

  override getClassMap(): Record<string, new (...args: unknown[]) => unknown> {
    return {};
  }
}
