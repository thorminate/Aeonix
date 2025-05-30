import Saveable from "../core/saveable.js";
import hardMerge from "../../utils/hardMerge.js";
import {
  APIEmbed,
  EmbedBuilder,
  GuildChannel,
  OverwriteType,
  TextChannel,
  User,
} from "discord.js";
import Stats from "../status/status.js";
import Inventory from "../inventory/inventory.js";
import calculateXpRequirement from "../status/utils/calculateXpRequirement.js";
import aeonix from "../../aeonix.js";
import playerModel from "./utils/playerModel.js";
import environmentIdToChannelId from "../environment/utils/environmentIdToChannelId.js";
import log from "../../utils/log.js";
import PlayerDocument from "./utils/playerDocument.js";
import Environment from "../environment/environment.js";

export default class Player extends Saveable<PlayerDocument> {
  // Identifiers
  _id: string;
  name: string;

  // Persona Information
  persona = { name: "", avatarURL: "" };
  private _inventory: Inventory;
  private _status: Stats;
  location: string = "start";

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

  resolveUser(): User | undefined {
    return aeonix.users.cache.get(this._id);
  }

  async fetchUserChannelOverrides(guildId: string) {
    const guild = aeonix.guilds.cache.get(guildId);

    if (!guild) return;

    const channel = guild.channels.cache.get(
      await environmentIdToChannelId(this.location)
    );

    if (!channel || !(channel instanceof TextChannel)) return;

    return channel.permissionOverwrites.cache.get(this._id);
  }

  async fetchEnvironment() {
    return aeonix.environments.get(this.location);
  }

  async moveTo(location: string): Promise<undefined | Environment> {
    const environment = await aeonix.environments.get(location);

    if (!environment) {
      log({
        header: "Invalid location",
        processName: "Player.moveTo",
        payload: location,
        type: "Warn",
      });
      return;
    }

    if (this.location === location) return;

    const channel = await environment.fetchChannel();

    if (!channel || !(channel instanceof GuildChannel)) return;

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

    const oldEnvironment = await this.fetchEnvironment();

    if (oldEnvironment) {
      oldEnvironment.leave(this);
      oldEnvironment.save();
    }

    environment.join(this);

    this.location = location;

    await environment.save();

    return environment;
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

  async getStatusEmbed(): Promise<APIEmbed> {
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

    const user = await this.resolveUser();

    if (!user) return new EmbedBuilder().toJSON();

    return new EmbedBuilder()
      .setTitle(
        `${welcomeOptions[Math.floor(Math.random() * welcomeOptions.length)]} ${
          this.persona.name
        }!`
      )
      .setDescription(
        `You are level ${this.status.level} and have ${
          this.status.xp
        }/${calculateXpRequirement(this.status.level)} xp.`
      )
      .setAuthor({
        name: user.username,
        iconURL: user.displayAvatarURL(),
      })
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
