import CachedManager from "../models/core/cachedManager.js";
import path from "path";
import url from "url";
import getAllFiles from "../utils/getAllFiles.js";
import Quest from "../models/player/utils/quests/quest.js";
import ConcreteConstructor from "../models/core/concreteConstructor.js";

type Holds = Quest;

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const folderPath = path.join(__dirname, "..", "content", "quests");

export default class QuestManager extends CachedManager<Quest> {
  getKey(instance: Quest): string {
    const id = instance.type;
    if (!id) throw new Error("No type found in quest");
    return id;
  }

  async load(customId: string): Promise<Quest | undefined> {
    const files = await getAllFiles(folderPath);

    const filePath = files.find((f) => f.includes(customId + ".js"));

    if (!filePath) return;

    const fileUrl = url.pathToFileURL(filePath);
    const importedFile: Holds = (await import(fileUrl.toString())).default;

    return importedFile;
  }

  async loadAll(noDuplicates = false): Promise<Quest[]> {
    const total: Holds[] = [];

    const files = await getAllFiles(folderPath);

    for (const file of files) {
      const filePath = path.resolve(file);
      const fileUrl = url.pathToFileURL(filePath);
      const importedFile = (await import(fileUrl.toString()))
        .default as ConcreteConstructor<Holds>;

      const instance = new importedFile();

      const id = this.getKey(instance);

      if (id && (!noDuplicates || !this.exists(id))) {
        this.set(instance);
        total.push(instance);
      }
    }

    this.markReady();

    return total;
  }
}
