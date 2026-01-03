import path from "path";
import url from "url";
import StatusEffect from "../models/player/utils/statusEffects/statusEffect.js";
import { ConstructableManager } from "../models/managers/constructableManager.js";

type Holds = StatusEffect;

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export default class StatusEffectManager extends ConstructableManager<Holds> {
  getKey(instance: StatusEffect): string {
    return instance.type;
  }

  folder(): string {
    return path.join(__dirname, "..", "content", "statusEffects");
  }
}
