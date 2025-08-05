import CachedManager from "../models/core/cachedManager.js";
import path from "path";
import url from "url";
import getAllFiles from "../utils/getAllFiles.js";
import Letter from "../models/player/utils/inbox/letter.js";
import ConcreteConstructor from "../models/core/concreteConstructor.js";

type Holds = Letter;

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const masterFolderPath = path.join(__dirname, "..", "content", "letters");

export default class LetterManager extends CachedManager<Letter> {
  getKey(instance: Letter): string {
    const id = instance.type;
    if (!id) throw new Error("No type found in letter");
    return id;
  }

  override async loadRaw(
    id: string
  ): Promise<ConcreteConstructor<Letter> | undefined> {
    const folders = await getAllFiles(masterFolderPath, true);

    const folderPath = folders.find((f) => f.includes(id));
    if (!folderPath) return;

    const filePath = path.resolve(folderPath, `${id}.js`);
    if (!filePath) return;

    const fileUrl = url.pathToFileURL(filePath);
    const importedFile = (await import(fileUrl.toString()))
      .default as ConcreteConstructor<Holds>;

    return importedFile;
  }

  async load(id: string): Promise<Letter | undefined> {
    const raw = await this.loadRaw(id);
    if (!raw) return;

    const instance = new raw();
    this.set(instance);
    return instance;
  }

  override async loadAllRaw(): Promise<ConcreteConstructor<Letter>[]> {
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

  async loadAll(noDuplicates = false): Promise<Letter[]> {
    const raw = await this.loadAllRaw();

    const total: Letter[] = [];

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
