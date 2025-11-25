import EnvironmentEvent from "../../../models/events/environmentEvent.js";

export default new EnvironmentEvent<"itemDropped">({
  async callback({ env }) {
    await env.updateOverviewMessage();
  },
  onError(e, { aeonix }) {
    aeonix.logger.error(
      "UpdateEnvOverview",
      "Error with updateEnvOverview event",
      e
    );
  },
});
