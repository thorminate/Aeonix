import { ButtonStyle } from "discord.js";
import Interaction, {
  ButtonBuilderV2,
  InteractionTypes,
} from "../../../models/core/interaction.js";
import log from "../../../utils/log.js";

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
    log({
      header: "An interaction could not be handled correctly",
      processName: "InteractionHandler",
      payload: e,
      type: "Error",
    });
  },
});
