import CachedManager from "../models/core/cachedManager.js";
import path from "path";
import url from "url";
import getAllFiles from "../utils/getAllFiles.js";
import Environment from "../models/environment/environment.js";
import ConcreteConstructor from "../models/core/concreteConstructor.js";

type Holds = Environment;

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const masterFolderPath = path.join(__dirname, "..", "content", "environments");

export default class EnvironmentManager extends CachedManager<Environment> {
  getKey(instance: Environment): string {
    const key = instance.type;
    if (!key) throw new Error("No type found in environment");
    return key;
  }

  override async loadRaw(
    id: string
  ): Promise<ConcreteConstructor<Environment> | undefined> {
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

  async load(id: string): Promise<Environment | undefined> {
    const raw = await this.loadRaw(id);

    if (!raw) return;

    const instance = new raw();

    this.set(instance);

    return instance;
  }

  override async loadAllRaw(): Promise<ConcreteConstructor<Environment>[]> {
    const total: ConcreteConstructor<Holds>[] = [];

    const folders = await getAllFiles(masterFolderPath, true);

    for (const folder of folders) {
      const file = path.resolve(folder, path.basename(folder) + ".js");
      if (!file) continue;

      const filePath = path.resolve(file);
      const fileUrl = url.pathToFileURL(filePath);
      const importedClass = (await import(fileUrl.toString()))
        .default as ConcreteConstructor<Holds>;

      total.push(importedClass);
    }

    return total;
  }

  async loadAll(noDuplicates = false): Promise<Environment[]> {
    const raw = await this.loadAllRaw();

    const total: Environment[] = [];

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
