import CachedManager from "../models/core/cachedManager.js";
import path from "path";
import url from "url";
import getAllFiles from "../utils/getAllFiles.js";
import Item from "../models/item/item.js";
import ConcreteConstructor from "../models/core/concreteConstructor.js";

type Holds = Item;

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const folderPath = path.join(__dirname, "..", "content", "items");

export default class ItemManager extends CachedManager<Item> {
  getKey(instance: Item): string {
    const id = instance.type;
    if (!id) throw new Error("No type found in item");
    return id;
  }

  override async loadRaw(
    id: string
  ): Promise<ConcreteConstructor<Item> | undefined> {
    const files = await getAllFiles(folderPath);

    const filePath = files.find((f) => f.includes(id + ".js"));

    if (!filePath) return;

    const fileUrl = url.pathToFileURL(filePath);
    const importedFile = (await import(fileUrl.toString()))
      .default as ConcreteConstructor<Holds>;

    return importedFile;
  }

  async load(id: string): Promise<Item | undefined> {
    const raw = await this.loadRaw(id);

    if (!raw) return;

    const instance = new raw();

    this.set(instance);

    return instance;
  }

  override async loadAllRaw(): Promise<ConcreteConstructor<Item>[]> {
    const total: ConcreteConstructor<Holds>[] = [];

    const files = await getAllFiles(folderPath);

    for (const file of files) {
      const filePath = path.resolve(file);
      const fileUrl = url.pathToFileURL(filePath);
      const importedFile = (await import(fileUrl.toString()))
        .default as ConcreteConstructor<Holds>;

      total.push(importedFile);
    }

    return total;
  }

  async loadAll(noDuplicates = false): Promise<Item[]> {
    const raw = await this.loadAllRaw();

    const total: Item[] = [];

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
