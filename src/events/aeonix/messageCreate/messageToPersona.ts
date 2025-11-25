import { Message } from "discord.js";
import AeonixEvent from "../../../models/events/aeonixEvent.js";

export default new AeonixEvent<"messageCreate">({
  async callback({ args: [context], aeonix }) {
    if (!(context instanceof Message)) return;

    if (context.author.bot) return;

    const player = await aeonix.players.getRef(context.author.id);

    if (!player) {
      context.reply({
        content: `You don't have a persona. Run </init:${
          (await aeonix.commands.get("init"))?.id
        }> to create one.`,
      });
      return;
    }

    await player.use(async (p) => {
      const channel = await (await p.fetchEnvironment())?.fetchChannel();

      if (!channel) return;

      if (channel.id !== context.channelId) return;

      const webhook = (await channel.fetchWebhooks()).first();

      if (!webhook) throw new Error("Webhook not found");

      await Promise.all([
        await webhook.send({
          content: context.content,
          username: p.persona.name,
          avatarURL: p.persona.avatar,
        }),
        await context.delete(),
      ]);
    });
  },
  async onError(e, { aeonix }) {
    aeonix.logger.error(
      "MessageToPersona",
      "Error with messageToPersona event",
      e
    );
  },
});
