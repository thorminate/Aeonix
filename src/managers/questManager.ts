import path from "path";
import url from "url";
import Quest from "../models/player/utils/quests/quest.js";
import { ConstructableManager } from "../models/managers/constructableManager.js";

type Holds = Quest;

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export default class QuestManager extends ConstructableManager<Holds> {
  getKey(instance: Quest): string {
    const id = instance.type;
    if (!id) throw new Error("No type found in quest", { cause: instance });
    return id;
  }

  folder(): string {
    return path.join(__dirname, "..", "content", "quests");
  }
}
