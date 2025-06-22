import { Stats } from "fs";
import { Document } from "mongoose";
import Inventory from "./inventory/inventory.js";
import Inbox from "./inbox/inbox.js";
import QuestLog from "./questLog/questLog.js";
import Persona from "./persona/persona.js";
import StatusEffects from "./statusEffect/statusEffects.js";

export default interface PlayerDocument extends Document {
  _id: string;
  persona: Persona;
  stats: Stats;
  inventory: Inventory;
  inbox: Inbox;
  location: Location;
  questLog: QuestLog;
  statusEffects: StatusEffects;
}
