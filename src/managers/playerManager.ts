import { GuildMemberRoleManager, User } from "discord.js";
import LifecycleCachedManager from "../models/core/lifecycleCachedManager.js";
import Player from "../models/player/player.js";
import PlayerRef from "../models/player/utils/playerRef.js";
import aeonix from "../index.js";
import log from "../utils/log.js";
import TutorialQuestLetter from "../content/letters/tutorialQuestLetter/tutorialQuestLetter.js";
import { Model } from "mongoose";
import PlayerStorage from "../models/player/utils/playerStorage.js";
import playerModel from "../models/player/utils/playerModel.js";
import BackpackItem from "../content/items/backpackItem/backpackItem.js";
import { decode } from "cbor2";
import semibinaryToBuffer from "../models/player/utils/semibinaryToBuffer.js";
import { SerializedData } from "../models/core/serializable.js";
import { inflateSync } from "zlib";

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

  async inst(): Promise<Player> {
    return await Player.create();
  }

  override async onAccess(instance: Player): Promise<void> {
    instance.lastAccessed = Date.now();
  }

  async onSave(inst: Player): Promise<PlayerStorage | undefined> {
    const rawPlayer = await inst.serialize();

    if (!rawPlayer) {
      log({
        header: `Player ${inst._id} could not be serialized, skipping save`,
        type: "Error",
        processName: "PlayerManager.onSave",
      });
      return;
    }

    // Compress class and convert to pojo
    const compressed = new PlayerStorage(rawPlayer);

    return compressed;
  }

  async onLoad(data: PlayerStorage): Promise<Player> {
    const uncompressed = (() => {
      const uncompressed = decode(inflateSync(semibinaryToBuffer(data.d)));
      const obj: SerializedData = {
        d: uncompressed,
        v: data.v,
      } as SerializedData;

      if (data._id) obj._id = data._id;

      return obj;
    })();

    // Uncompress pojo
    const inst = await Player.deserialize(uncompressed);

    // Fetch all the data for quick use
    inst.user = await inst.fetchUser();
    inst.environment = await inst.fetchEnvironment();
    inst.environmentChannel = await inst.fetchEnvironmentChannel();
    inst.dmChannel = await inst.user?.createDM().catch(() => undefined);

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

    const player = await Player.create({ user, name, avatar });

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

    player.inbox.add(new TutorialQuestLetter());

    player.inventory.add(new BackpackItem());

    aeonix.players.set(player);
    aeonix.players.markCreated(player._id);

    await startChannel.send({
      content: `<@${user.id}> has joined the game! Please check your inbox for further instructions (\`/inbox\`).`,
    });

    log({
      header: "Player created",
      processName: "PlayerManager.create",
      type: "Info",
      payload: player,
    });

    return player;
  }
}
