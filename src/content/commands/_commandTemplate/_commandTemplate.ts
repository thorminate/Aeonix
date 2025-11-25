import { SlashCommandBuilder } from "discord.js";
import Interaction, {
  InteractionTypes,
} from "../../../models/events/interaction.js";

export default new Interaction({
  data: new SlashCommandBuilder()
    .setName("template")
    .setDescription("Template"),

  interactionType: InteractionTypes.Command,
  ephemeral: true,

  callback: async ({ context }) => {
    await context.editReply("Template command executed!");
  },

  onError: (e, aeonix) => {
    aeonix.logger.error("TemplateCommand", "Command Error", e);
  },
});
