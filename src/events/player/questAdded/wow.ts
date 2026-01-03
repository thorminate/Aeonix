import TestNotification from "../../../content/letters/testNotification/testNotification.js";
import PlayerEvent from "../../../models/events/playerEvent.js";

export default new PlayerEvent<"questAdded">({
  callback: async ({ args: [quest], player }) => {
    const forgedNotification = new TestNotification();
    forgedNotification.subject = `New Quest: ${quest.name}`;
    player.notify(forgedNotification);
  },
  onError: (e, { aeonix }) => {
    aeonix.logger.error("QuestAdded", "Error with questAdded event", e);
  },
});
