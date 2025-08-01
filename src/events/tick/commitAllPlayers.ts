import Aeonix from "../../aeonix.js";
import Event from "../../models/core/event.js";
import log from "../../utils/log.js";

export async function commitAllPlayers(aeonix: Aeonix) {
  log({
    header: "Committing all players in cache",
    processName: "CommitAllPlayersFunction",
  });
  const allPlayers = await aeonix.players.getAll();

  for (const player of allPlayers) {
    await player.commit();
    log({
      header: `Committed player ${player.persona.name} (${player._id})`,
      processName: "CommitAllPlayersFunction",
    });
  }
}

export default new Event<"tick">({
  async callback({ aeonix }) {
    await commitAllPlayers(aeonix);
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
