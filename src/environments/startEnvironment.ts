import Environment from "../models/environment/environment.js";

export default class StartEnvironment extends Environment {
  id: string = "start";
  channelId: string = process.env.START_ENV_CHANNEL || "";
  name: string = "Start";
  description: string =
    "The environment you start in at the beginning of your journey.";
}
