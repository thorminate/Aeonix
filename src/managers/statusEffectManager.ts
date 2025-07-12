import CachedManager from "../models/core/cachedManager.js";
import path from "path";
import url from "url";
import getAllFiles from "../utils/getAllFiles.js";
import StatusEffect from "../models/player/utils/statusEffects/statusEffect.js";
import ConcreteConstructor from "../models/core/concreteConstructor.js";

type Holds = StatusEffect;

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const folderPath = path.join(__dirname, "..", "content", "statusEffects");

export default class StatusEffectManager extends CachedManager<StatusEffect> {
  async load(customId: string): Promise<StatusEffect | undefined> {
    const files = await getAllFiles(folderPath);

    const filePath = files.find((f) => f.includes(customId + ".js"));

    if (!filePath) return;

    const fileUrl = url.pathToFileURL(filePath);
    const importedFile: Holds = (await import(fileUrl.toString())).default;

    return importedFile;
  }

  async loadAll(noDuplicates = false): Promise<StatusEffect[]> {
    const total: Holds[] = [];

    const files = await getAllFiles(folderPath);

    for (const file of files) {
      const filePath = path.resolve(file);
      const fileUrl = url.pathToFileURL(filePath);
      const importedFile = (await import(fileUrl.toString()))
        .default as ConcreteConstructor<Holds>;

      const instance = new importedFile();

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
