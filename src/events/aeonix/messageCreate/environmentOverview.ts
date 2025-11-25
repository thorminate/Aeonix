import AeonixEvent from "../../../models/events/aeonixEvent.js";
import channelToEnvironment from "../../../models/environment/utils/channelToEnvironment.js";

export default new AeonixEvent<"messageCreate">({
  async callback({ args: [message], aeonix }) {
    if (!message.guild || message.author.id === aeonix.user?.id) return;

    const env = await channelToEnvironment(message.channelId);
    if (!env) {
      return;
    }

    if (env.players.includes(message.author.id) && !message.author.bot) return;

    await env.updateOverviewMessage();
  },
  async onError(e, event) {
    event.aeonix.logger.error(
      "EnvironmentOverview",
      "Error with environmentOverview event",
      e,
      event
    );
  },
});
