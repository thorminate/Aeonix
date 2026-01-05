import StoredEnvironment from "#environment/utils/environmentStorage.js";
import { getModelForClass } from "@typegoose/typegoose";

export default getModelForClass(StoredEnvironment);
