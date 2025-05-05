import aeonix from "../../aeonix.js";
import ItemReference from "../item/utils/itemReference.js";
import Player from "../player/player.js";
import EnvironmentEventContext from "./utils/environmentEventContext.js";
import EnvironmentEventResult from "./utils/environmentEventResult.js";

export default abstract class Environment {
  abstract id: string;
  abstract channelId: string;
  abstract name: string;
  abstract description: string;
  abstract players: string[];
  abstract adjacentEnvironments: string[];
  abstract items: ItemReference[];

  join(player: Player) {
    player.location = this.id;
    this.players.push(player._id);

    player.save();
    return player;
  }

  async fetchChannel() {
    return await aeonix.channels.fetch(this.channelId);
  }

  onEnter(context: EnvironmentEventContext): EnvironmentEventResult {
    context.player.location = this.id;
    return new EnvironmentEventResult("You enter " + this.name, true);
  }

  onItemDrop(
    context: EnvironmentEventContext<ItemReference>
  ): EnvironmentEventResult {
    return new EnvironmentEventResult("" + context.extraContext.name, true);
  }
}

export class TemplateEnvironment extends Environment {
  id: string = "";
  channelId: string = "";
  name: string = "";
  description: string = "";
  players: string[] = [];
  adjacentEnvironments: string[] = [];
  items: ItemReference[] = [];
}
