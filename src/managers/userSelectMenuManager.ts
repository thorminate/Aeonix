import path from "path";
import url from "url";
import Interaction from "../models/core/interaction.js";
import InteractionManager from "../models/core/interactionManager.js";

type Holds = Interaction<"userSelectMenu", boolean, boolean, boolean, boolean>;

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export default class UserSelectMenuManager extends InteractionManager<Holds> {
  getKey(
    instance: Interaction<
      "userSelectMenu",
      boolean,
      boolean,
      boolean,
      boolean,
      false
    >
  ): string {
    const key = instance.data.data.custom_id;
    if (!key) throw new Error("No custom_id found in userSelectMenu");
    return key;
  }

  folder(): string {
    return path.join(__dirname, "..", "content", "userSelectMenus");
  }
}
