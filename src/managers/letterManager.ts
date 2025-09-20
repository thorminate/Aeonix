import path from "path";
import url from "url";
import Letter, { RawLetter } from "../models/player/utils/inbox/letter.js";
import { ConstructableManager } from "../models/core/constructibleManager.js";
import merge from "../utils/merge.js";

type Holds = Letter;

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

export default class LetterManager extends ConstructableManager<Holds> {
  getKey(instance: Letter): string {
    const id = instance.type;
    if (!id) throw new Error("No type found in letter", { cause: instance });
    return id;
  }

  async fromRaw(raw: RawLetter): Promise<Letter> {
    const cls = await this.loadRaw(raw.type);
    if (!cls) throw new Error("No class found for letter", { cause: raw.type });
    return merge(new cls(), raw);
  }

  folder(): string {
    return path.join(__dirname, "..", "content", "letters");
  }
}
