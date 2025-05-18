import Environment from "../models/environment/environment.js";

export default class SomewhereEnvironment extends Environment {
  override id: string = "somewhere";
  override channelId: string = "1373366311765278793";
  override name: string = "Somewhere";
  override description: string = "A place somewhere.";
}
