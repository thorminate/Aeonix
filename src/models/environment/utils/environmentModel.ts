import StoredEnvironment from "./environmentStorage.js";
import { getModelForClass } from "@typegoose/typegoose";

export default getModelForClass(StoredEnvironment);
