import path from "path";
import getAllFiles from "../../utils/getAllFiles.js";
import { fileURLToPath, pathToFileURL } from "url";
import log from "../../utils/log.js";

export interface RegistrableConstructor<TInstance> {
  new (...args: any[]): TInstance;
}

export default abstract class Registrable<T extends Registrable<T>> {
  abstract getRegistryLocation(): string;
  getIdentifier(): {
    key: keyof T | string;
    value: string;
  } {
    throw new Error("Not implemented");
  }

  static async findAll<T extends Registrable<T>>(): Promise<any> {
    const files = getAllFiles(this.prototype.getRegistryLocation());

    return Promise.all(
      files.map(async (file) => await this.toRegisteredItemFromFile(file))
    );
  }

  static async find<T extends Registrable<T>>(identifier: string): Promise<T> {
    const registeredItems = await this.findAll<T>();
    return registeredItems.find(
      (i: T) => i.getIdentifier().value === identifier
    );
  }

  private static async toRegisteredItemFromFile<T extends Registrable<T>>(
    pathStr: string
  ): Promise<T> {
    const fileUrl = pathToFileURL(path.resolve(pathStr)).href;
    const module = await import(fileUrl);
    return new module.default() as T;
  }
}
