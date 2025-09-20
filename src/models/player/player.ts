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
import Stats from "./utils/stats/stats.js";
import Inventory from "./utils/inventory/inventory.js";
import calculateXpRequirement from "./utils/stats/calculateXpRequirement.js";
import aeonix from "../../index.js";
import log from "../../utils/log.js";
import PlayerMoveToResult from "./utils/playerMoveToResult.js";
import Inbox from "./utils/inbox/inbox.js";
import Location from "./utils/location/location.js";
import Persona from "./utils/persona/persona.js";
import StatusEffects from "./utils/statusEffects/statusEffects.js";
import merge from "../../utils/merge.js";
import Quests from "./utils/quests/quests.js";
import Settings from "./utils/settings/settings.js";
import { PlayerSubclassBase } from "./utils/playerSubclassBase.js";
import PlayerRef from "./utils/playerRef.js";
import idToType from "../../utils/idToType.js";
import environmentModel from "../environment/utils/environmentModel.js";
import { Model } from "mongoose";
import Environment from "../environment/environment.js";
import formatNotification from "./utils/inbox/formatNotification.js";
import Notification from "../../content/letters/notification/notification.js";
import PlayerStorage from "./utils/playerStorage.js";
import { PlayerCreationOptions } from "../../managers/playerManager.js";
import semibinaryToBuffer from "./utils/semibinaryToBuffer.js";
import zlib from "zlib";
import playerModel from "./utils/playerModel.js";
import isPlayerStorage from "./utils/isPlayerStorage.js";

export default class Player {
  _id!: string;
  lastAccessed!: number;
  dataVersion!: number;

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

  getClassMap(): Record<string, new (...args: unknown[]) => unknown> {
    const result = {
      persona: Persona,
      location: Location,
      quests: Quests,
      inventory: Inventory,
      inbox: Inbox,
      stats: Stats,
      statusEffects: StatusEffects,
    };

    const map: Record<string, new (...args: unknown[]) => unknown> = {};

    // Loop through all own properties
    for (const key of Object.keys(this)) {
      const value = (this as unknown as Record<string, unknown>)[
        key
      ] as PlayerSubclassBase;
      // Check if it has getClassMap method
      if (
        value &&
        typeof value === "object" &&
        typeof value.getClassMap === "function"
      ) {
        const subMap = value.getClassMap();

        for (const [subKey, classRef] of Object.entries(subMap)) {
          map[`${key}.${subKey}`] = classRef as new (
            ...args: unknown[]
          ) => unknown;
        }
      }
    }

    return { ...map, ...result } as Record<
      string,
      new (...args: unknown[]) => unknown
    >;
  }
  toRef() {
    return new PlayerRef(this._id, this);
  }

  constructor(data?: PlayerStorage | PlayerCreationOptions) {
    if (data && isPlayerStorage(data)) {
      const deflatedData: Player = {} as Player;
      deflatedData._id = data._id;
      deflatedData.lastAccessed = data.lastAccessed;
      deflatedData.dataVersion = data.dataVersion;
      deflatedData.inbox = JSON.parse(
        zlib.inflateSync(semibinaryToBuffer(data.inboxCompressed)).toString()
      );
      deflatedData.inventory = JSON.parse(
        zlib
          .inflateSync(semibinaryToBuffer(data.inventoryCompressed))
          .toString()
      );
      deflatedData.location = JSON.parse(
        zlib.inflateSync(semibinaryToBuffer(data.locationCompressed)).toString()
      );
      deflatedData.persona = JSON.parse(
        zlib.inflateSync(semibinaryToBuffer(data.personaCompressed)).toString()
      );
      deflatedData.quests = JSON.parse(
        zlib.inflateSync(semibinaryToBuffer(data.questsCompressed)).toString()
      );
      deflatedData.settings = JSON.parse(
        zlib.inflateSync(semibinaryToBuffer(data.settingsCompressed)).toString()
      );
      deflatedData.stats = JSON.parse(
        zlib.inflateSync(semibinaryToBuffer(data.statsCompressed)).toString()
      );
      deflatedData.statusEffects = JSON.parse(
        zlib
          .inflateSync(semibinaryToBuffer(data.statusEffectsCompressed))
          .toString()
      );

      return merge(this, deflatedData, this.getClassMap());
    }

    this._id = data?.user.id ?? "";
    this.inbox = new Inbox();
    this.inventory = new Inventory();
    this.location = new Location();
    this.persona = new Persona(data?.name || "", data?.avatar || "");
    this.quests = new Quests();
    this.settings = new Settings();
    this.stats = new Stats();
    this.statusEffects = new StatusEffects();

    this.lastAccessed = Date.now();

    // This number should increment on major schema changes, will add a data migrator later on.
    this.dataVersion = 1;
  }
}
