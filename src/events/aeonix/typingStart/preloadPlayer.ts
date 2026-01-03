import AeonixEvent from "../../../models/events/aeonixEvent.js";

export default new AeonixEvent<"typingStart">({
  async callback({ aeonix, args: [typeContext] }) {
    const userId = typeContext.user.id;
    await aeonix.players.preload(userId);
  },

  onError(e, { aeonix }) {
    aeonix.logger.error("PreloadPlayer", "Error with preloadPlayer event", e);
  },
});
