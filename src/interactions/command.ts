import { CacheType, CommandInteraction, SlashCommandBuilder } from "discord.js";
import Player from "../models/game/player/player.js";
import deepInstantiate from "../utils/deepInstantiate.js";
import log from "../utils/log.js";

export type CmdInteraction = Omit<
  CommandInteraction<CacheType>,
  "reply" | "deferReply"
>;
export interface ICommand {
  data: SlashCommandBuilder;
  permissionsRequired?: Array<bigint>;
  adminOnly?: boolean;
  deleted?: boolean;
  passPlayer?: boolean;
  ephemeral?: boolean;
  callback: (context: CmdInteraction, player?: Player) => Promise<void>;
  onError: (error: Error) => void;
}

export default class Command implements ICommand {
  data: SlashCommandBuilder = new SlashCommandBuilder();
  permissionsRequired?: Array<bigint> = [];
  adminOnly?: boolean = false;
  deleted?: boolean = false;
  passPlayer?: boolean = false;
  ephemeral?: boolean = true;
  callback: (context: CmdInteraction, player?: Player) => Promise<void> =
    async () => {
      log({
        header: "Command callback not implemented",
        processName: "CommandHandler",
        type: "Error",
      });
    };
  onError: (error: unknown) => void = (e) => {
    log({
      header: "Command Error (error handler not implemented!)",
      processName: "CommandHandler",
      payload: e,
      type: "Error",
    });
  };

  constructor(commandObject: ICommand) {
    return deepInstantiate(this, commandObject, { data: SlashCommandBuilder });
  }
}
