import CachedManager from "../models/core/cachedManager.js";
import path from "path";
import url from "url";
import getAllFiles from "../utils/getAllFiles.js";
import Quest from "../models/player/utils/quests/quest.js";
import ConcreteConstructor from "../models/core/concreteConstructor.js";

type Holds = Quest;

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const masterFolderPath = path.join(__dirname, "..", "content", "quests");

export default class QuestManager extends CachedManager<Quest> {
  getKey(instance: Quest): string {
    const id = instance.type;
    if (!id) throw new Error("No type found in quest");
    return id;
  }

  override async loadRaw(
    id: string
  ): Promise<ConcreteConstructor<Quest> | undefined> {
    const folders = await getAllFiles(masterFolderPath, true);

    const folderPath = folders.find((f) => f.includes(id));
    if (!folderPath) return;

    const filePath = path.resolve(folderPath, `${id}.js`);

    const fileUrl = url.pathToFileURL(filePath);
    const importedFile = (await import(fileUrl.toString()))
      .default as ConcreteConstructor<Holds>;

    return importedFile;
  }

  async load(id: string): Promise<Quest | undefined> {
    const raw = await this.loadRaw(id);

    if (!raw) return;

    const instance = new raw();

    this.set(instance);

    return instance;
  }

  override async loadAllRaw(): Promise<ConcreteConstructor<Quest>[]> {
    const total: ConcreteConstructor<Holds>[] = [];

    const folders = await getAllFiles(masterFolderPath, true);

    for (const folder of folders) {
      const file = path.resolve(folder, path.basename(folder) + ".js");
      if (!file) continue;

      const filePath = path.resolve(file);
      const fileUrl = url.pathToFileURL(filePath);
      const importedFile = (await import(fileUrl.toString()))
        .default as ConcreteConstructor<Holds>;

      total.push(importedFile);
    }

    return total;
  }

  async loadAll(noDuplicates = false): Promise<Quest[]> {
    const raw = await this.loadAllRaw();

    const total: Quest[] = [];

    for (const rawClass of raw) {
      const instance = new rawClass();

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
