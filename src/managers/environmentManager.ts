import path from "path";
import url from "url";
import Environment from "../models/environment/environment.js";
import HybridLifecycleCachedManager from "../models/core/hybridLifecycleCachedManager.js";
import ConcreteConstructor from "../models/core/concreteConstructor.js";
import { Model } from "mongoose";
import environmentModel from "../models/environment/utils/environmentModel.js";

type Holds = Environment;

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export default class EnvironmentManager extends HybridLifecycleCachedManager<Holds> {
  model(): Model<Environment> {
    return environmentModel;
  }

  async onLoad(): Promise<void> {
    return;
  }

  getKey(instance: Environment): string {
    const key = instance.type;
    if (!key) throw new Error("No type found in environment");
    return key;
  }

  folder(): string {
    return path.join(__dirname, "..", "content", "environments");
  }

  inst(): Environment {
    return new (Environment as ConcreteConstructor<Environment>)();
  }
}
