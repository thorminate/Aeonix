import { GuildMemberRoleManager, User } from "discord.js";
import LifecycleCachedManager from "../models/core/lifecycleCachedManager.js";
import Player, { playerModel } from "../models/player/player.js";
import Letter from "../models/player/utils/inbox/letter.js";
import PlayerRef from "../models/player/utils/types/playerRef.js";
import hardMerge from "../utils/hardMerge.js";
import aeonix from "../index.js";
import log from "../utils/log.js";
import TutorialQuestLetter from "../content/letters/tutorialQuestLetter.js";

export type PlayerCreationResult =
  | "playerAlreadyExists"
  | "notAnImageUrl"
  | "internalError";

export interface PlayerCreationOptions {
  user: User;
  name: string;
  avatar: string;
}

async function isImageUrl(url: string) {
  try {
    const response = await fetch(url, { method: "HEAD" });

    if (!response.ok) {
      return false;
    }

    const contentType = response.headers.get("content-type");
    return contentType && contentType.startsWith("image/");
  } catch {
    return false;
  }
}

export default class PlayerManager extends LifecycleCachedManager<Player> {
  getKey(instance: Player): string {
    return instance._id;
  }

  override onAccess(instance: Player): void {
    instance.lastAccessed = Date.now();
  }

  async load(id: string): Promise<Player | undefined> {
    const doc = await playerModel.findById(id);
    if (!doc) return undefined;

    const player = new Player();
    const instance = hardMerge(player, doc.toObject(), player.getClassMap());

    instance.inbox.letters = await Promise.all(
      instance.inbox.letters.map(async (letter) => {
        const RealClass = await this.aeonix?.letters.loadRaw(letter.type);

        if (!RealClass || RealClass === Letter) {
          // If no concrete class found, return the letter as is
          return letter;
        }

        return letter instanceof RealClass
          ? letter
          : hardMerge(new RealClass(), letter);
      })
    );

    this.set(instance);
    return instance;
  }

  async loadAll(noDuplicates: boolean = false): Promise<Player[]> {
    const allDocs = await playerModel.find({});
    if (allDocs.length === 0) return [];

    const total: Player[] = [];
    for (const doc of allDocs) {
      if (noDuplicates && this.has(doc._id)) continue;

      const player = new Player();
      const instance = hardMerge(player, doc.toObject(), player.getClassMap());

      total.push(instance);
      this.set(instance);
    }

    this.markReady();

    return total;
  }

  async create({
    user,
    name,
    avatar,
  }: PlayerCreationOptions): Promise<Player | PlayerCreationResult> {
    if (await aeonix.players.exists(user.id)) return "playerAlreadyExists";

    if (!avatar) avatar = user.displayAvatarURL();
    if (!(await isImageUrl(avatar))) return "notAnImageUrl";

    const player = new Player(user, name, avatar);

    const playerRole = aeonix.playerRoleId;

    if (!playerRole) {
      log({
        header: "Player role not found in environment variables",
        processName: "PlayerManager.create",
        type: "Error",
      });
      return "internalError";
    }

    const startChannel = await (
      await aeonix.environments.get("start")
    )?.fetchChannel();

    if (!startChannel) {
      log({
        header: "Start channel not found",
        processName: "PlayerManager.create",
        type: "Error",
      });
      return "internalError";
    }

    if (!startChannel.isTextBased()) {
      log({
        header: "Start channel is not a text channel",
        processName: "Onboarding1Modal",
        type: "Error",
      });
      return "internalError";
    }

    const member = await aeonix.guilds.cache
      .get(aeonix.guildId)
      ?.members.fetch(user.id);

    if (!member) {
      log({
        header: "Member not found",
        processName: "PlayerManager.create",
        type: "Error",
      });
      return "internalError";
    }

    await (member.roles as GuildMemberRoleManager).add(playerRole);

    await player.moveTo("start", true, true, true);

    player.inbox.add(new TutorialQuestLetter());

    await player.commit();

    aeonix.players.set(player);
    aeonix.players.markCreated(player._id);

    await startChannel.send({
      content: `<@${user.id}> has joined the game! Please check your inbox for further instructions (\`/inbox\`).`,
    });

    return player;
  }

  async getRef(id: string): Promise<PlayerRef | undefined> {
    const exists = await this.exists(id);
    return exists ? new PlayerRef(id) : undefined;
  }
}
