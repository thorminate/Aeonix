import { getModelForClass } from "@typegoose/typegoose";
import PlayerStorage from "#player/utils/playerStorage.js";

export default getModelForClass(PlayerStorage);
