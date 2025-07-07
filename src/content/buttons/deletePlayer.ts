import { ButtonStyle } from "discord.js";
import Player from "../../models/player/player.js";
import log from "../../utils/log.js";
import deletePlayerConfirmed from "./deletePlayerConfirmed.js";
import componentWrapper from "../../utils/componentWrapper.js";
import Interaction, {
  ButtonBuilderV2,
  ITypes,
} from "../../models/core/interaction.js";

export default new Interaction({
  data: new ButtonBuilderV2()
    .setCustomId("deletePlayer")
    .setLabel("Delete")
    .setStyle(ButtonStyle.Danger),

  interactionType: ITypes.Button,
  acknowledge: false,
  passPlayer: false,
  environmentOnly: false,
  passEnvironment: false,

  callback: async ({ context }) => {
    if (!(await Player.find(context.user.id))) {
      await context.update({
        content:
          "You don't exist in the database, therefore you cannot be deleted.",
      });
      return;
    }

    await context.update({
      content: "Are you sure you want to delete your persona?",
      components: componentWrapper(deletePlayerConfirmed.data),
    });
  },

  onError(e) {
    log({
      header: "Button Error",
      processName: "DeletePlayerButton",
      payload: e,
      type: "Error",
    });
  },
});
