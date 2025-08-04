import Environment from "../../models/environment/environment.js";

export default class StartEnvironment extends Environment {
  type = "start";
  channelId = "1289589923510489118";
  name = "Start";
  description =
    "The environment you start in at the beginning of your journey.";
  adjacentEnvironments = ["somewhere"];

  getClassMap() {
    return {};
  }
}
