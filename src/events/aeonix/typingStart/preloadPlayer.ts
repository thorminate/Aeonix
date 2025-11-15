import AeonixEvent from "../../../models/events/aeonixEvent.js";
import log from "../../../utils/log.js";

export default new AeonixEvent<"typingStart">({
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
