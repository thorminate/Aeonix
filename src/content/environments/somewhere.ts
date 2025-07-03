import Environment from "../../models/environment/environment.js";

export default class StartEnvironment extends Environment {
  type = "somewhere";
  channelId = "1373366311765278793";
  name = "Somewhere";
  description = "A place somewhere. You have no idea what it is. >:)";
  adjacentEnvironments = ["start"];
  getClassMap() {
    return {};
  }
}
