import Saveable from "../core/saveable.js";
import deepInstantiate from "../../utils/deepInstantiate.js";
import { APIEmbed, EmbedBuilder, User } from "discord.js";
import { Document, Model } from "mongoose";
import Stats from "../status/status.js";
import Inventory from "../inventory/inventory.js";
import calculateXpRequirement from "../status/utils/calculateXpRequirement.js";
import aeonix from "../../aeonix.js";
import playerModel from "./utils/playerModel.js";

export interface IPlayer extends Document {
  _id: string;
  name: string;
  displayName: string;
  _status: Stats;
  _inventory: Inventory;
}

export default class Player extends Saveable<IPlayer> {
  _id: string;
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
    return await aeonix.users.fetch(this._id);
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
    return playerModel;
  }

  static getModel(): Model<IPlayer> {
    return playerModel;
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
    this._id = user ? user.id : "";

    this._status = new Stats();
    this._inventory = new Inventory();
  }
}
