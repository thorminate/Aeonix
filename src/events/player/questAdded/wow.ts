import TestNotification from "../../../content/letters/testNotification/testNotification.js";
import PlayerEvent from "../../../models/core/playerEvent.js";
import log from "../../../utils/log.js";

export default new PlayerEvent<"questAdded">({
  callback: async ({ args: [quest], player }) => {
    const forgedNotification = new TestNotification();
    forgedNotification.subject = `New Quest: ${quest.name}`;
    player.notify(forgedNotification);
  },
  onError: (e) => {
    log({
      header: "Error with questAdded event",
      processName: "QuestAddedEvent",
      payload: e,
      type: "Error",
    });
  },
});
