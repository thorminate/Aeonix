import AeonixEvent from "../../../models/events/aeonixEvent.js";
import channelToEnvironment from "../../../models/environment/utils/channelToEnvironment.js";
import log from "../../../utils/log.js";

export default new AeonixEvent<"messageCreate">({
  async callback({ args: [message], aeonix }) {
    if (!message.guild || message.author.id === aeonix.user?.id) return;

    const env = await channelToEnvironment(message.channelId);
    if (!env) {
      return;
    }

    if (env.players.includes(message.author.id) && !message.author.bot) return;

    const lastMsg = await env.fetchLastOverviewMessage().catch(() => undefined);

    const [, msg] = await Promise.all([
      lastMsg?.delete(),
      message.channel.send(env.overview()),
    ]);

    env.overviewMessageId = msg.id;
  },
  async onError(e, event) {
    log({
      header: "Error with environmentOverview event",
      processName: "EnvironmentOverviewEvent",
      payload: [e, event],
      type: "Error",
    });
  },
});
