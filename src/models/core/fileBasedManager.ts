import path from "path";
import getAllFiles from "../../utils/getAllFiles.js";
import CachedManager from "./cachedManager.js";

export default abstract class FileBasedManager<T> extends CachedManager<T> {
  protected pathCache: Map<string, string> = new Map();
  protected pathsLoaded = false;

  abstract folder(): string;
  abstract override getKey(instance: T): string;

  protected async ensurePathsLoaded() {
    if (this.pathsLoaded) return;

    const folders = await getAllFiles(this.folder(), true);

    for (const folder of folders) {
      const folderName = path.basename(folder);
      const filePath = path.resolve(folder, folderName + ".js");
      this.pathCache.set(folderName, filePath);
    }

    this.pathsLoaded = true;
  }
}
