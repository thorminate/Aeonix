import Environment from "../models/environment/environment.js";

export default class StartEnvironment extends Environment {
  id: string = "template";
  channelId: string = "uhh numbers ig";
  name: string = "Template";
  description: string =
    "A placeholder environment that you can use as a template.";

  getClassMap(): Record<string, new (...args: any) => any> {
    return {};
  }
}
