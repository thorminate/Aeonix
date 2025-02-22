import mongoose from "mongoose";
import Saveable from "./utils/Saveable";

interface IPlayer extends mongoose.Document {
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
  username: string;
  displayName: string;
  level: number;
  xp: number;
  strength: number;
  will: number;
  cognition: number;
  inventory: InventoryEntry[];

  constructor(username?: string, displayName?: string) {
    super();
    this.username = username || "";
    this.displayName = displayName || "";
  }

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
