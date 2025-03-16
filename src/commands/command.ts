import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export default interface Command {
  data: SlashCommandBuilder;
  permissionsRequired?: Array<bigint>;
  adminOnly?: boolean;
  deleted?: boolean;
  callback: (interaction: CommandInteraction) => Promise<void>;
}
