import Stats, { RawStats } from "./utils/stats/stats.js";
import {
  APIContainerComponent,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  DMChannel,
  GuildChannel,
  GuildMemberRoleManager,
  MessageFlags,
  OverwriteType,
  SectionBuilder,
  SeparatorBuilder,
  SeparatorSpacingSize,
  TextChannel,
  TextDisplayBuilder,
  User,
} from "discord.js";
import Inventory, { RawInventory } from "./utils/inventory/inventory.js";
import calculateXpRequirement from "./utils/stats/calculateXpRequirement.js";
import aeonix from "../../index.js";
import log from "../../utils/log.js";
import PlayerMoveToResult from "./utils/playerMoveToResult.js";
import Inbox, { RawInbox } from "./utils/inbox/inbox.js";
import Location, { RawLocation } from "./utils/location/location.js";
import Persona, { RawPersona } from "./utils/persona/persona.js";
import StatusEffects, {
  RawStatusEffects,
} from "./utils/statusEffects/statusEffects.js";
import merge from "../../utils/merge.js";
import Quests, { RawQuests } from "./utils/quests/quests.js";
import Settings, { RawSettings } from "./utils/settings/settings.js";
import PlayerRef from "./utils/playerRef.js";
import idToType from "../../utils/idToType.js";
import environmentModel from "../environment/utils/environmentModel.js";
import { Model } from "mongoose";
import Environment from "../environment/environment.js";
import formatNotification from "./utils/inbox/formatNotification.js";
import Notification from "../../content/letters/notification/notification.js";
import { PlayerCreationOptions } from "../../managers/playerManager.js";
import playerModel from "./utils/playerModel.js";
import isSerializedData from "./utils/isSerializedData.js";
import Serializable, {
  baseFields,
  defineField,
  SerializedData,
} from "../core/serializable.js";
import ConcreteConstructor from "../core/concreteConstructor.js";

export interface RawPlayer {
  _id: string;
  lastAccessed: number;
  inbox: RawInbox;
  inventory: RawInventory;
  location: RawLocation;
  persona: RawPersona;
  quests: RawQuests;
  settings: RawSettings;
  stats: RawStats;
  statusEffects: RawStatusEffects;
}

const v1 = defineField(baseFields, {
  add: {
    _id: { id: 1, type: String },
    lastAccessed: { id: 2, type: Number },
    inbox: { id: 3, type: Inbox as ConcreteConstructor<Inbox> },
    inventory: {
      id: 4,
      type: Inventory as ConcreteConstructor<Inventory>,
    },
    location: {
      id: 5,
      type: Location as ConcreteConstructor<Location>,
    },
    persona: {
      id: 6,
      type: Persona as ConcreteConstructor<Persona>,
    },
    quests: { id: 7, type: Quests as ConcreteConstructor<Quests> },
    settings: {
      id: 8,
      type: Settings as ConcreteConstructor<Settings>,
    },
    stats: { id: 9, type: Stats as ConcreteConstructor<Stats> },
    statusEffects: {
      id: 10,
      type: StatusEffects as ConcreteConstructor<StatusEffects>,
    },
  },
});

export default class Player extends Serializable<RawPlayer> {
  fields = [v1];
  migrators = [];

  _id!: string;
  lastAccessed!: number;

  inbox!: Inbox;
  inventory!: Inventory;
  location!: Location;
  persona!: Persona;
  quests!: Quests;
  settings!: Settings;
  stats!: Stats;
  statusEffects!: StatusEffects;

  user?: User;
  environment?: Environment;
  environmentChannel?: TextChannel;
  dmChannel?: DMChannel;

  async fetchUser() {
    return aeonix.users.cache.get(this._id);
  }
  async fetchEnvironmentChannel() {
    return aeonix.channels.cache.get(this.location.channelId) as
      | TextChannel
      | undefined;
  }
  async fetchEnvironment() {
    return aeonix.environments.get(this.location.id);
  }

  async moveTo(
    id: string,
    isType = false,
    disregardAdjacents = false,
    disregardAlreadyHere = false,
    disregardOldEnvironment = false
  ): Promise<PlayerMoveToResult> {
    const location = isType
      ? id
      : await idToType(
          id,
          environmentModel as unknown as Model<{ _id: string; type: string }>
        );
    if (this.location.id === location && !disregardAlreadyHere)
      return "already here";

    const env = await aeonix.environments.get(location);
    if (!env) return "invalid location";

    const channel = await env.fetchChannel();
    if (!channel || !(channel instanceof GuildChannel))
      return "location channel not found";

    const oldEnv = await this.fetchEnvironment().catch(() => undefined);

    if (
      !(await channel.permissionOverwrites
        .create(
          this._id,
          {
            ViewChannel: true,
          },
          {
            reason: "Moving player",
            type: OverwriteType.Member,
          }
        )
        .catch(() => undefined))
    ) {
      log({
        header: "Failed to create permission overwrite",
        processName: "Player.moveTo",
        type: "Warn",
      });
      return "failed to create permission overwrite";
    }

    if (oldEnv) {
      if (!oldEnv.adjacentTo(env) && !disregardAdjacents) return "not adjacent";

      const oldChannel = await oldEnv.fetchChannel();
      if (oldChannel && oldChannel instanceof GuildChannel) {
        await oldChannel.permissionOverwrites.delete(this._id).catch((e) => {
          log({
            header: "Failed to delete permission overwrite",
            processName: "Player.moveTo",
            payload: e,
            type: "Warn",
          });
        });
      }

      oldEnv.leave(this);

      oldEnv.commit();
    } else if (!disregardOldEnvironment) {
      return "no old environment";
    }

    env.join(this);

    this.location.id = location;
    this.location.channelId = channel.id;
    this.location.adjacents = env.adjacentEnvironments;

    await env.commit();

    return env;
  }

  async notify(notification: Notification) {
    if (!this.dmChannel || !this.user) return;

    await this.dmChannel.send({
      components: [formatNotification(notification)],
      flags: MessageFlags.IsComponentsV2,
    });

    this.inbox.add(notification);
  }

  async isAdmin(): Promise<boolean> {
    const guild = aeonix.guilds.cache.get(aeonix.guildId);

    if (!guild) {
      log({
        header: "Unable to fetch master guild",
        processName: "Player.isAdmin",
        type: "Warn",
      });
      return false;
    }

    const masterRole = guild.roles.cache.get(aeonix.masterRoleId);

    if (!masterRole) {
      log({
        header: "Unable to fetch master role",
        processName: "Player.isAdmin",
        type: "Warn",
      });
      return false;
    }

    if (!this.user) return false;

    return masterRole.members?.has(this.user.id) ?? false;
  }

  async getStatsEmbed(): Promise<APIContainerComponent> {
    const welcomeOptions = [
      "Sup,",
      "Hello",
      "Hi",
      "Hey",
      "Greetings,",
      "Salutations,",
      "Howdy",
      "Hiya",
    ];

    return new ContainerBuilder()
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `${
            welcomeOptions[Math.floor(Math.random() * welcomeOptions.length)]
          } ***${this.persona.name}!***`
        )
      )
      .addSeparatorComponents(
        new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large)
      )
      .addSectionComponents(
        new SectionBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              `**Level:** *${this.stats.level}*\n**XP:** *${
                this.stats.xp
              }/${calculateXpRequirement(this.stats.level)}*`
            )
          )
          .setButtonAccessory(
            new ButtonBuilder()
              .setCustomId("WIPTemplateButton")
              .setLabel("See logs")
              .setStyle(ButtonStyle.Secondary)
          )
      )
      .addSeparatorComponents(
        new SeparatorBuilder()
          .setSpacing(SeparatorSpacingSize.Small)
          .setDivider(false)
      )
      .addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
          `**Strength:** *${this.stats.strength}*\n**Will:** *${this.stats.will}*\n**Cognition:** *${this.stats.cognition}*`
        )
      )
      .toJSON();
  }

  async commit(saveIntoCache = true): Promise<void> {
    if (saveIntoCache) aeonix.players.set(this);

    const data = await aeonix.players.onSave(this);

    await playerModel.findByIdAndUpdate(this._id, merge({}, data), {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
  }
  async delete(): Promise<void> {
    const channel = await this.fetchEnvironmentChannel();

    if (!channel) {
      log({
        header: "Environment channel not found",
        processName: "Player.delete",
        type: "Error",
      });
      return;
    }

    await channel.permissionOverwrites.delete(this._id);

    await (
      (
        await aeonix.guilds.cache.get(aeonix.guildId)?.members.fetch(this._id)
      )?.roles as GuildMemberRoleManager
    ).remove(aeonix.playerRoleId, "Player deleted");

    await playerModel.findByIdAndDelete({
      _id: this._id,
    } as Record<string, string>);

    aeonix.players.release(this._id);
    aeonix.players._weakRefs.delete(this._id);
    aeonix.players.markDeleted(this._id);
  }

  toRef() {
    return new PlayerRef(this._id, this);
  }

  constructor(data?: PlayerCreationOptions) {
    super();
    if (data) {
      this._id = data.user?.id ?? "";
      this.persona = new Persona(this, data.name || "", data.avatar || "");
    } else {
      this._id = "";
      this.persona = new Persona(this, "", "");
    }
    this.inbox = new Inbox(this);
    this.inventory = new Inventory(this);
    this.location = new Location(this);
    this.quests = new Quests(this);
    this.settings = new Settings(this);
    this.stats = new Stats(this);
    this.statusEffects = new StatusEffects(this);

    this.lastAccessed = Date.now();
  }

  static async create(
    data?: SerializedData | PlayerCreationOptions
  ): Promise<Player> {
    if (data && isSerializedData(data)) {
      return this.deserialize(data);
    } else {
      return new Player(data as PlayerCreationOptions);
    }
  }
}
