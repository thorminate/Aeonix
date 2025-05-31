import Environment from "../models/environment/environment.js";

export default class StartEnvironment extends Environment {
  id: string = "somewhere";
  channelId: string = "1373366311765278793";
  name: string = "Somewhere";
  description: string = "A place somewhere. You have no idea what it is. >:)";

  getClassMap(): Record<string, new (...args: any) => any> {
    return {};
  }
}
