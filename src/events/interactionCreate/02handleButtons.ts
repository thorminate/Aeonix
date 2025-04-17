import {
  ButtonInteraction,
  MessageFlags,
  PermissionFlagsBits,
  PermissionsBitField,
} from "discord.js";
import Player from "../../models/Game/Player/Player.js";
import log from "../../utils/log.js";
import Button from "../../interactions/button.js";
import Event, { EventParams } from "../../models/Core/Event.js";
import path from "path";
import url from "url";
import getAllFiles from "../../utils/getAllFiles.js";

async function findLocalButtons() {
  let localCommands: Button[] = [];

  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

  const commandFiles = getAllFiles(
    path.join(__dirname, "..", "..", "interactions", "buttons")
  );

  for (const commandFile of commandFiles) {
    const filePath = path.resolve(commandFile);
    const fileUrl = url.pathToFileURL(filePath);
    const commandObject: Button = (await import(fileUrl.toString())).default;

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
    const button: Button | undefined = localButtons.find(
      (button: Button) => button.customId === buttonContext.customId
    );

    // if commandObject does not exist, return
    if (!button) return;

    // if command is devOnly and user is not an admin, return
    if (button.adminOnly) {
      if (
        !(buttonContext.member.permissions as PermissionsBitField).has(
          PermissionFlagsBits.Administrator
        )
      ) {
        buttonContext.reply({
          content: "Only administrators can run this command",
          flags: MessageFlags.Ephemeral,
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
          buttonContext.reply({
            content: "You don't have permissions to press this button.",
            flags: MessageFlags.Ephemeral,
          });
          return;
        }
      }
    }

    let player: Player;

    if (button.passPlayer) {
      player = await Player.find(buttonContext.user.username);

      if (!player) {
        buttonContext.reply({
          content: "You don't exist in the DB, run the /init command.",
          flags: MessageFlags.Ephemeral,
        });
        return;
      }
    }

    // if all goes well, run the button's callback function.
    await button
      .callback(buttonContext, player)
      .catch((e: Error) => button.onError(e));
  },
  onError: async (e: any) =>
    log({
      header: "A button could not be handled correctly",
      processName: "ButtonHandler",
      payload: e,
      type: "Error",
    }),
});
