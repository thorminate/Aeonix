import path from "path";
import url from "url";
import Environment from "../models/environment/environment.js";
import HybridCachedManager from "../models/core/hybridCachedManager.js";
import { Model } from "mongoose";
import environmentModel from "../models/environment/utils/environmentModel.js";
import StoredEnvironment from "../models/environment/utils/storedEnvironment.js";

type Holds = Environment;

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export default class EnvironmentManager extends HybridCachedManager<
  Holds,
  StoredEnvironment
> {
  channelToEnv: Map<string, string> = new Map();

  model(): Model<StoredEnvironment> {
    return environmentModel;
  }

  override async onAccess(instance: Environment): Promise<void> {
    instance.overviewMessage = await instance.fetchLastOverviewMessage();
    this.channelToEnv.set(instance.channelId, instance.type);
    return;
  }

  getKey(instance: Environment): string {
    const key = instance.type;
    if (!key)
      throw new Error("No type found in environment", { cause: instance });
    return key;
  }

  folder(): string {
    return path.join(__dirname, "..", "content", "environments");
  }

  fixInst(inst: Environment): StoredEnvironment {
    return {
      _id: inst._id,
      type: inst.type,
      players: inst.players,
      items: inst.items,
    };
  }
}
