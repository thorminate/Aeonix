import { Schema } from "mongoose";
import EnvironmentDocument from "./environmentDocument.js";

export default new Schema<EnvironmentDocument>({
  _id: String,
  channelId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  players: { type: [String], required: true },
  adjacentEnvironments: { type: [String], required: true },
  items: { type: [Object], required: true },
});
