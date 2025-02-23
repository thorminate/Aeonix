import mongoose from "mongoose";
import Saveable from "./utils/Saveable";
import calculateLevelExp from "../utils/calculateLevelExp";
import { GuildMember, TextChannel } from "discord.js";

interface IPlayer extends mongoose.Document {
  userId: string;
  username: string;
  displayName: string;
  level: number;
  xp: number;
  strength: number;
  will: number;
  cognition: number;
  inventory: InventoryEntry[];
}

export interface InventoryEntry {
  name: string;
  quantity: number;
  state: string;
}

const playerSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  strength: { type: Number, default: 0 },
  will: { type: Number, default: 0 },
  cognition: { type: Number, default: 0 },
  inventory: { type: Array<InventoryEntry>, default: [] },
});

const PlayerModel = mongoose.model<IPlayer>("Player", playerSchema);

export default class Player extends Saveable<IPlayer> {
  userId: string;
  username: string;
  displayName: string;
  level: number;
  xp: number;
  strength: number;
  will: number;
  cognition: number;
  inventory: InventoryEntry[];

  /**
   *
   * @param amount Number of levels to level up, defaults to 1, may not be negative
   * @returns
   */
  async levelUp(
    amount: number = 1,
    member: GuildMember,
    currentChannel?: TextChannel,
    resetXp: boolean = true,
    save: boolean = true
  ) {
    if (amount <= 0 || !amount) return;
    this.level += amount;
    if (resetXp) this.xp = 0;

    if (currentChannel) {
      currentChannel.send(
        `<@${member.user.id}> has leveled up! Their level is now ${this.level}!`
      );
    }

    if (save) this.save();
  }

  async giveXp(
    amount: number,
    member: GuildMember,
    save: boolean = true,
    currentChannel?: TextChannel
  ) {
    this.xp += amount;
    while (this.xp >= calculateLevelExp(this.level)) {
      this.levelUp(1, member, currentChannel, false, false);
      this.xp -= calculateLevelExp(this.level - 1);
    }

    if (save) this.save();
  }

  async giveXpFromRange(
    min: number,
    max: number,
    member: GuildMember,
    currentChannel?: TextChannel,
    save: boolean = true
  ) {
    const randomFromRange = Math.floor(Math.random() * (max - min + 1)) + min;

    this.giveXp(randomFromRange, member, false, currentChannel);

    if (save) this.save();
  }

  constructor(
    username: string,
    displayName: string,
    member: GuildMember,
    userId?: string
  ) {
    super();
    // Only the required properties (inside the schema) are set. The rest are implied when saving to db.
    this.username = username || "";
    this.displayName = displayName || "";
    this.userId = userId ? userId : member.user.id;
  }

  // All below is necessary for the Saveable class and may not be modified.

  protected getIdentifier(): { key: keyof IPlayer; value: any } {
    return {
      key: "username",
      value: this.username,
    };
  }

  protected getModel(): mongoose.Model<IPlayer> {
    return PlayerModel;
  }

  // Static method implementation
  static getModel(): mongoose.Model<IPlayer> {
    return PlayerModel;
  }
}
