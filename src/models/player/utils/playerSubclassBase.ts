import Serializable from "#core/serializable.js";
import Player from "#player/player.js";

export abstract class PlayerSubclassBase<
  T extends object
> extends Serializable<T> {
  static override excluded = ["parent"];
  override onDeserialize(data: T, parent?: object): void {
    this.parent = parent as Player;
  }

  parent: Player;

  constructor(parent: Player) {
    super();
    this.parent = parent;
  }
}
