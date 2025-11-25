import AeonixEvent from "../../../models/events/aeonixEvent.js";

export default new AeonixEvent<"tick">({
  async callback({ aeonix }) {
    await aeonix.saveEnvironments();
  },
  async onError(e, { aeonix }) {
    aeonix.logger.error(
      "TickEnvironments",
      "Error with tickEnvironments event",
      e
    );
  },
});
