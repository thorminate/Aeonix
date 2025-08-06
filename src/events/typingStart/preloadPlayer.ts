import Event from "../../models/core/event.js";
import log from "../../utils/log.js";

export default new Event<"typingStart">({
  async callback({ aeonix, args: [typeContext] }) {
    log({
      header: "typingStart event",
      processName: "TypingStartEvent",
      payload: typeContext,
    });
    const userId = typeContext.user.id;
    aeonix.players.preload(userId);
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
