import { Document } from "mongoose";
import Inventory from "./inventory.js";
import Stats from "./status.js";
import Quest from "./quest.js";

export default interface PlayerDocument extends Document {
  _id: string;
  name: string;
  persona: { name: string; avatarURL: string };
  _status: Stats;
  _inventory: Inventory;
  location: string;
  locationChannelId: string;
  quests: {
    pending: Quest[];
    completed: Quest[];
  };
}
