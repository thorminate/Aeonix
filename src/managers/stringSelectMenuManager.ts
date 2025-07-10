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

const folderPath = path.join(__dirname, "..", "content", "stringSelectMenus");

export default class StringSelectMenuManager extends CachedManager<
  Interaction<"stringSelectMenu", boolean, boolean, boolean, boolean>
> {
  async load(
    customId: string
  ): Promise<
    | Interaction<"stringSelectMenu", boolean, boolean, boolean, boolean>
    | undefined
  > {
    const files = await getAllFiles(folderPath);

    const filePath = files.find((f) => f.includes(customId + ".js"));

    if (!filePath) return;

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

    const files = await getAllFiles(folderPath);

    for (const file of files) {
      const filePath = path.resolve(file);
      const fileUrl = url.pathToFileURL(filePath);
      const importedFile: Holds = (await import(fileUrl.toString())).default;

      const id = importedFile.data.data.custom_id;

      if (id && (!noDuplicates || !this.exists(id))) {
        this.set(id, importedFile);
        total.push(importedFile);
      }
    }

    return total;
  }
}
