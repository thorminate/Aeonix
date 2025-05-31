import { SlashCommandBuilder } from "discord.js";
import Command from "../command.js";
import log from "../../utils/log.js";

export default new Command({
  data: new SlashCommandBuilder()
    .setName("travel")
    .setDescription("Travel")
    .addStringOption((option) =>
      option
        .setName("location")
        .setDescription("Where do you want to go?")
        .setRequired(true)
    ),
  passPlayer: true,
  acknowledge: true,
  ephemeral: true,
  callback: async (context, player) => {
    const locationOption = context.options.get("location", true)
      .value as string;

    await player.moveTo(locationOption);

    await player.save();

    await context.editReply({
      content: `You have moved to ${locationOption}.`,
    });
  },
  onError(e) {
    log({
      header: "Travel command could not be handled correctly",
      processName: "TravelCommandHandler",
      payload: e,
      type: "Error",
    });
  },
});
