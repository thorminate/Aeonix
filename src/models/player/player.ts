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
import aeonix from "../../index.js";
import log from "../../utils/log.js";
import PlayerMoveToResult from "./utils/types/playerMoveToResult.js";
import Inbox from "./utils/inbox/inbox.js";
import Location from "./utils/location/location.js";
import Persona from "./utils/persona/persona.js";
import StatusEffects from "./utils/statusEffects/statusEffects.js";
import { PlayerSubclassBase } from "./utils/types/PlayerSubclassBase.js";
import hardMerge from "../../utils/hardMerge.js";
import {
  getModelForClass,
  modelOptions,
  prop,
  Severity,
} from "@typegoose/typegoose";
import Quests from "./utils/quests/quests.js";

@modelOptions({
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export default class Player {
  @prop({ type: () => String, required: true })
  _id: string;

  @prop({ default: {}, type: Object })
  persona: Persona;
  @prop({ default: {}, type: Object })
  location: Location;
  @prop({ default: {}, type: Object })
  statusEffects: StatusEffects;
  @prop({ default: {}, type: Object })
  inventory: Inventory;
  @prop({ default: {}, type: Object })
  stats: Stats;
  @prop({ default: {}, type: Object })
  inbox: Inbox;
  @prop({ default: {}, type: Object })
  quests: Quests;

  fetchUser(): User | undefined {
    return aeonix.users.cache.get(this._id);
  }

  async fetchEnvironmentChannel() {
    return aeonix.channels.cache.get(this.location.channelId) as TextChannel;
  }

  async fetchEnvironment() {
    return aeonix.environments.cache.get(this.location.id);
  }

  async moveTo(
    location: string,
    disregardAdjacents = false,
    disregardAlreadyHere = false,
    disregardOldEnvironment = false
  ): Promise<PlayerMoveToResult> {
    const env = aeonix.environments.cache.get(location);

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

      oldEnv.commit();
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

    await env.commit();

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

  async commit(): Promise<void> {
    await playerModel.findByIdAndUpdate(this._id, hardMerge({}, this), {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });
  }

  async delete(): Promise<void> {
    await playerModel.findByIdAndDelete({
      _id: this._id,
    } as Record<string, string>);
  }

  static async find(identifier: string): Promise<Player | undefined> {
    const doc = await playerModel.findById(identifier);
    if (!doc) return undefined;

    const newThis = new this() as Player;

    const instance = hardMerge(newThis, doc.toObject(), newThis.getClassMap());
    return instance;
  }

  protected getClassMap(): Record<string, new (...args: any) => any> {
    const result = {
      persona: Persona,
      location: Location,
      quests: Quests,
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
          map[`${key}.${subKey}`] = classRef as new (...args: any) => any;
        }
      }
    }

    return { ...map, ...result };
  }

  constructor(user?: User, displayName?: string, personaAvatar?: string) {
    this._id = user?.id ?? "";
    this.persona = new Persona(displayName || "", personaAvatar || "");
    this.statusEffects = new StatusEffects();
    this.stats = new Stats();
    this.inventory = new Inventory();
    this.inbox = new Inbox();
    this.quests = new Quests();
    this.location = new Location();
  }
}

export const playerModel = getModelForClass(Player);
