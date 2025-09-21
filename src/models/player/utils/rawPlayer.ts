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
  la!: number;
  dv!: number;

  b!: RawInbox;
  v!: RawInventory;
  l!: RawLocation;
  p!: RawPersona;
  q!: RawQuests;
  s!: RawSettings;
  t!: RawStats;
  a!: RawStatusEffects;

  constructor(player: Player | PlayerStorage) {
    if (player && isPlayerStorage(player)) {
      return {
        ...decode(zlib.inflateSync(semibinaryToBuffer(player.p))),
        _id: player._id,
      } as RawPlayer;
    }

    this._id = player._id;
    this.la = player.lastAccessed;
    this.dv = player.dataVersion;
    this.b = {
      0: player.inbox.letters.map((letter) => letter.toRaw()),
    };
    this.v = {
      0: player.inventory.entries.map((entry) => entry.toRaw()),
      1: player.inventory.capacity,
    };
    this.l = {
      0: player.location.id,
      1: player.location.channelId,
      2: player.location.adjacents,
    };
    this.p = {
      0: player.persona.name,
      1: player.persona.avatar,
    };
    this.q = {
      0: player.quests.quests.map((quest) => quest.toRaw()),
    };
    this.s = {
      0: player.settings.inboxShowArchived,
      1: player.settings.inboxShowNotifications,
    };
    this.t = {
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
    this.a = {
      0: player.statusEffects.effects.map((effect) => effect.toRaw()),
    };
  }
}
