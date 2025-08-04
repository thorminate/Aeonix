import Interaction from "../models/core/interaction.js";
import CachedManager from "../models/core/cachedManager.js";
import path from "path";
import url from "url";
import getAllFiles from "../utils/getAllFiles.js";

type Holds = Interaction<"command", boolean, boolean, boolean, boolean>;

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const masterFolderPath = path.join(__dirname, "..", "content", "commands");

export default class CommandManager extends CachedManager<
  Interaction<"command", boolean, boolean, boolean, boolean>
> {
  getKey(
    instance: Interaction<"command", boolean, boolean, boolean, boolean, false>
  ): string {
    const key = instance.data.name;
    if (!key) throw new Error("No name found in command");
    return key;
  }
  async load(
    customId: string
  ): Promise<
    Interaction<"command", boolean, boolean, boolean, boolean> | undefined
  > {
    const folders = await getAllFiles(masterFolderPath, true);

    const folderPath = folders.find((f) => f.includes(customId));

    if (!folderPath) return;

    const filePath = path.resolve(folderPath, `${customId}.js`);

    const fileUrl = url.pathToFileURL(filePath);
    const importedFile: Holds = (await import(fileUrl.toString())).default;

    return importedFile;
  }

  async loadAll(
    noDuplicates = false
  ): Promise<Interaction<"command", boolean, boolean, boolean, boolean>[]> {
    const total: Holds[] = [];

    const folders = await getAllFiles(masterFolderPath, true);

    for (const folder of folders) {
      const dirname = path.basename(folder);

      const file = path.resolve(folder, dirname + ".js");
      const filePath = path.resolve(file);
      const fileUrl = url.pathToFileURL(filePath);
      const importedFile: Holds = (await import(fileUrl.toString())).default;

      const id = this.getKey(importedFile);

      if (id && (!noDuplicates || !this.exists(id))) {
        this.set(importedFile);
        total.push(importedFile);
      }
    }

    this.markReady();

    return total;
  }
}
