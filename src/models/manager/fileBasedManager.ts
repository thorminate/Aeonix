import path from "path";
import getAllFiles from "#utils/getAllFiles.js";
import CachedManager from "#manager/cachedManager.js";

export default abstract class FileBasedManager<T> extends CachedManager<T> {
  protected pathCache: Map<string, string> = new Map();
  protected pathsLoaded = false;

  abstract folder(): string;

  override empty(): void {
    super.empty();
    this.pathCache.clear();
    this.pathsLoaded = false;
  }

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
