import CachedManager from "../models/core/cachedManager.js";
import path from "path";
import url from "url";
import getAllFiles from "../utils/getAllFiles.js";
import Environment from "../models/environment/environment.js";
import ConcreteConstructor from "../models/core/concreteConstructor.js";

type Holds = Environment;

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const folderPath = path.join(__dirname, "..", "content", "environments");

export default class EnvironmentManager extends CachedManager<Environment> {
  async load(customId: string): Promise<Environment | undefined> {
    const files = await getAllFiles(folderPath);

    const filePath = files.find((f) => f.includes(customId + ".js"));

    if (!filePath) return;

    const fileUrl = url.pathToFileURL(filePath);
    const importedFile: Holds = (await import(fileUrl.toString())).default;

    return importedFile;
  }

  async loadAll(noDuplicates = false): Promise<Environment[]> {
    const total: Holds[] = [];

    const files = await getAllFiles(folderPath);

    for (const file of files) {
      const filePath = path.resolve(file);
      const fileUrl = url.pathToFileURL(filePath);
      const importedClass = (await import(fileUrl.toString()))
        .default as ConcreteConstructor<Holds>;

      const instance = new importedClass();

      const id = instance.type;

      if (id && (!noDuplicates || !this.exists(id))) {
        this.set(id, instance);
        total.push(instance);
      }
    }

    this._ready = true;
    this.emit("ready", total);

    return total;
  }
}
