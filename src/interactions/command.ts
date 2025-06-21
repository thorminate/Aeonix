import {
  CacheType,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";
import Player from "../models/player/player.js";
import hardMerge from "../utils/hardMerge.js";
import log from "../utils/log.js";
import Environment from "../models/environment/environment.js";

export type CommandContext = Omit<
  ChatInputCommandInteraction<CacheType>,
  "reply" | "deferReply" | "showModal"
>;

export interface SeeCommandErrorPropertyForMoreDetails_1 {
  /**
   * ❌ ERROR: `passPlayer` must be `true` if `environmentOnly` is `true`.
   * Fix your arguments to the command constructor.
   */
  error: never;
}

export interface SeeCommandErrorPropertyForMoreDetails_2 {
  /**
   * ❌ ERROR: `passPlayer` must be `true` if `passEnvironment` is `true`.
   * Fix your arguments to the command constructor.
   */
  error: never;
}

export interface SeeCommandErrorPropertyForMoreDetails_3 {
  /**
   * ❌ ERROR: `passPlayer` must be `true` if `passEnvironment` is `true` or `environmentOnly` is `true`.
   * Fix your arguments to the command constructor.
   */
  error: never;
}

// im sorry for this abomination -- it does its job pretty well though
type CommandCallback<
  Acknowledge extends boolean,
  PassPlayer extends boolean,
  PassEnvironment extends boolean,
  EnvironmentOnly extends boolean
> = Acknowledge extends true
  ? PassPlayer extends true
    ? PassEnvironment extends true
      ? (
          context: CommandContext,
          player: Player,
          environment: Environment | undefined
        ) => Promise<void>
      : (context: CommandContext, player: Player) => Promise<void>
    : PassEnvironment extends true
    ? EnvironmentOnly extends true
      ? (context: SeeCommandErrorPropertyForMoreDetails_3) => Promise<void>
      : (context: SeeCommandErrorPropertyForMoreDetails_2) => Promise<void>
    : EnvironmentOnly extends true
    ? (context: SeeCommandErrorPropertyForMoreDetails_1) => Promise<void>
    : (context: CommandContext) => Promise<void>
  : PassPlayer extends true
  ? PassEnvironment extends true
    ? (
        context: ChatInputCommandInteraction<CacheType>,
        player: Player,
        environment: Environment | undefined
      ) => Promise<void>
    : (
        context: ChatInputCommandInteraction<CacheType>,
        player: Player
      ) => Promise<void>
  : PassEnvironment extends true
  ? EnvironmentOnly extends true
    ? (context: SeeCommandErrorPropertyForMoreDetails_3) => Promise<void>
    : (context: SeeCommandErrorPropertyForMoreDetails_2) => Promise<void>
  : EnvironmentOnly extends true
  ? (context: SeeCommandErrorPropertyForMoreDetails_1) => Promise<void>
  : (context: ChatInputCommandInteraction<CacheType>) => Promise<void>;

export interface ICommand<
  Acknowledge extends boolean,
  PassPlayer extends boolean,
  PassEnvironment extends boolean,
  EnvironmentOnly extends boolean
> {
  data:
    | SlashCommandBuilder
    | SlashCommandOptionsOnlyBuilder
    | SlashCommandSubcommandsOnlyBuilder;
  acknowledge: Acknowledge;
  passPlayer: PassPlayer;
  passEnvironment: PassEnvironment;
  environmentOnly: EnvironmentOnly;
  ephemeral?: boolean;
  adminOnly?: boolean;
  permissionsRequired?: Array<bigint>;
  deleted?: boolean;
  callback: CommandCallback<
    Acknowledge,
    PassPlayer,
    PassEnvironment,
    EnvironmentOnly
  >;
  onError: (e: unknown) => void;
}

export default class Command<
  Acknowledge extends boolean,
  PassPlayer extends boolean,
  PassEnvironment extends boolean,
  EnvironmentOnly extends boolean
> implements
    ICommand<Acknowledge, PassPlayer, PassEnvironment, EnvironmentOnly>
{
  data = new SlashCommandBuilder();
  acknowledge = true as Acknowledge;
  passPlayer = false as PassPlayer;
  passEnvironment = false as PassEnvironment;
  environmentOnly = false as EnvironmentOnly;
  ephemeral? = true;
  adminOnly? = false;
  permissionsRequired? = [];
  deleted? = false;
  callback: CommandCallback<
    Acknowledge,
    PassPlayer,
    PassEnvironment,
    EnvironmentOnly
  > = async () =>
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

  constructor(
    commandObject: ICommand<
      Acknowledge,
      PassPlayer,
      PassEnvironment,
      EnvironmentOnly
    >
  ) {
    return hardMerge(this, commandObject, { data: SlashCommandBuilder });
  }
}
