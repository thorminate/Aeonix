import {
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  Message,
  MessageCreateOptions,
  MessageFlags,
  SectionBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  TextChannel,
  TextDisplayBuilder,
} from "discord.js";
import aeonix from "../../index.js";
import Player from "../player/player.js";
import EnvironmentEventContext from "./environmentEvents/environmentEventContext.js";
import EnvironmentEventResult from "./environmentEvents/environmentEventResult.js";
import environmentModel from "./utils/environmentModel.js";
import Item from "../item/item.js";
import merge from "../../utils/merge.js";
import Serializable, {
  arrayOf,
  baseFields,
  defineField,
} from "../core/serializable.js";
import { ClassConstructor } from "../../utils/typeDescriptor.js";
import EnvironmentEventsManager, {
  EnvironmentEvents,
} from "./environmentEvents/environmentEvents.js";
import EnvironmentItems from "./environmentItems/environmentItems.js";

interface RawEnvironment {
  _id: string;
  lastAccessed: number;
  overviewMessageId: string;
  players: string[];
  items: EnvironmentItems;
}

const v1 = defineField(baseFields, {
  add: {
    _id: { id: 0, type: String },
    lastAccessed: { id: 1, type: Number },
    overviewMessageId: { id: 3, type: String },
    players: { id: 4, type: arrayOf(String) },
    items: {
      id: 5,
      type: EnvironmentItems as unknown as ClassConstructor,
      ctorArgs: (parent: unknown) => [parent as Environment],
    },
  },
});

export default abstract class Environment extends Serializable<RawEnvironment> {
  fields = [v1];
  migrators = [];

  abstract _id: string;
  lastAccessed: number = 0;
  abstract channelId: string;
  abstract name: string;
  abstract description: string;
  abstract adjacentEnvironments: string[];
  overviewMessageId: string = "";
  overviewMessage?: Message;
  players: string[] = [];
  items = new EnvironmentItems(this);
  isOverviewOnCooldown: boolean = false;

  _events = new EnvironmentEventsManager(this);

  override onDeserialize(): void {
    this._events.parent = this;
    this.items.parent = this;
  }

  async emit<T extends keyof EnvironmentEvents>(
    e: T,
    ...args: EnvironmentEvents[T]
  ): Promise<boolean> {
    return this._events.emit(e, ...args);
  }

  async commit(saveIntoCache = true): Promise<void> {
    if (saveIntoCache) aeonix.environments.set(this);

    const data = await aeonix.environments.onSave(this);

    await environmentModel.findByIdAndUpdate(this._id, merge({}, data), {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
  }

  async updateOverviewMessage(): Promise<Message | undefined> {
    if (this.isOverviewOnCooldown) return;

    this.isOverviewOnCooldown = true;
    const channel = await this.fetchChannel();
    if (!channel) {
      this.isOverviewOnCooldown = false;
      return;
    }

    const fetched = await channel.messages
      .fetch(this.overviewMessageId)
      .catch(() => undefined);

    [this.overviewMessage] = await Promise.all([
      channel.send(this.overview()),
      fetched?.delete(),
    ]);

    if (!this.overviewMessage.id) {
      aeonix.logger.error(
        "Environment.updateOverviewMessage",
        "Failed to update overview message, message could not be created",
        this.overviewMessage
      );
      this.isOverviewOnCooldown = false;
      return;
    }

    this.overviewMessageId = this.overviewMessage.id;

    setTimeout(() => (this.isOverviewOnCooldown = false), 10_000);

    return this.overviewMessage;
  }

  async fetchLastOverviewMessage(): Promise<Message | undefined> {
    if (!this.overviewMessageId) return undefined;

    const channel = await this.fetchChannel();
    if (!channel) return undefined;

    const fetched = await channel.messages
      .fetch(this.overviewMessageId)
      .catch(() => undefined);

    this.overviewMessage = fetched;
    return fetched;
  }

  async fetchChannel(): Promise<TextChannel | undefined> {
    return (await aeonix.channels
      .fetch(this.channelId, { force: true })
      .catch(() => undefined)) as TextChannel | undefined;
  }

  adjacentTo(environment: Environment | string): boolean {
    return this.adjacentEnvironments.includes(
      typeof environment === "string" ? environment : environment._id
    );
  }

  leave(player: Player) {
    if (this.onLeave) this.onLeave({ eventType: "leave", player });

    this.emit("playerLeft", player);

    this.players = this.players.filter((p) => p !== player._id);
  }

  join(player: Player) {
    if (this.onJoin) this.onJoin({ eventType: "join", player });

    this.emit("playerJoined", player);

    if (!this.players.includes(player._id)) this.players.push(player._id);
  }

  dropItem(player: Player, item: Item) {
    if (this.onItemDrop) this.onItemDrop({ eventType: "drop", player, item });

    this.emit("itemAdded", item, player);

    this.items.add(item);
  }

  pickUpItem(player: Player, id: Item | string): Item | undefined {
    const item =
      typeof id === "string" ? this.items.arr.find((i) => i.id === id) : id;

    if (!item) return;

    if (this.onItemPickup)
      this.onItemPickup({ eventType: "pickup", player, item });

    this.items.remove(item);

    this.emit("itemRemoved", item, player);

    return item;
  }

  overview(): MessageCreateOptions {
    const c = new ContainerBuilder();

    c.addSectionComponents(
      new SectionBuilder()
        .addTextDisplayComponents(
          new TextDisplayBuilder().setContent(
            `## ${this.name}\n${this.description}`
          )
        )
        .setButtonAccessory(
          new ButtonBuilder()
            .setCustomId(`env-inspect`)
            .setLabel("Inspect")
            .setStyle(ButtonStyle.Primary)
        )
    );
    c.addSeparatorComponents(
      new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small)
    );
    c.addTextDisplayComponents(
      new TextDisplayBuilder().setContent(
        `Players: ${this.players.length}\nItems: ${this.items.arr.length}`
      )
    );

    return {
      flags: MessageFlags.IsComponentsV2,
      components: [c],
    };
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
      aeonix.logger.warn("Environment.init", "Channel not found", {
        this: this,
        channel,
        fetchChannel: this.fetchChannel,
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
}
