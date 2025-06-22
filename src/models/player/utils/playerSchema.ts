import { Schema } from "mongoose";
import PlayerDocument from "./playerDocument.js";
export default new Schema<PlayerDocument>({
  _id: { type: String, required: true },
  location: { type: Object, default: {} },
  persona: { type: Object, default: {} },
  inbox: { type: Object, default: {} },
  questLog: { type: Object, default: {} },
  stats: { type: Object, default: {} },
  inventory: { type: Object, default: {} },
  statusEffects: { type: Object, default: {} },
});
