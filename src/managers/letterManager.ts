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
    const cls = await this.loadRaw(raw[1]);
    if (!cls) throw new Error("No class found for letter", { cause: raw });
    return merge(new cls(), {
      id: raw[0],
      type: raw[1],
      createdAt: raw[2],
      isRead: raw[3],
      isArchived: raw[4],
      isInteracted: raw[5],
    } as Partial<Letter>);
  }

  folder(): string {
    return path.join(__dirname, "..", "content", "letters");
  }
}
