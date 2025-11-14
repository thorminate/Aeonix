import path from "path";
import url from "url";
import Environment from "../models/environment/environment.js";
import HybridCachedManager from "../models/core/hybridCachedManager.js";
import { Model } from "mongoose";
import environmentModel from "../models/environment/utils/environmentModel.js";
import EnvironmentStorage from "../models/environment/utils/environmentStorage.js";
import log from "../utils/log.js";
import { decode } from "cbor2";
import { inflateSync } from "zlib";
import semibinaryToBuffer from "../models/player/utils/semibinaryToBuffer.js";
import EnvironmentSerializedData from "../models/environment/utils/environmentSerializedData.js";
import ConcreteConstructor from "../models/core/concreteConstructor.js";

type Holds = Environment;

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export default class EnvironmentManager extends HybridCachedManager<
  Holds,
  EnvironmentStorage
> {
  channelToEnv: Map<string, string> = new Map();

  model(): Model<EnvironmentStorage> {
    return environmentModel;
  }

  override async onAccess(instance: Environment): Promise<void> {
    this.channelToEnv.set(instance.channelId, instance.type);
  }

  async onSave(inst: Environment): Promise<EnvironmentStorage | undefined> {
    const rawEnv = await inst.serialize();

    if (!rawEnv) {
      log({
        header: `Player ${inst._id} could not be serialized, skipping save`,
        type: "Error",
        processName: "PlayerManager.onSave",
      });
      return;
    }

    // Compress class and convert to pojo
    const compressed = new EnvironmentStorage({ ...rawEnv, type: inst.type });

    return compressed;
  }

  async onLoad(
    data: EnvironmentStorage,
    ctor: new () => Environment
  ): Promise<Environment> {
    const uncompressed = (() => {
      const uncompressed = decode(
        inflateSync(semibinaryToBuffer(data.d))
      ) as Record<string, unknown>;
      const obj: EnvironmentSerializedData = {
        _id: data._id,
        d: uncompressed,
        v: data.v,
        type: data.type,
      };

      return obj;
    })();

    // Uncompress pojo (tons of "don't worry bro, just trust me" code here)
    const inst = await (
      Environment as unknown as ConcreteConstructor<Environment> &
        typeof Environment
    ).deserialize(uncompressed, undefined, ctor);

    // Fetch all the data for quick use
    inst.overviewMessage = await inst.fetchLastOverviewMessage();

    return inst;
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
}
