import Aeonix from "../../aeonix.js";
import Event from "../../models/core/event.js";
import log from "../../utils/log.js";

export async function tickPlayers(aeonix: Aeonix) {
  const allPlayers = await aeonix.players.getAll();

  for (const player of allPlayers) {
    const diff = Date.now() - player.lastAccessed!;

    // if the difference is bigger than 15 minutes, unload the player from the cache
    if (diff > aeonix.tickInterval) {
      await player.commit(false);
      aeonix.players.release(player._id);
    } else {
      await player.commit();
    }
  }
}

export default new Event<"tick">({
  async callback({ aeonix }) {
    await tickPlayers(aeonix);
  },
  async onError(e) {
    log({
      header: "Error with commitAllPlayers event",
      processName: "CommitAllPlayersEvent",
      payload: e,
      type: "Error",
    });
  },
});
