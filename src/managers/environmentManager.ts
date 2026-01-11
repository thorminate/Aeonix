import path from "path";
import url from "url";
import Environment from "#environment/environment.js";
import { Model } from "mongoose";
import environmentModel from "#environment/utils/environmentModel.js";
import EnvironmentStorage from "#environment/utils/environmentStorage.js";
import { decode } from "cbor2";
import { inflateSync } from "zlib";
import semibinaryToBuffer from "#player/utils/semibinaryToBuffer.js";
import ConcreteConstructor from "#utils/concreteConstructor.js";
import HybridCachedManager from "#manager/hybridCachedManager.js";
import { SerializableClass, SerializedData } from "#core/serializable.js";

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
    this.channelToEnv.set(instance.channelId, instance._id);
    instance.lastAccessed = Date.now();
  }

  async onSave(inst: Environment): Promise<EnvironmentStorage | undefined> {
    const rawEnv = await inst.serialize();

    if (!rawEnv) {
      this.aeonix?.logger.error(
        "EnvironmentManager.onSave",
        `Environment ${inst._id} could not be serialized, skipping save`,
        inst
      );
      return;
    }

    // Compress class and convert to pojo
    const compressed = new EnvironmentStorage(rawEnv);

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
      const obj: SerializedData = {
        _id: data._id,
        d: uncompressed,
        v: data.v,
      };

      return obj;
    })();

    // Uncompress pojo (tons of "don't worry bro, just trust me" code here)
    const inst = await (
      Environment as unknown as ConcreteConstructor<Environment> &
        typeof Environment
    ).deserialize(
      uncompressed,
      undefined,
      ctor as unknown as SerializableClass
    );

    // Fetch all the data for quick use
    inst.overviewMessage = await inst.fetchLastOverviewMessage();

    return inst;
  }

  getKey(instance: Environment): string {
    const key = instance._id;
    if (!key)
      throw new Error("No type found in environment", { cause: instance });
    return key;
  }

  folder(): string {
    return path.join(__dirname, "..", "content", "environments");
  }
}
