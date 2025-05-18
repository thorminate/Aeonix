import aeonix from "../../aeonix.js";
import Saveable from "../core/saveable.js";
import ItemReference from "../item/utils/itemReference.js";
import Player from "../player/player.js";
import EnvironmentDocument from "./utils/environmentDocument.js";
import EnvironmentEventContext from "./utils/environmentEventContext.js";
import EnvironmentEventResult from "./utils/environmentEventResult.js";
import environmentModel from "./utils/environmentModel.js";

export class SaveableEnvironment extends Saveable<EnvironmentDocument> {
  id = "";
  channelId = "";
  name = "";
  description = "";
  players: string[] = [];
  adjacentEnvironments: string[] = [];
  items: ItemReference[] = [];

  override _id: string = this.id;

  protected override getModel() {
    return environmentModel;
  }
  protected override getClassMap(): Record<string, object> {
    return {};
  }

  static getModel() {
    return environmentModel;
  }

  constructor() {
    super();
  }
}

export default abstract class Environment {
  abstract id: string;
  abstract channelId: string;
  abstract name: string;
  abstract description: string;
  players: string[] = [];
  adjacentEnvironments: string[] = [];
  items: ItemReference[] = [];

  // Methods
  async fetchChannel() {
    return await aeonix.channels.fetch(this.channelId);
  }

  leave(player: Player) {
    if (this.onLeave) this.onLeave({ eventType: "leave", player });

    this.players = this.players.filter((p) => p !== player._id);
  }

  join(player: Player) {
    if (this.onJoin) this.onJoin({ eventType: "join", player });

    this.players.push(player._id);
  }

  dropItem(player: Player, item: ItemReference) {
    if (this.onItemDrop) this.onItemDrop({ eventType: "drop", player, item });

    this.items.push(item);
  }

  pickUpItem(player: Player, item: ItemReference) {
    if (this.onItemPickup)
      this.onItemPickup({ eventType: "pickup", player, item });

    this.items = this.items.filter((i) => i.id !== item.id);
  }

  // Hooks & Events

  onJoin?(context: EnvironmentEventContext): EnvironmentEventResult;

  onLeave?(context: EnvironmentEventContext): EnvironmentEventResult;

  onItemDrop?(context: EnvironmentEventContext): EnvironmentEventResult;

  onItemPickup?(context: EnvironmentEventContext): EnvironmentEventResult;
}
