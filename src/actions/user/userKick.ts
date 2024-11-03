import { GuildMemberRoleManager, ModalSubmitInteraction } from "discord.js";
import log from "../../utils/log";

interface Options {
  userId: string;
  reason: string;
}

export default async (
  interaction: ModalSubmitInteraction,
  options: Options
) => {
  const { userId, reason } = options;

  // get the target user object
  const user = await interaction.guild.members.fetch(userId);

  // check if the target user exists, else edit the reply and return
  if (!user) {
    await interaction.reply({
      content: "That user doesn't exist in this server.",
      ephemeral: true,
    });
    return;
  }

  // check if the target user is a bot
  if (user.user.bot) {
    await interaction.reply({
      content: "You cannot kick a bot.",
      ephemeral: true,
    });
    return;
  }

  // define the target user role position and request user role position
  const userRolePosition = user.roles.highest.position;
  const requesterRolePosition = (
    interaction.member.roles as GuildMemberRoleManager
  ).highest.position;

  // check if the target user is of a higher position than the request user
  if (userRolePosition >= requesterRolePosition) {
    await interaction.reply({
      content:
        "That user is of a higher position of the power hierarchy than you. Therefore you cannot kick them.",
      ephemeral: true,
    });
    return;
  }

  // kick the user
  try {
    await user.kick(reason);
    await interaction.reply({
      content: `The user <@${user.user.id}> has been kicked successfully.\n${reason}`,
      ephemeral: true,
    });
  } catch (error) {
    console.error("Error kicking user: ", error);
    log({
      header: "Error kicking user",
      payload: `${user.user.id} - ${user.user.tag}\n${error}`,
      type: "error",
    });
  }
};
