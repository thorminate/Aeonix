import { Schema } from "mongoose";
import PlayerDocument from "./playerDocument.js";

export default new Schema<PlayerDocument>({
  _id: { type: String, required: true },
  name: { type: String, required: true, unique: true },
  persona: { type: Object, default: { name: "", avatarURL: "" } },
  _status: {
    type: Object,
    default: { level: 1, xp: 0, strength: 0, will: 0, cognition: 0 },
  },
  _inventory: { type: Object, default: { capacity: 0, entries: [] } },
});
