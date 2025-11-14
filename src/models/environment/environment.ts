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
import EnvironmentEventContext from "./utils/environmentEventContext.js";
import EnvironmentEventResult from "./utils/environmentEventResult.js";
import environmentModel from "./utils/environmentModel.js";
import { randomUUID } from "crypto";
import Item from "../item/item.js";
import log from "../../utils/log.js";
import merge from "../../utils/merge.js";
import Serializable, {
  arrayOf,
  baseFields,
  defineField,
  dynamicArrayOf,
} from "../core/serializable.js";
import { ClassConstructor } from "../../utils/typeDescriptor.js";

interface RawEnvironment {
  _id: string;
  type: string;
  overviewMessageId: string;
  players: string[];
  items: Item[];
}

const v1 = defineField(baseFields, {
  add: {
    _id: { id: 0, type: String },
    type: { id: 1, type: String },
    overviewMessageId: { id: 2, type: String },
    players: { id: 3, type: arrayOf(String) },
    items: {
      id: 4,
      type: dynamicArrayOf(async (o) => {
        if (
          !o ||
          !(typeof o === "object") ||
          !("d" in o) ||
          !(typeof o.d === "object") ||
          !("2" in o.d!) ||
          !(typeof o.d[2] === "string")
        )
          return Item as unknown as ClassConstructor;
        const cls = await aeonix.items.loadRaw(o.d[2]);
        return cls ? cls : (Item as unknown as ClassConstructor);
      }),
    },
  },
});

export default abstract class Environment extends Serializable<RawEnvironment> {
  fields = [v1];
  migrators = [];

  _id: string;
  abstract type: string;
  abstract channelId: string;
  abstract name: string;
  abstract description: string;
  abstract adjacentEnvironments: string[];
  overviewMessageId: string = "";
  overviewMessage?: Message;
  players: string[] = [];
  items: Item[] = [];

  async commit(saveIntoCache = true): Promise<void> {
    if (saveIntoCache) aeonix.environments.set(this);

    const data = await aeonix.environments.onSave(this);

    await environmentModel.findByIdAndUpdate(this._id, merge({}, data), {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
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
      typeof environment === "string" ? environment : environment.type
    );
  }

  leave(player: Player) {
    if (this.onLeave) this.onLeave({ eventType: "leave", player });

    this.players = this.players.filter((p) => p !== player._id);
  }

  join(player: Player) {
    if (this.onJoin) this.onJoin({ eventType: "join", player });

    if (!this.players.includes(player._id)) this.players.push(player._id);
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
        `Players: ${this.players.length}\nItems: ${this.items.length}`
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

  constructor(id?: string) {
    super();
    this._id = id ?? randomUUID();
  }
}
