import path from "path";
import url from "url";
import Interaction from "../models/core/interaction.js";
import InteractionManager from "../models/core/interactionManager.js";

type Holds = Interaction<
  "stringSelectMenu",
  boolean,
  boolean,
  boolean,
  boolean
>;

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export default class StringSelectMenuManager extends InteractionManager<Holds> {
  getKey(
    instance: Interaction<
      "stringSelectMenu",
      boolean,
      boolean,
      boolean,
      boolean,
      false
    >
  ): string {
    const key = instance.data.data.custom_id;
    if (!key) throw new Error("No custom_id found in stringSelectMenu");
    return key;
  }

  override folder(): string {
    return path.join(__dirname, "..", "content", "stringSelectMenus");
  }
}
