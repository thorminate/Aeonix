import { decode } from "cbor2";
import Player from "../player.js";
import { RawInbox } from "./inbox/inbox.js";
import { RawInventory } from "./inventory/inventory.js";
import isPlayerStorage from "./isPlayerStorage.js";
import { RawLocation } from "./location/location.js";
import { RawPersona } from "./persona/persona.js";
import PlayerStorage from "./playerStorage.js";
import { RawQuests } from "./quests/quests.js";
import semibinaryToBuffer from "./semibinaryToBuffer.js";
import { RawSettings } from "./settings/settings.js";
import { RawStats } from "./stats/stats.js";
import { RawStatusEffects } from "./statusEffects/statusEffects.js";
import zlib from "zlib";

export default class RawPlayer {
  _id!: string;
  0!: number; // lastAccessed
  1!: number; // dataVersion

  2!: RawInbox; // inbox
  3!: RawInventory; // inventory
  4!: RawLocation; // location
  5!: RawPersona; // persona
  6!: RawQuests; // quests
  7!: RawSettings; // settings
  8!: RawStats; // stats
  9!: RawStatusEffects; // statusEffects

  constructor(player: Player | PlayerStorage) {
    if (player && isPlayerStorage(player)) {
      return {
        ...decode(zlib.inflateSync(semibinaryToBuffer(player.p))),
        _id: player._id,
      } as RawPlayer;
    }

    this._id = player._id;
    this[0] = player.lastAccessed;
    this[1] = player.dataVersion;
    this[2] = {
      0: player.inbox.letters.map((letter) => letter.toRaw()),
    };
    this[3] = {
      0: player.inventory.entries.map((entry) => entry.toRaw()),
      1: player.inventory.capacity,
    };
    this[4] = {
      0: player.location.id,
      1: player.location.channelId,
      2: player.location.adjacents,
    };
    this[5] = {
      0: player.persona.name,
      1: player.persona.avatar,
    };
    this[6] = {
      0: player.quests.quests.map((quest) => quest.toRaw()),
    };
    this[7] = {
      0: player.settings.inboxShowArchived,
      1: player.settings.inboxShowNotifications,
    };
    this[8] = {
      0: player.stats.level,
      1: player.stats.xp,
      2: player.stats.maxHealth,
      3: player.stats.health,
      4: player.stats.strength,
      5: player.stats.will,
      6: player.stats.cognition,
      7: player.stats.hasNausea,
      8: player.stats.hasCompletedTutorial,
    };
    this[9] = {
      0: player.statusEffects.effects.map((effect) => effect.toRaw()),
    };
  }
}
