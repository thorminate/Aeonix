import CachedManager from "../models/core/cachedManager.js";
import path from "path";
import url from "url";
import getAllFiles from "../utils/getAllFiles.js";
import Interaction from "../models/core/interaction.js";

type Holds = Interaction<
  "stringSelectMenu",
  boolean,
  boolean,
  boolean,
  boolean
>;

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const masterFolderPath = path.join(
  __dirname,
  "..",
  "content",
  "stringSelectMenus"
);

export default class StringSelectMenuManager extends CachedManager<
  Interaction<"stringSelectMenu", boolean, boolean, boolean, boolean>
> {
  getKey(
    instance: Interaction<
      "stringSelectMenu",
      boolean,
      boolean,
      boolean,
      boolean,
      false
    >
  ): string {
    const key = instance.data.data.custom_id;
    if (!key) throw new Error("No custom_id found in stringSelectMenu");
    return key;
  }

  async load(
    customId: string
  ): Promise<
    | Interaction<"stringSelectMenu", boolean, boolean, boolean, boolean>
    | undefined
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
  ): Promise<
    Interaction<"stringSelectMenu", boolean, boolean, boolean, boolean>[]
  > {
    const total: Holds[] = [];

    const folders = await getAllFiles(masterFolderPath, true);

    for (const folder of folders) {
      const file = path.resolve(folder, path.basename(folder) + ".js");
      if (!file) continue;

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
