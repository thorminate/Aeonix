import { model } from "mongoose";
import environmentSchema from "./environmentSchema.js";

export default model("Environment", environmentSchema);
