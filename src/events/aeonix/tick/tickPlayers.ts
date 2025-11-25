import AeonixEvent from "../../../models/events/aeonixEvent.js";

export default new AeonixEvent<"tick">({
  async callback({ aeonix }) {
    await aeonix.savePlayers();
  },
  async onError(e, { aeonix }) {
    aeonix.logger.error("TickPlayers", "Error with tickPlayers event", e);
  },
});
