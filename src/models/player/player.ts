import Saveable from "../core/saveable.js";
import hardMerge from "../../utils/hardMerge.js";
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
import Stats from "./utils/status.js";
import Inventory from "./utils/inventory.js";
import calculateXpRequirement from "./utils/calculateXpRequirement.js";
import aeonix from "../../aeonix.js";
import playerModel from "./utils/playerModel.js";
import log from "../../utils/log.js";
import PlayerDocument from "./utils/playerDocument.js";
import PlayerMoveToResult from "./utils/playerMoveToResult.js";
import ItemReference from "../item/utils/itemReference.js";
import StatusEffect from "./utils/statusEffect.js";

export default class Player extends Saveable<PlayerDocument> {
  // Identifiers
  _id: string;
  name: string;

  // Persona Information
  persona = { name: "", avatarURL: "" };
  location: string = "";
  locationChannelId: string = "";
  statusEffects: StatusEffect[] = [];
  private _inventory: Inventory;
  private _status: Stats;

  public get status(): Stats {
    return hardMerge(new Stats(), this._status, {}) as Stats;
  }

  public set status(value: Stats) {
    this._status = value;
  }

  public get inventory(): Inventory {
    if (this._inventory instanceof Inventory) return this._inventory;

    this._inventory = hardMerge(new Inventory(), this._inventory, {});

    return this._inventory;
  }

  public set inventory(value: Inventory) {
    this._inventory = value;
  }

  fetchUser(): User | undefined {
    return aeonix.users.cache.get(this._id);
  }

  async fetchEnvironmentChannel(guildId: string) {
    const guild = aeonix.guilds.cache.get(guildId);

    if (!guild) return;

    const env = await this.fetchEnvironment();

    if (!env) return;

    const channelId = env.channelId;

    return guild.channels.cache.get(channelId) as TextChannel;
  }

  async fetchEnvironment() {
    return aeonix.environments.get(this.location);
  }

  async moveTo(
    location: string,
    disregardAdjacents = false,
    disregardAlreadyHere = false,
    disregardOldEnvironment = false
  ): Promise<PlayerMoveToResult> {
    const env = await aeonix.environments.get(location);

    if (!env) return "invalid location";

    if (this.location === location && !disregardAlreadyHere)
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

    this.location = location;

    this.locationChannelId = channel.id;

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

  levelUp(amount: number = 1, resetXp: boolean = true) {
    if (amount <= 0 || !amount) return;
    this.status.level += amount;
    if (resetXp) this.status.xp = 0;
  }

  giveXp(amount: number) {
    this.status.xp += amount;
    while (this.status.xp >= calculateXpRequirement(this.status.level)) {
      this.levelUp(1, false);
      this.status.xp -= calculateXpRequirement(this.status.level - 1);
    }

    if (this.status.xp < 0) this.status.xp = 0;
  }

  giveXpFromRange(min: number, max: number) {
    const randomFromRange = Math.floor(Math.random() * (max - min + 1)) + min;

    this.giveXp(randomFromRange);
  }

  async getStatusEmbed(): Promise<APIContainerComponent> {
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
              `**Level:** *${this.status.level}*\n**XP:** *${
                this.status.xp
              }/${calculateXpRequirement(this.status.level)}*`
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
          `**Strength:** *${this.status.strength}*\n**Will:** *${this.status.will}*\n**Cognition:** *${this.status.cognition}*`
        )
      )
      .toJSON();
  }

  protected getIdentifier() {
    return {
      key: "_id",
      value: this.name,
    };
  }

  getModel() {
    return playerModel;
  }

  static getModel() {
    return playerModel;
  }

  protected getClassMap(): Record<string, new (...args: any) => any> {
    return {
      _inventory: Inventory,
      _status: Stats,
      statusEffects: StatusEffect,
      "_inventory._entries": ItemReference,
    };
  }

  constructor(user?: User, displayName?: string, personaAvatar?: string) {
    super();
    // Only the required properties (inside the schema) are set. The rest are implied when saving to db.

    this.name = user ? user.username : "";
    this.persona = {
      name: displayName || "",
      avatarURL: personaAvatar || "",
    };
    this._id = user ? user.id : "";

    this._status = new Stats();
    this._inventory = new Inventory();
  }
}
