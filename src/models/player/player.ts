import Saveable from "../core/saveable.js";
import {
  APIContainerComponent,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  GuildChannel,
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
import aeonix from "../../aeonix.js";
import log from "../../utils/log.js";
import PlayerMoveToResult from "./utils/types/playerMoveToResult.js";
import PlayerDocument from "./utils/playerDocument.js";
import playerModel from "./utils/playerModel.js";
import Inbox from "./utils/inbox/inbox.js";
import QuestLog from "./utils/questLog/questLog.js";
import Location from "./utils/location/location.js";
import Persona from "./utils/persona/persona.js";
import StatusEffects from "./utils/statusEffect/statusEffects.js";
import { PlayerSubclassBase } from "./utils/types/PlayerSubclassBase.js";

export default class Player extends Saveable<PlayerDocument> {
  // Identifiers
  _id: string;

  // Persona Information
  persona: Persona;
  location: Location;
  statusEffects: StatusEffects;
  inventory: Inventory;
  stats: Stats;
  inbox: Inbox;
  questLog: QuestLog;

  fetchUser(): User | undefined {
    return aeonix.users.cache.get(this._id);
  }

  async fetchEnvironmentChannel() {
    return aeonix.channels.cache.get(this.location.channelId) as TextChannel;
  }

  async fetchEnvironment() {
    return aeonix.environments.get(this.location.id);
  }

  async moveTo(
    location: string,
    disregardAdjacents = false,
    disregardAlreadyHere = false,
    disregardOldEnvironment = false
  ): Promise<PlayerMoveToResult> {
    const env = await aeonix.environments.get(location);

    if (!env) return "invalid location";

    if (this.location.id === location && !disregardAlreadyHere)
      return "already here";

    const oldEnv = await this.fetchEnvironment().catch(() => undefined);

    if (oldEnv) {
      if (!oldEnv.adjacentTo(env) && !disregardAdjacents) return "not adjacent";

      oldEnv.leave(this);

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

      oldEnv.save();
    } else if (!disregardOldEnvironment) {
      return "no old environment";
    }

    const channel = await env.fetchChannel();

    if (!channel || !(channel instanceof GuildChannel))
      return "location channel not found";

    await channel.permissionOverwrites
      .create(
        this._id,
        {
          ViewChannel: true,
        },
        {
          reason: "Onboarding",
          type: OverwriteType.Member,
        }
      )
      .catch(() => {
        log({
          header: "Failed to create permission overwrite",
          processName: "Player.moveTo",
          type: "Warn",
        });
      });

    env.join(this);

    this.location.id = location;

    this.location.channelId = channel.id;

    await env.save();

    await this.save();

    return env;
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

    const thisUser = this.fetchUser();

    if (!thisUser) return false;

    return masterRole.members?.has(thisUser.id) ?? false;
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

    const user = this.fetchUser();

    if (!user) return new ContainerBuilder().toJSON();

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

  // This is required by Saveable

  protected getIdentifier() {
    return {
      key: "_id",
      value: this._id,
    };
  }

  getModel() {
    return playerModel;
  }

  static getModel() {
    return playerModel;
  }

  protected getClassMap(): Record<string, new (...args: any) => any> {
    const result = {
      persona: Persona,
      location: Location,
      questLog: QuestLog,
      inventory: Inventory,
      inbox: Inbox,
      stats: Stats,
      statusEffects: StatusEffects,
    };

    const map: Record<string, new (...args: any) => any> = {};

    // Loop through all own properties
    for (const key of Object.keys(this)) {
      const value = (this as any)[key] as PlayerSubclassBase;
      // Check if it has getClassMap method
      if (
        value &&
        typeof value === "object" &&
        typeof value.getClassMap === "function"
      ) {
        const subMap = value.getClassMap();

        for (const [subKey, classRef] of Object.entries(subMap)) {
          map[`${key}.${subKey}`] = classRef;
        }
      }
    }

    return { ...map, ...result };
  }

  constructor(user?: User, displayName?: string, personaAvatar?: string) {
    super();

    this._id = user?.id ?? "";
    this.persona = new Persona(displayName || "", personaAvatar || "");
    this.statusEffects = new StatusEffects();
    this.stats = new Stats();
    this.inventory = new Inventory();
    this.inbox = new Inbox();
    this.questLog = new QuestLog();
    this.location = new Location();
  }
}
