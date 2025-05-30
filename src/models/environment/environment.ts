import { TextChannel } from "discord.js";
import aeonix from "../../aeonix.js";
import ItemReference from "../item/utils/itemReference.js";
import Player from "../player/player.js";
import EnvironmentEventContext from "./utils/environmentEventContext.js";
import EnvironmentEventResult from "./utils/environmentEventResult.js";
import environmentModel from "./utils/environmentModel.js";

export default abstract class Environment {
  abstract id: string;
  abstract channelId: string;
  abstract name: string;
  abstract description: string;
  players: string[] = [];
  adjacentEnvironments: string[] = [];
  items: ItemReference[] = [];

  toObject(): Record<string, any> {
    const plain = {} as Record<string, any>;

    for (const key of Object.keys(this)) {
      const value = (this as any)[key];
      if (typeof value !== "function") {
        plain[key] = value;
      }
    }

    return plain;
  }

  get _id() {
    return this.id;
  }

  async save(): Promise<void> {
    await environmentModel.findByIdAndUpdate(this.id, this.toObject(), {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
  }

  // Methods
  async fetchChannel() {
    return (await aeonix.channels.fetch(this.channelId)) || undefined;
  }

  async init() {
    // Make sure channel has a webhook

    const channel = await this.fetchChannel();

    const webhook = await (channel as TextChannel).fetchWebhooks();

    if (webhook.size === 0) {
      await (channel as TextChannel).createWebhook({
        name: this.name,
      });
    }
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
