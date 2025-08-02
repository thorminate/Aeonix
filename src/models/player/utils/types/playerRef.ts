import { log } from "console";
import aeonix from "../../../../index.js";
import Player from "../../player.js";
import hardMerge from "../../../../utils/hardMerge.js";

function deepFreeze<T>(obj: T): T {
  Object.freeze(obj);
  Object.getOwnPropertyNames(obj).forEach((prop) => {
    const value = (obj as Record<string, unknown>)[prop];
    if (
      value !== null &&
      (typeof value === "object" || typeof value === "function") &&
      !Object.isFrozen(value)
    ) {
      deepFreeze(value);
    }
  });
  return obj;
}

function toReadonlyPlainObject<T>(obj: T): Readonly<T> {
  if (!obj || typeof obj !== "object") return obj;
  const result = hardMerge({}, obj) as Readonly<T>;
  return deepFreeze(result);
}

export default class PlayerRef {
  private weak?: WeakRef<Player>;

  constructor(private id: string, previousResolution?: Player) {
    if (previousResolution) this.weak = new WeakRef(previousResolution);
  }

  get idString() {
    return this.id;
  }

  async use<T>(
    fn: (player: Player) => Promise<T>
  ): Promise<Readonly<Awaited<T>> | undefined> {
    let player = this.weak?.deref() ?? (await aeonix.players.get(this.id));
    if (!player) return;
    const result = await fn(player).catch((err) => {
      log({
        header: "PlayerRef.use",
        payload: err,
        type: "Error",
      });
      throw err;
    });
    player = undefined;
    return toReadonlyPlainObject(result);
  }
}
