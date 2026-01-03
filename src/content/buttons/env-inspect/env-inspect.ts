import { ButtonStyle } from "discord.js";
import Interaction, {
  ButtonBuilderV2,
  InteractionTypes,
} from "../../../models/events/interaction.js";
import aeonix from "../../../index.js";

export default new Interaction({
  data: new ButtonBuilderV2()
    .setCustomId("env-inspect")
    .setLabel("Inspect")
    .setStyle(ButtonStyle.Primary),

  interactionType: InteractionTypes.Button,

  ephemeral: true,
  acknowledge: true,
  passPlayer: true,
  environmentOnly: true,
  passEnvironment: true,

  async callback({ context, environment }) {
    await context.editReply({
      content: `Inspecting *\`${environment.name}\`*...`,
    });
  },
  onError(e) {
    aeonix.logger.error("EnvInspect", "Button Error", e);
  },
});
