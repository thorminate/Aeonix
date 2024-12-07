/**
 * Handles the slash commands.
 * @param {Client} bot The instantiating client.
 * @param {Interaction} interaction The interaction that ran the command.
 */
import getLocalCommands from "../../utils/getLocalCommands";
import { Client, CommandInteraction, PermissionsBitField } from "discord.js";
import log from "../../utils/log";

export default async (bot: Client, commandInteraction: CommandInteraction) => {
  if (!commandInteraction.isChatInputCommand()) return;
  // get already registered commands
  const localCommands = await getLocalCommands();

  try {
    // check if command name is in localCommands
    const commandObject = localCommands.find(
      (cmd) => cmd.name === commandInteraction.commandName
    );

    // if commandObject does not exist, return
    if (!commandObject) return;

    // if command is devOnly and user is not an admin, return
    if (commandObject.adminOnly) {
      if (
        !(commandInteraction.member.permissions as PermissionsBitField).has(
          PermissionsBitField.Flags.Administrator
        )
      ) {
        commandInteraction.reply({
          content: "Only administrators can run this command",
          ephemeral: true,
        });
        return;
      }
    }

    // if where the command is called was not in the main server, return
    if (!(commandInteraction.guild.id === "1267928656877977670")) {
      commandInteraction.reply({
        content: "Nuh uh, wrong server.",
        ephemeral: true,
      });
      return;
    }
    // if command requires permissions and user does not have aforementioned permission, return
    if (commandObject.permissionsRequired?.length) {
      for (const permission of commandObject.permissionsRequired) {
        if (
          !(commandInteraction.member.permissions as PermissionsBitField).has(
            permission as PermissionsBitField
          )
        ) {
          commandInteraction.reply({
            content: "Access Denied",
            ephemeral: true,
          });
          return;
        }
      }
    }
    // if command requires bot permissions and bot does not have aforementioned permission, return
    if (commandObject.botPermissions?.length) {
      for (const permission of commandObject.botPermissions) {
        const bot = commandInteraction.guild.members.me;

        if (!bot.permissions.has(permission)) {
          commandInteraction.reply({
            content: "I don't have enough permissions.",
            ephemeral: true,
          });
          return;
        }
      }
    }
    // if all goes well, run the commands callback function.
    await commandObject.callback(commandInteraction.client, commandInteraction);
  } catch (error) {
    console.log(`There was an error running this command: ${error}`);
    log({
      header: "Command Error",
      payload: `${error}`,
      type: "error",
    });
  }
};
