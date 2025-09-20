import { GuildMemberRoleManager, User } from "discord.js";
import LifecycleCachedManager from "../models/core/lifecycleCachedManager.js";
import Player from "../models/player/player.js";
import PlayerRef from "../models/player/utils/playerRef.js";
import aeonix from "../index.js";
import log from "../utils/log.js";
import TutorialQuestLetter from "../content/letters/tutorialQuestLetter/tutorialQuestLetter.js";
import { Model } from "mongoose";
import elementsFixer from "../utils/elementFixer.js";
import PlayerStorage from "../models/player/utils/playerStorage.js";
import playerModel from "../models/player/utils/playerModel.js";

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

export default class PlayerManager extends LifecycleCachedManager<
  Player,
  PlayerStorage
> {
  getKey(instance: Player): string {
    return instance._id;
  }

  model(): Model<PlayerStorage> {
    return playerModel;
  }

  inst(): Player {
    return new Player();
  }

  override async onAccess(instance: Player): Promise<void> {
    instance.lastAccessed = Date.now();
  }

  // TODO: add other storage saving methods

  async onSave(instance: Player): Promise<PlayerStorage> {
    // Compress class and convert to pojo
    const compressed = new PlayerStorage(instance);

    return compressed;
  }

  async onLoad(data: PlayerStorage): Promise<Player> {
    // Uncompress pojo
    const inst = new Player(data);

    // Fetch all the data for quick use
    inst.user = await inst.fetchUser();
    inst.environment = await inst.fetchEnvironment();
    inst.environmentChannel = await inst.fetchEnvironmentChannel();
    inst.dmChannel = await inst.user?.createDM();

    // Set up letters
    inst.inbox.letters = await elementsFixer(
      inst.inbox.letters,
      (id: string) => this.aeonix!.letters.loadRaw(id),
      (inst) => inst.id
    );

    return inst;
  }

  async getRef(id: string): Promise<PlayerRef | undefined> {
    const exists = await this.exists(id);
    return exists ? new PlayerRef(id) : undefined;
  }

  async create({
    user,
    name,
    avatar,
  }: PlayerCreationOptions): Promise<Player | PlayerCreationResult> {
    if (await aeonix.players.exists(user.id)) return "playerAlreadyExists";

    if (!avatar) avatar = user.displayAvatarURL();
    if (!(await isImageUrl(avatar))) return "notAnImageUrl";

    const player = new Player({ user, name, avatar });

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

    await player.moveTo("start", true, true, true, true);

    player.inbox.add(
      (await aeonix.letters.get("tutorialQuestLetter")) ??
        new TutorialQuestLetter()
    );

    aeonix.players.set(player);
    aeonix.players.markCreated(player._id);

    await startChannel.send({
      content: `<@${user.id}> has joined the game! Please check your inbox for further instructions (\`/inbox\`).`,
    });

    return player;
  }
}
