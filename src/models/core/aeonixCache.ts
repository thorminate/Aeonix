import { Collection } from "discord.js";
import Environment from "../environment/environment.js";
import Item from "../item/item.js";
import Letter from "../player/utils/inbox/letter.js";
import Quest from "../player/utils/quests/quest.js";
import StatusEffect from "../player/utils/statusEffect/statusEffect.js";
import Interaction from "./interaction.js";
import url from "url";
import path from "path";
import getAllFiles from "../../utils/getAllFiles.js";
import environmentModel from "../environment/utils/environmentModel.js";
import softMerge from "../../utils/softMerge.js";
import aeonix from "../../index.js";
import log from "../../utils/log.js";

async function loadContentClasses(folderName: string): Promise<any[]> {
  const contentPath = `./dist/content/${folderName}/`;

  const result = [];

  const allFiles = await getAllFiles(contentPath);

  for (const file of allFiles) {
    const filePath = path.resolve(file);
    const fileUrl = url.pathToFileURL(filePath);
    const content = (await import(fileUrl.toString()).catch(() => undefined))
      ?.default;

    result.push(new content());
  }

  return result;
}

async function loadInteractions(folderName: string): Promise<any[]> {
  const contentPath = `./dist/content/${folderName}/`;

  const result = [];

  const allFiles = await getAllFiles(contentPath, false, false);

  for (const file of allFiles) {
    const filePath = path.resolve(file);
    const fileUrl = url.pathToFileURL(filePath);
    const content = (await import(fileUrl.toString()).catch(() => undefined))
      ?.default;

    result.push(content);
  }

  return result;
}

export default class AeonixCache {
  cached = false;

  environments = new Collection<string, Environment>();
  items = new Collection<string, Item>();
  letters = new Collection<string, Letter>();
  quests = new Collection<string, Quest>();
  statusEffects = new Collection<string, StatusEffect>();
  buttons = new Collection<
    string,
    Interaction<boolean, boolean, boolean, boolean, "button">
  >();
  channelSelectMenus = new Collection<
    string,
    Interaction<boolean, boolean, boolean, boolean, "channelSelectMenu">
  >();
  commands = new Collection<
    string,
    Interaction<boolean, boolean, boolean, boolean, "command">
  >();
  mentionableSelectMenus = new Collection<
    string,
    Interaction<boolean, boolean, boolean, boolean, "mentionableSelectMenu">
  >();
  modals = new Collection<
    string,
    Interaction<boolean, boolean, boolean, boolean, "modal">
  >();
  roleSelectMenus = new Collection<
    string,
    Interaction<boolean, boolean, boolean, boolean, "roleSelectMenu">
  >();
  stringSelectMenus = new Collection<
    string,
    Interaction<boolean, boolean, boolean, boolean, "stringSelectMenu">
  >();
  userSelectMenus = new Collection<
    string,
    Interaction<boolean, boolean, boolean, boolean, "userSelectMenu">
  >();

  async init() {
    if (!aeonix.token) {
      log({
        header: "Aeonix is not ready, cannot initialize cache",
        processName: "AeonixCache.init",
        type: "Warn",
      });
    }

    this.environments = new Collection<string, Environment>(
      await Promise.all(
        (
          await loadContentClasses("environments")
        ).map(async (e: Environment) => {
          await e.init();

          const doc = environmentModel.findOne({ type: e.type }).exec();

          if (!doc) {
            await e.commit();
            return [e.type, e] as [string, Environment];
          }

          const env = softMerge(e, doc);

          return [e.type, env] as [string, Environment];
        })
      )
    );

    this.items = new Collection<string, Item>(
      (await loadContentClasses("items")).map((i) => [i.type, i])
    );

    this.letters = new Collection<string, Letter>(
      (await loadContentClasses("letters")).map((i) => [i.type, i])
    );

    this.quests = new Collection<string, Quest>(
      (await loadContentClasses("quests")).map((q: Quest) => [q.type, q])
    );

    this.statusEffects = new Collection<string, StatusEffect>(
      (await loadContentClasses("statusEffects")).map((s: StatusEffect) => [
        s.type,
        s,
      ])
    );

    this.buttons = new Collection<
      string,
      Interaction<boolean, boolean, boolean, boolean, "button">
    >(
      (await loadInteractions("buttons")).map(
        (b: Interaction<boolean, boolean, boolean, boolean, "button">) => [
          (b.data.data as { custom_id: string }).custom_id,
          b,
        ]
      )
    );

    this.channelSelectMenus = new Collection<
      string,
      Interaction<boolean, boolean, boolean, boolean, "channelSelectMenu">
    >(
      (await loadInteractions("channelSelectMenus")).map(
        (
          b: Interaction<
            boolean,
            boolean,
            boolean,
            boolean,
            "channelSelectMenu"
          >
        ) => [(b.data.data as { custom_id: string }).custom_id, b]
      )
    );

    this.commands = new Collection<
      string,
      Interaction<boolean, boolean, boolean, boolean, "command">
    >(
      (await loadInteractions("commands")).map(
        (b: Interaction<boolean, boolean, boolean, boolean, "command">) => [
          b.data.name,
          b,
        ]
      )
    );

    this.mentionableSelectMenus = new Collection<
      string,
      Interaction<boolean, boolean, boolean, boolean, "mentionableSelectMenu">
    >(
      (await loadInteractions("mentionableSelectMenus")).map(
        (
          b: Interaction<
            boolean,
            boolean,
            boolean,
            boolean,
            "mentionableSelectMenu"
          >
        ) => [(b.data.data as { custom_id: string }).custom_id, b]
      )
    );

    this.roleSelectMenus = new Collection<
      string,
      Interaction<boolean, boolean, boolean, boolean, "roleSelectMenu">
    >(
      (await loadInteractions("roleSelectMenus")).map(
        (
          b: Interaction<boolean, boolean, boolean, boolean, "roleSelectMenu">
        ) => [(b.data.data as { custom_id: string }).custom_id, b]
      )
    );

    this.stringSelectMenus = new Collection<
      string,
      Interaction<boolean, boolean, boolean, boolean, "stringSelectMenu">
    >(
      (await loadInteractions("stringSelectMenus")).map(
        (
          b: Interaction<boolean, boolean, boolean, boolean, "stringSelectMenu">
        ) => [(b.data.data as { custom_id: string }).custom_id, b]
      )
    );

    this.userSelectMenus = new Collection<
      string,
      Interaction<boolean, boolean, boolean, boolean, "userSelectMenu">
    >(
      (await loadInteractions("userSelectMenus")).map(
        (
          b: Interaction<boolean, boolean, boolean, boolean, "userSelectMenu">
        ) => [(b.data.data as { custom_id: string }).custom_id, b]
      )
    );

    this.cached = true;

    return this;
  }
}
