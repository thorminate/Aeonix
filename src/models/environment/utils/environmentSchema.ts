import { Schema } from "mongoose";
import StoredEnvironment from "./storedEnvironment.js";

export default new Schema<StoredEnvironment>(
  {
    _id: String,
    players: { type: [String], required: true },
    items: { type: [Object], required: true },
  },
  { strict: false }
);
