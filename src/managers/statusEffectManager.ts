import path from "path";
import url from "url";
import StatusEffect, {
  RawStatusEffect,
} from "../models/player/utils/statusEffects/statusEffect.js";
import { ConstructableManager } from "../models/core/constructibleManager.js";
import merge from "../utils/merge.js";

type Holds = StatusEffect;

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export default class StatusEffectManager extends ConstructableManager<Holds> {
  getKey(instance: StatusEffect): string {
    return instance.type;
  }

  folder(): string {
    return path.join(__dirname, "..", "content", "statusEffects");
  }

  async fromRaw(raw: RawStatusEffect): Promise<StatusEffect> {
    const cls = await this.loadRaw(raw[1]);
    if (!cls)
      throw new Error("No class found for status effect", { cause: raw });
    return merge(new cls(), {
      id: raw[0],
      type: raw[1],
      exposure: raw[2],
    } as Partial<StatusEffect>);
  }
}
