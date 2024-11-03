import { GuildMemberRoleManager, ModalSubmitInteraction } from "discord.js";
import ms from "ms";
import log from "../../utils/log";

interface Options {
  userId: string;
  reason: string;
  duration: string;
}

export default async (
  interaction: ModalSubmitInteraction,
  options: Options
) => {
  const { userId, reason, duration } = options;

  // get the target user object
  const user = await interaction.guild.members.fetch(userId);

  // check if the target user exists, else edit the reply and return
  if (!user) {
    await interaction.reply({
      content: `That user doesn't exist in this server.\n${reason}`,
      ephemeral: true,
    });
    return;
  }

  //get duration in ms
  const durationMs = ms(duration);

  //check if duration is valid
  if (
    isNaN(durationMs) ||
    durationMs < 5 * 1000 ||
    durationMs > 28 * 24 * 60 * 60 * 1000
  ) {
    await interaction.reply({
      content:
        "Invalid duration. Please enter a valid duration. Alike 2h or 7 days. Cannot be longer than 28 days or shorter than 5 seconds.",
      ephemeral: true,
    });
    return;
  }

  // check if the target user is of a higher position than the request user
  if (
    user.roles.highest.position >=
    (interaction.member.roles as GuildMemberRoleManager).highest.position
  ) {
    await interaction.reply({
      content:
        "That user is of a higher position of the power hierarchy than you. Therefore you cannot timeout them.",
      ephemeral: true,
    });
    return;
  }

  // timeout the user
  try {
    await user.timeout(durationMs, reason);
    await interaction.reply({
      content: `The user <@${user.user.id}> has been timed out successfully.\n${reason}`,
      ephemeral: true,
    });
  } catch (error) {
    console.error("Error timing out user: ", error);
    log({
      header: "Error timing out user",
      payload: `${user.user.id} - ${user.user.tag}\n${error}`,
      type: "error",
    });
  }
};
