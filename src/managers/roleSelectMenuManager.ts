import path from "path";
import url from "url";
import Interaction, { InteractionTypes } from "../models/events/interaction.js";
import InteractionManager from "../models/managers/interactionManager.js";

type Holds = Interaction<
  InteractionTypes.RoleSelectMenu,
  boolean,
  boolean,
  boolean,
  boolean
>;

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export default class RoleSelectMenuManager extends InteractionManager<Holds> {
  getKey(instance: Holds): string {
    const key = instance.data.data.custom_id;
    if (!key) throw new Error("No custom_id found in roleSelectMenu");
    return key;
  }

  override folder(): string {
    return path.join(__dirname, "..", "content", "roleSelectMenus");
  }
}
