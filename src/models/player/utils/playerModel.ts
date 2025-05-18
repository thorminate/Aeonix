import { model } from "mongoose";
import playerSchema from "./playerSchema.js";
import PlayerDocument from "./playerDocument.js";

export default model<PlayerDocument>("Player", playerSchema);
