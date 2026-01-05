import { GuildMemberRoleManager, User } from "discord.js";
import Player from "#player/player.js";
import PlayerRef from "#player/utils/playerRef.js";
import aeonix from "#root/index.js";
import TutorialQuestLetter from "#letters/tutorialQuestLetter/tutorialQuestLetter.js";
import { Model } from "mongoose";
import PlayerStorage from "#player/utils/playerStorage.js";
import playerModel from "#player/utils/playerModel.js";
import BackpackItem from "#items/backpackItem/backpackItem.js";
import { decode } from "cbor2";
import semibinaryToBuffer from "#player/utils/semibinaryToBuffer.js";
import { SerializedData } from "#core/serializable.js";
import { inflateSync } from "zlib";
import PlayerEventsManager from "#player/utils/playerEvents.js";
import LifecycleCachedManager from "#manager/lifecycleCachedManager.js";

export type PlayerCreationResult =
  | "playerAlreadyExists"
  | "notAnImageUrl"
  | "internalError";

export interface PlayerCreationOptions {
  user: User;
  name: string;
  avatar: string;
  race?: string;
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
      this.aeonix?.logger.error(
        "PlayerManager.onSave",
        `Player ${inst._id} could not be serialized, skipping save`,
        inst
      );
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
    inst.dmChannel = await inst.fetchDMChannel();

    return inst;
  }

  async getRef(id: string): Promise<PlayerRef | undefined> {
    return (await this.exists(id)) ? new PlayerRef(id) : undefined;
  }

  async create({
    user,
    name,
    avatar,
    race,
  }: PlayerCreationOptions): Promise<Player | PlayerCreationResult> {
    const log = aeonix.logger.for("PlayerManager.create");
    if (await aeonix.players.exists(user.id)) return "playerAlreadyExists";

    if (!avatar) avatar = user.displayAvatarURL();
    if (!(await isImageUrl(avatar))) return "notAnImageUrl";

    const player = await Player.create({ user, name, avatar, race });

    const playerRole = aeonix.playerRoleId;

    if (!playerRole) {
      log.error("Player role not found in environment variables");
      return "internalError";
    }

    const startChannel = await (
      await aeonix.environments.get("start")
    )?.fetchChannel();

    if (!startChannel) {
      log.error("Start channel not found");
      return "internalError";
    }

    if (!startChannel.isTextBased()) {
      log.error("Start channel is not a text channel");
      return "internalError";
    }

    const member = await aeonix.guilds.cache
      .get(aeonix.guildId)
      ?.members.fetch(user.id);

    if (!member) {
      log.error("Member not found in guild", aeonix.guildId, user.id);
      return "internalError";
    }

    await (member.roles as GuildMemberRoleManager).add(playerRole);

    await player.moveTo("start", true, true, true);

    player.inbox.add(new TutorialQuestLetter());

    player.inventory.add(new BackpackItem());

    aeonix.players.set(player);
    aeonix.players.markCreated(player._id);

    const inboxCmdId = (await aeonix.commands.get("inbox"))?.id;

    await startChannel.send({
      content: `<@${
        user.id
      }> has joined the game! Please check your inbox for further instructions (${
        inboxCmdId ? `</inbox:${inboxCmdId}>` : "/inbox"
      }).`,
    });

    player.environmentChannel = await player.fetchEnvironmentChannel();
    player.dmChannel = await player.user?.createDM().catch(() => undefined);
    player.user = await player.fetchUser();
    player.environment = await player.fetchEnvironment();

    player._events = new PlayerEventsManager(player);

    return player;
  }
}
