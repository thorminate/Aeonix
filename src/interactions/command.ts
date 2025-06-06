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

type CommandCallback<
  Acknowledge extends boolean,
  PassPlayer extends boolean
> = Acknowledge extends true
  ? PassPlayer extends true
    ? (context: CommandContext, player: Player) => Promise<void>
    : (context: CommandContext) => Promise<void>
  : PassPlayer extends true
  ? (context: CommandInteraction<CacheType>, player: Player) => Promise<void>
  : (context: CommandInteraction<CacheType>) => Promise<void>;

type EnvironmentOnly<PassPlayer extends boolean> = PassPlayer extends true
  ? boolean
  : false;

export interface ICommand<
  Acknowledge extends boolean,
  PassPlayer extends boolean
> {
  data:
    | SlashCommandBuilder
    | SlashCommandOptionsOnlyBuilder
    | SlashCommandSubcommandsOnlyBuilder;
  permissionsRequired?: Array<bigint>;
  adminOnly?: boolean;
  acknowledge: Acknowledge;
  deleted?: boolean;
  passPlayer: PassPlayer;
  environmentOnly: EnvironmentOnly<PassPlayer>;
  ephemeral?: boolean;
  callback: CommandCallback<Acknowledge, PassPlayer>;
  onError: (e: unknown) => void;
}

export default class Command<
  Acknowledge extends boolean,
  PassPlayer extends boolean
> implements ICommand<Acknowledge, PassPlayer>
{
  data: SlashCommandBuilder = new SlashCommandBuilder();
  permissionsRequired?: Array<bigint> = [];
  adminOnly?: boolean = false;
  acknowledge: Acknowledge = true as Acknowledge;
  deleted?: boolean = false;
  passPlayer: PassPlayer = false as PassPlayer;
  environmentOnly: EnvironmentOnly<PassPlayer> = false;
  ephemeral?: boolean = true;
  callback: CommandCallback<Acknowledge, PassPlayer> = async () =>
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

  constructor(commandObject: ICommand<Acknowledge, PassPlayer>) {
    return hardMerge(this, commandObject, { data: SlashCommandBuilder });
  }
}
