import {
  CacheType,
  CommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";
import Player from "../models/player/player.js";
import hardMerge from "../utils/hardMerge.js";
import log from "../utils/log.js";

export type CommandContext = Omit<
  CommandInteraction<CacheType>,
  "reply" | "deferReply" | "showModal"
>;

type CommandCallback<A extends boolean, P extends boolean> = A extends true
  ? P extends true
    ? (context: CommandContext, player: Player) => Promise<void>
    : (context: CommandContext) => Promise<void>
  : P extends true
  ? (context: CommandInteraction<CacheType>, player: Player) => Promise<void>
  : (context: CommandInteraction<CacheType>) => Promise<void>;

export interface ICommand<A extends boolean, P extends boolean> {
  data:
    | SlashCommandBuilder
    | SlashCommandOptionsOnlyBuilder
    | SlashCommandSubcommandsOnlyBuilder;
  permissionsRequired?: Array<bigint>;
  adminOnly?: boolean;
  acknowledge: A;
  deleted?: boolean;
  passPlayer: P;
  ephemeral?: boolean;
  callback: CommandCallback<A, P>;
  onError: (e: unknown) => void;
}

export default class Command<A extends boolean, P extends boolean>
  implements ICommand<A, P>
{
  data: SlashCommandBuilder = new SlashCommandBuilder();
  permissionsRequired?: Array<bigint> = [];
  adminOnly?: boolean = false;
  acknowledge: A = true as A;
  deleted?: boolean = false;
  passPlayer: P = false as P;
  ephemeral?: boolean = true;
  callback: CommandCallback<A, P> = async () =>
    log({
      header: "Command callback not implemented",
      processName: "CommandHandler",
      type: "Error",
    });

  onError: (e: unknown) => void = (e) => {
    log({
      header: "Command Error (error handler not implemented!)",
      processName: "CommandHandler",
      payload: e,
      type: "Error",
    });
  };

  constructor(commandObject: ICommand<A, P>) {
    return hardMerge(this, commandObject, { data: SlashCommandBuilder });
  }
}
