import path from "path";
import url from "url";
import { ConstructableManager } from "../models/managers/constructableManager.js";
import Race from "../models/player/utils/race/race.js";

type Holds = Race;

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export default class RaceManager extends ConstructableManager<Holds> {
  getKey(instance: Race): string {
    const id = instance.type;
    if (!id) throw new Error("No type found in race", { cause: instance });
    return id;
  }

  folder(): string {
    return path.join(__dirname, "..", "content", "races");
  }
}
