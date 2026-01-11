import url from "url";
import getAllFiles from "#utils/getAllFiles.js";
import Interaction, { InteractionTypes } from "#core/interaction.js";
import FileBasedManager from "#manager/fileBasedManager.js";
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

    try {
      this.onAccess?.(imported);
      this.set(imported);
      return imported;
    } catch (e) {
      this.aeonix?.logger.error(
        "InteractionManager",
        "Instance failed to load properly",
        { id, e }
      );
    }

    return;
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

      try {
        if (id && (!noDuplicates || !this.exists(id))) {
          this.onAccess?.(imported);
          this.set(imported);
          total.push(imported);
        }
      } catch (e) {
        this.aeonix?.logger.error(
          "InteractionManager",
          "Instance failed to load properly",
          { id, e }
        );
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
