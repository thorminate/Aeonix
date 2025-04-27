import { model } from "mongoose";
import { IPlayer } from "../player.js";
import playerSchema from "./playerSchema.js";

export default model<IPlayer>("Player", playerSchema);
