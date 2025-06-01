import Environment from "../models/environment/environment.js";

export default class StartEnvironment extends Environment {
  id: string = "start";
  channelId: string = "1289589923510489118";
  name: string = "Start";
  description: string =
    "The environment you start in at the beginning of your journey.";
  adjacentEnvironments: string[] = ["somewhere"];

  getClassMap(): Record<string, new (...args: any) => any> {
    return {};
  }
}
