import Interaction from "../models/core/interaction.js";
import path from "path";
import url from "url";
import InteractionManager from "../models/core/interactionManager.js";

type Holds = Interaction<"command", boolean, boolean, boolean, boolean>;

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export default class CommandManager extends InteractionManager<Holds> {
  getKey(
    instance: Interaction<"command", boolean, boolean, boolean, boolean, false>
  ): string {
    const key = instance.data.name;
    if (!key) throw new Error("No name found in command");
    return key;
  }

  folder(): string {
    return path.join(__dirname, "..", "content", "commands");
  }
}
