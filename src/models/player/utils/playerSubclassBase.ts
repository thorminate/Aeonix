import Serializable from "../../core/serializable.js";
import Player from "../player.js";

export abstract class PlayerSubclassBase<
  T extends object
> extends Serializable<T> {
  parent: Player;
  override onDeserialize(data: T, parent?: object): void {
    this.parent = parent as Player;
  }
  override excluded = ["parent"];

  constructor(parent: Player) {
    super();
    this.parent = parent;
  }
}
