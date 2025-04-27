import {
  ButtonInteraction,
  MessageFlags,
  PermissionFlagsBits,
  PermissionsBitField,
} from "discord.js";
import Player from "../../models/player/player.js";
import log from "../../utils/log.js";
import Button from "../../interactions/button.js";
import Event, { EventParams } from "../../models/core/event.js";
import path from "path";
import url from "url";
import getAllFiles from "../../utils/getAllFiles.js";

async function findLocalButtons() {
  let localCommands: Button<boolean, boolean>[] = [];

  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

  const commandFiles = getAllFiles(
    path.join(__dirname, "..", "..", "interactions", "buttons")
  );

  for (const commandFile of commandFiles) {
    const filePath = path.resolve(commandFile);
    const fileUrl = url.pathToFileURL(filePath);
    const commandObject: Button<boolean, boolean> = (
      await import(fileUrl.toString())
    ).default;

    localCommands.push(commandObject);
  }

  return localCommands;
}

export default new Event({
  callback: async (event: EventParams) => {
    const buttonContext = event.context as ButtonInteraction;

    if (!buttonContext.isButton()) return;

    const localButtons = await findLocalButtons();

    // check if command name is in localCommands
    const button: Button<boolean, boolean> | undefined = localButtons.find(
      (button: Button<boolean, boolean>) =>
        button.customId === buttonContext.customId
    );

    // if commandObject does not exist, return
    if (!button) return;

    if (!buttonContext.inGuild()) {
      log({
        header: "Interaction is not in a guild",
        processName: "ButtonHandler",
        payload: buttonContext,
        type: "Error",
      });
      return;
    }

    if (button.acknowledge) {
      await buttonContext.deferReply({
        flags: button.ephemeral ? MessageFlags.Ephemeral : undefined,
      });
    }

    if (!buttonContext.member) {
      log({
        header: "Interaction member is falsy",
        processName: "ButtonHandler",
        payload: buttonContext,
        type: "Error",
      });
      return;
    }

    // if command is devOnly and user is not an admin, return
    if (button.adminOnly) {
      if (
        !(buttonContext.member.permissions as PermissionsBitField).has(
          PermissionFlagsBits.Administrator
        )
      ) {
        await buttonContext.editReply({
          content: "Only administrators can run this command",
        });
        return;
      }
    }

    // if button requires permissions and user does not have aforementioned permission, return
    if (button.permissionsRequired?.length) {
      for (const permission of button.permissionsRequired) {
        if (
          !(buttonContext.member.permissions as PermissionsBitField).has(
            permission
          )
        ) {
          await buttonContext.editReply({
            content: "You don't have permissions to press this button.",
          });
          return;
        }
      }
    }

    let player: Player | undefined;

    if (button.passPlayer) {
      let foundPlayer: Player | undefined = await Player.find(
        buttonContext.user.username
      );

      if (!foundPlayer) {
        await buttonContext.editReply({
          content: "You don't exist in the DB, run the /init command.",
        });
        return;
      }

      player = foundPlayer;
    }
    // if all goes well, run the button's callback function.
    await button
      .callback(buttonContext, player as Player)
      .catch((e: unknown) => {
        try {
          button.onError(e);
        } catch (e) {
          log({
            header: "Error in button error handler",
            processName: "ButtonHandler",
            payload: e,
            type: "Error",
          });
        }
      });
  },
  onError: async (e: any) =>
    log({
      header: "A button could not be handled correctly",
      processName: "ButtonHandler",
      payload: e,
      type: "Error",
    }),
});
