import DiscordEvent from "../../../models/core/event.js";
import log from "../../../utils/log.js";

export default new DiscordEvent<"typingStart">({
  async callback({ aeonix, args: [typeContext] }) {
    const userId = typeContext.user.id;
    await aeonix.players.preload(userId);
  },

  onError(e) {
    log({
      header: "Error with typingStart event",
      processName: "TypingStartEvent",
      payload: e,
      type: "Error",
    });
  },
});
