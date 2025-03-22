import Saveable from "../Saveable.js";
import deepInstantiate from "../../utils/deepInstantiate.js";
import { APIEmbed, EmbedBuilder, User } from "discord.js";
import { Document, Model, model, Schema } from "mongoose";
import Stats from "./status/status.js";
import Inventory from "./inventory/inventory.js";
import calculateXpRequirement from "./utils/calculateXpRequirement.js";
import { bot } from "../../bot.js";

interface IPlayer extends Document {
  id: string;
  name: string;
  displayName: string;
  _status: Stats;
  _inventory: Inventory;
}

const PlayerSchema = new Schema<IPlayer>({
  id: { type: String, required: true },
  name: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  _status: {
    type: Object,
    default: { level: 1, xp: 0, strength: 0, will: 0, cognition: 0 },
  },
  _inventory: { type: Object, default: { capacity: 0, entries: [] } },
});

const PlayerModel = model<IPlayer>("Player", PlayerSchema);

export default class Player extends Saveable<IPlayer> {
  id: string;
  name: string;
  displayName: string;
  private _inventory: Inventory;
  private _status: Stats;

  public get status(): Stats {
    return deepInstantiate(new Stats(), this._status, {}) as Stats;
  }

  public set status(value: Stats) {
    this._status = value;
  }

  public get inventory(): Inventory {
    if (this._inventory instanceof Inventory) return this._inventory;

    this._inventory = deepInstantiate(new Inventory(), this._inventory, {});

    return this._inventory;
  }

  public set inventory(value: Inventory) {
    this._inventory = value;
  }

  async getUser(): Promise<User> {
    return await bot.users.fetch(this.id);
  }

  async levelUp(amount: number = 1, resetXp: boolean = true) {
    if (amount <= 0 || !amount) return;
    this.status.level += amount;
    if (resetXp) this.status.xp = 0;
  }

  async giveXp(amount: number) {
    this.status.xp += amount;
    while (this.status.xp >= calculateXpRequirement(this.status.level)) {
      this.levelUp(1, false);
      this.status.xp -= calculateXpRequirement(this.status.level - 1);
    }

    if (this.status.xp < 0) this.status.xp = 0;
  }

  async giveXpFromRange(min: number, max: number) {
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
    return new EmbedBuilder()
      .setTitle(
        `${welcomeOptions[Math.floor(Math.random() * welcomeOptions.length)]} ${
          this.displayName
        }!`
      )
      .setDescription(
        `You are level ${this.status.level} and have ${
          this.status.xp
        }/${calculateXpRequirement(this.status.level)} xp.`
      )
      .setAuthor({
        name: (await this.getUser()).username,
        iconURL: (await this.getUser()).displayAvatarURL(),
      })
      .toJSON();
  }

  protected getIdentifier() {
    return {
      key: "name",
      value: this.name,
    };
  }

  protected getModel(): Model<IPlayer> {
    return PlayerModel;
  }

  static getModel(): Model<IPlayer> {
    return PlayerModel;
  }

  protected getClassMap(): Record<string, any> {
    return {
      _inventory: Inventory,
      _status: Stats,
    };
  }

  constructor(user?: User, displayName?: string) {
    super();
    // Only the required properties (inside the schema) are set. The rest are implied when saving to db.

    this.name = user ? user.username : "";
    this.displayName = displayName || "";
    this.id = user ? user.id : "";
  }
}
