import path from "path";
import url from "url";
import Quest, { RawQuest } from "../models/player/utils/quests/quest.js";
import { ConstructableManager } from "../models/core/constructibleManager.js";
import merge from "../utils/merge.js";

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

  async fromRaw(raw: RawQuest): Promise<Quest> {
    const cls = await this.loadRaw(raw[1]);
    if (!cls) throw new Error("No class found for letter", { cause: raw });
    return merge(new cls(), {
      id: raw[0],
      type: raw[1],
      completed: raw[2],
    } as Partial<Quest>);
  }
}
