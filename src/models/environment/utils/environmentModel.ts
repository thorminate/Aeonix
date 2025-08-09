import { model } from "mongoose";
import environmentSchema from "./environmentSchema.js";
import Environment from "../environment.js";

export default model<Environment>("Environment", environmentSchema);
