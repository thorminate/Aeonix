import Interaction, { InteractionTypes } from "../models/events/interaction.js";
import path from "path";
import url from "url";
import InteractionManager from "../models/managers/interactionManager.js";

type Holds = Interaction<
  InteractionTypes.Command,
  boolean,
  boolean,
  boolean,
  boolean
>;

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export default class CommandManager extends InteractionManager<Holds> {
  getKey(instance: Holds): string {
    const key = instance.data.name;
    if (!key) throw new Error("No name found in command");
    return key;
  }

  folder(): string {
    return path.join(__dirname, "..", "content", "commands");
  }
}
