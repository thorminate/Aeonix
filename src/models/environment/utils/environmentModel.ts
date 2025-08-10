import { model } from "mongoose";
import environmentSchema from "./environmentSchema.js";
import StoredEnvironment from "./storedEnvironment.js";

export default model<StoredEnvironment>("Environment", environmentSchema);
