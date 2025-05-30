import { Message } from "discord.js";
import Event from "../../models/core/event.js";
import Player from "../../models/player/player.js";

export default new Event({
  async callback({ context }) {
    if (!(context instanceof Message)) return;

    if (context.author.bot) return;

    const player = await Player.find(context.author.id);

    if (!player) {
      context.reply({
        content: "You don't have a persona. Run ``/init`` to create one.",
      });
      return;
    }

    const playerEnvChannel = await (
      await player?.fetchEnvironment()
    )?.fetchChannel();

    if (!playerEnvChannel) return;

    if (playerEnvChannel.id !== context.channelId) return;

    const webhook = (await playerEnvChannel.fetchWebhooks()).first();

    if (!webhook) throw new Error("Webhook not found");

    await Promise.all([
      await webhook.send({
        content: context.content,
        username: player.persona.name,
        avatarURL: player.persona.avatarURL,
      }),
      await context.delete(),
    ]);
  },
  async onError(e) {},
});
