import EnvironmentEvent from "#core/environmentEvent.js";

export default new EnvironmentEvent<"itemAdded">({
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
