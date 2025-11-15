import AeonixEvent from "../../../models/events/aeonixEvent.js";
import log from "../../../utils/log.js";

export default new AeonixEvent<"tick">({
  async callback({ aeonix }) {
    await aeonix.savePlayers();
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
