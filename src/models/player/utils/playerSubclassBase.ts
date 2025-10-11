import VersionedSerializable from "../../core/versionedSerializable.js";
import Player from "../player.js";

export abstract class PlayerSubclassBase<
  T extends object
> extends VersionedSerializable<T> {
  parent: Player;
  abstract getClassMap(): Record<string, new (...args: unknown[]) => unknown>;

  constructor(parent: Player) {
    super();
    this.parent = parent;
  }
}
