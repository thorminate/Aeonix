import url from "url";
import getAllFiles from "../../utils/getAllFiles.js";
import Interaction, { InteractionTypes } from "../events/interaction.js";
import FileBasedManager from "./fileBasedManager.js";
export default abstract class InteractionManager<
  T extends Interaction<InteractionTypes, boolean, boolean, boolean, boolean>
> extends FileBasedManager<T> {
  async load(id: string): Promise<T | undefined> {
    await this.ensurePathsLoaded();

    const filePath = this.pathCache.get(id);
    if (!filePath) return;

    const fileUrl = url.pathToFileURL(filePath);
    const imported = (
      await import(
        fileUrl.toString() +
          "?t=" +
          Date.now() +
          "&debug=fromInteractionManager"
      )
    ).default as T;

    this.onAccess?.(imported);
    this.set(imported);

    return imported;
  }

  async loadAll(noDuplicates = false): Promise<T[]> {
    await this.ensurePathsLoaded();

    const total: T[] = [];
    const files = this.pathCache.values();

    for (const file of files) {
      const fileUrl = url.pathToFileURL(file);
      const imported: T = (
        await import(
          fileUrl.toString() +
            "?t=" +
            Date.now() +
            "&debug=fromInteractionManager"
        )
      ).default;

      const id = this.getKey(imported);

      if (id && (!noDuplicates || !this.exists(id))) {
        this.onAccess?.(imported);
        this.set(imported);
        total.push(imported);
      }
    }

    this.markReady();
    return total;
  }

  protected async _existsSlow(id: string): Promise<boolean> {
    const folders = await getAllFiles(this.folder(), true);
    const folderPath = folders.find((f) => f.includes(id));
    return !!folderPath;
  }
}
