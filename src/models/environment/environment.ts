import { TextChannel } from "discord.js";
import aeonix from "../../aeonix.js";
import ItemReference from "../item/utils/itemReference.js";
import Player from "../player/player.js";
import EnvironmentEventContext from "./utils/environmentEventContext.js";
import EnvironmentEventResult from "./utils/environmentEventResult.js";
import environmentModel from "./utils/environmentModel.js";

type ItemReferenceV2 = ItemReference | string;

export default abstract class Environment {
  abstract id: string;
  abstract channelId: string;
  abstract name: string;
  abstract description: string;
  abstract adjacentEnvironments: string[];
  players: string[] = [];
  items: ItemReference[] = [];

  async save(): Promise<void> {
    await environmentModel.findByIdAndUpdate(this.id, this.toSaveablePOJO(), {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
  }

  async fetchChannel(): Promise<TextChannel | null> {
    return (
      ((await aeonix.channels.fetch(this.channelId)) as TextChannel | null) ||
      null
    );
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

  dropItem(player: Player, item: ItemReference) {
    if (this.onItemDrop) this.onItemDrop({ eventType: "drop", player, item });

    this.items.push(item);
  }

  pickUpItem(player: Player, id: ItemReferenceV2): ItemReference | undefined {
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

    const webhook = await (channel as TextChannel).fetchWebhooks();

    if (webhook.size === 0) {
      await (channel as TextChannel).createWebhook({
        name: this.name,
      });
    }
  }

  toSaveablePOJO(): Record<string, any> {
    const result: Record<string, any> = {};
    let current: any = this;

    while (current && current !== Object.prototype) {
      for (const key of Object.getOwnPropertyNames(current)) {
        if (
          key === "constructor" ||
          typeof (this as any)[key] === "function" ||
          key.startsWith("_")
        ) {
          continue;
        }

        if (!(key in result)) {
          result[key] = (this as any)[key];
        }
      }

      current = Object.getPrototypeOf(current);
    }

    delete result.id;

    return result;
  }

  _getClassMap(): Record<string, new (...args: any) => any> {
    return {
      items: ItemReference,
    };
  }

  abstract getClassMap(): Record<string, new (...args: any) => any>;

  getFullClassMap(): Record<string, new (...args: any) => any> {
    return {
      ...this._getClassMap(),
      ...this.getClassMap(),
    };
  }

  get _id() {
    return this.id;
  }

  set _id(id: string) {
    this.id = id;
  }
}
