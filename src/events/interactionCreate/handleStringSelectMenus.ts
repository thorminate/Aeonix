import {
  MessageFlags,
  PermissionFlagsBits,
  PermissionsBitField,
  StringSelectMenuInteraction,
} from "discord.js";
import Player from "../../models/player/player.js";
import log from "../../utils/log.js";
import Event, { EventParams } from "../../models/core/event.js";
import path from "path";
import url from "url";
import getAllFiles from "../../utils/getAllFiles.js";
import StringSelectMenu from "../../interactions/stringSelectMenu.js";

async function findLocalStringSelectMenus() {
  const localCommands: StringSelectMenu<boolean, boolean>[] = [];

  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

  const commandFiles = getAllFiles(
    path.join(__dirname, "..", "..", "interactions", "stringSelectMenus")
  );

  for (const commandFile of commandFiles) {
    const filePath = path.resolve(commandFile);
    const fileUrl = url.pathToFileURL(filePath);
    const commandObject: StringSelectMenu<boolean, boolean> = (
      await import(fileUrl.toString())
    ).default;

    localCommands.push(commandObject);
  }

  return localCommands;
}

export default new Event({
  callback: async (event: EventParams) => {
    const stringSelectMenuContext =
      event.context as StringSelectMenuInteraction;

    if (!stringSelectMenuContext.isStringSelectMenu()) return;

    const localStringSelectMenus = await findLocalStringSelectMenus();

    // check if command name is in localCommands
    const stringSelectMenu: StringSelectMenu<boolean, boolean> | undefined =
      localStringSelectMenus.find(
        (button: StringSelectMenu<boolean, boolean>) =>
          button.customId === stringSelectMenuContext.customId
      );

    // if commandObject does not exist, return
    if (!stringSelectMenu) return;

    if (!stringSelectMenuContext.inGuild()) {
      log({
        header: "Interaction is not in a guild",
        processName: "ButtonHandler",
        payload: stringSelectMenuContext,
        type: "Error",
      });
      return;
    }

    if (stringSelectMenu.acknowledge) {
      await stringSelectMenuContext.deferReply({
        flags: stringSelectMenu.ephemeral ? MessageFlags.Ephemeral : undefined,
      });
    }

    if (!stringSelectMenuContext.member) {
      log({
        header: "Interaction member is falsy",
        processName: "ButtonHandler",
        payload: stringSelectMenuContext,
        type: "Error",
      });
      return;
    }

    // if command is devOnly and user is not an admin, return
    if (stringSelectMenu.adminOnly) {
      if (
        !(
          stringSelectMenuContext.member.permissions as PermissionsBitField
        ).has(PermissionFlagsBits.Administrator)
      ) {
        await stringSelectMenuContext.editReply({
          content: "Only administrators can run this command",
        });
        return;
      }
    }

    // if button requires permissions and user does not have aforementioned permission, return
    if (stringSelectMenu.permissionsRequired?.length) {
      for (const permission of stringSelectMenu.permissionsRequired) {
        if (
          !(
            stringSelectMenuContext.member.permissions as PermissionsBitField
          ).has(permission)
        ) {
          await stringSelectMenuContext.editReply({
            content: "You don't have permissions to press this button.",
          });
          return;
        }
      }
    }

    let player: Player | undefined;

    if (stringSelectMenu.passPlayer) {
      const foundPlayer: Player | undefined = await Player.find(
        stringSelectMenuContext.user.username
      );

      if (!foundPlayer) {
        await stringSelectMenuContext.editReply({
          content: "You don't exist in the DB, run the /init command.",
        });
        return;
      }

      player = foundPlayer;
    }
    // if all goes well, run the button's callback function.
    await stringSelectMenu
      .callback(stringSelectMenuContext, player as Player)
      .catch((e: unknown) => {
        try {
          stringSelectMenu.onError(e);
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
  onError: async (e) =>
    log({
      header: "A button could not be handled correctly",
      processName: "ButtonHandler",
      payload: e,
      type: "Error",
    }),
});
