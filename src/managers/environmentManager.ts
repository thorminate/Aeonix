import path from "path";
import url from "url";
import Environment from "../models/environment/environment.js";
import { ConstructableManager } from "../models/core/constructibleManager.js";

type Holds = Environment;

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export default class EnvironmentManager extends ConstructableManager<Holds> {
  getKey(instance: Environment): string {
    const key = instance.type;
    if (!key) throw new Error("No type found in environment");
    return key;
  }

  folder(): string {
    return path.join(__dirname, "..", "content", "environments");
  }
}
