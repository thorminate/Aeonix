import path from "path";
import url from "url";
import Letter from "../models/player/utils/inbox/letter.js";
import { ConstructableManager } from "../models/core/constructibleManager.js";

type Holds = Letter;

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export default class LetterManager extends ConstructableManager<Holds> {
  getKey(instance: Letter): string {
    const id = instance.type;
    if (!id) throw new Error("No type found in letter", { cause: instance });
    return id;
  }

  folder(): string {
    return path.join(__dirname, "..", "content", "letters");
  }
}
