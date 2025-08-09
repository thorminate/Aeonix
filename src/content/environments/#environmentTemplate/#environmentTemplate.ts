import Environment from "../../../models/environment/environment.js";

export default class EnvironmentTemplate extends Environment {
  type = "template";
  channelId = "uhh numbers ig";
  name = "Template";
  description = "A placeholder environment that you can use as a template.";
  adjacentEnvironments = [];
  __getClassMap() {
    return {};
  }
}
