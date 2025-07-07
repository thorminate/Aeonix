import { TextChannel } from "discord.js";
import aeonix from "../../index.js";
import Player from "../player/player.js";
import EnvironmentEventContext from "./utils/environmentEventContext.js";
import EnvironmentEventResult from "./utils/environmentEventResult.js";
import environmentModel from "./utils/environmentModel.js";
import hardMerge from "../../utils/hardMerge.js";
import { randomUUID } from "crypto";
import Item from "../item/item.js";
import log from "../../utils/log.js";
import ConcreteConstructor from "../core/concreteConstructor.js";

export default abstract class Environment {
  private _id: string = "";
  abstract type: string;
  abstract channelId: string;
  abstract name: string;
  abstract description: string;
  abstract adjacentEnvironments: string[];
  players: string[] = [];
  items: Item[] = [];

  get id() {
    if (!this._id) this._id = randomUUID();
    return this._id;
  }

  async commit(): Promise<void> {
    await environmentModel.findByIdAndUpdate(this.id, hardMerge({}, this), {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
  }

  async fetchChannel(): Promise<TextChannel | null> {
    return (await aeonix.channels
      .fetch(this.channelId, { force: true })
      .catch(() => null)) as TextChannel | null;
  }

  adjacentTo(environment: Environment | string): boolean {
    return this.adjacentEnvironments.includes(
      typeof environment === "string" ? environment : environment.id
    );
  }

  leave(player: Player) {
    if (this.onLeave) this.onLeave({ eventType: "leave", player });

    this.players = this.players.filter((p) => p !== player._id);
  }

  join(player: Player) {
    if (this.onJoin) this.onJoin({ eventType: "join", player });

    this.players.push(player._id);
  }

  dropItem(player: Player, item: Item) {
    if (this.onItemDrop) this.onItemDrop({ eventType: "drop", player, item });

    this.items.push(item);
  }

  pickUpItem(player: Player, id: Item | string): Item | undefined {
    const item =
      typeof id === "string" ? this.items.find((i) => i.id === id) : id;

    if (item) {
      if (this.onItemPickup)
        this.onItemPickup({ eventType: "pickup", player, item });
    }

    this.items = this.items.filter(
      (i) => i.id !== (typeof id === "string" ? id : id.id)
    );

    return item;
  }

  // Hooks & Events

  onJoin?(context: EnvironmentEventContext): EnvironmentEventResult;

  onLeave?(context: EnvironmentEventContext): EnvironmentEventResult;

  onItemDrop?(context: EnvironmentEventContext): EnvironmentEventResult;

  onItemPickup?(context: EnvironmentEventContext): EnvironmentEventResult;

  // Utility Methods

  async init() {
    // Make sure channel has a webhook

    const channel = await this.fetchChannel();

    if (!channel) {
      log({
        header: "Channel not found",
        processName: "Environment.init",
        payload: { this: this, channel, fetchChannel: this.fetchChannel },
        type: "Warn",
      });
      return;
    }

    const webhook = await channel.fetchWebhooks();

    if (webhook.size === 0) {
      await channel.createWebhook({
        name: this.name,
      });
    }
  }

  _getClassMap(): Record<string, new (...args: unknown[]) => unknown> {
    return {
      items: Item as ConcreteConstructor<Item>,
    };
  }

  abstract getClassMap(): Record<string, new (...args: unknown[]) => unknown>;

  getFullClassMap(): Record<string, new (...args: unknown[]) => unknown> {
    return {
      ...this._getClassMap(),
      ...this.getClassMap(),
    };
  }
}
