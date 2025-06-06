import {
  CacheType,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from "discord.js";
import Player from "../models/player/player.js";
import hardMerge from "../utils/hardMerge.js";
import log from "../utils/log.js";
import Environment from "../models/environment/environment.js";

export type StringSelectMenuContext = Omit<
  StringSelectMenuInteraction<CacheType>,
  "reply" | "deferReply" | "showModal" | "update" | "deferUpdate"
>;

export interface SeeStringSelectMenuErrorPropertyForMoreDetails_1 {
  /**
   * ❌ ERROR: `passPlayer` must be `true` if `environmentOnly` is `true`.
   * Fix your arguments to the string select menu constructor.
   */
  error: never;
}

export interface SeeStringSelectMenuErrorPropertyForMoreDetails_2 {
  /**
   * ❌ ERROR: `passPlayer` must be `true` if `passEnvironment` is `true`.
   * Fix your arguments to the string select menu constructor.
   */
  error: never;
}

export interface SeeStringSelectMenuErrorPropertyForMoreDetails_3 {
  /**
   * ❌ ERROR: `passPlayer` must be `true` if `passEnvironment` is `true` or `environmentOnly` is `true`.
   * Fix your arguments to the string select menu constructor.
   */
  error: never;
}

// im sorry for this abomination -- it does its job pretty well though
type StringSelectMenuCallback<
  Acknowledge extends boolean,
  PassPlayer extends boolean,
  PassEnvironment extends boolean,
  EnvironmentOnly extends boolean
> = Acknowledge extends true
  ? PassPlayer extends true
    ? PassEnvironment extends true
      ? (
          context: StringSelectMenuContext,
          player: Player,
          environment: Environment
        ) => Promise<void>
      : (context: StringSelectMenuContext, player: Player) => Promise<void>
    : PassEnvironment extends true
    ? EnvironmentOnly extends true
      ? (
          context: SeeStringSelectMenuErrorPropertyForMoreDetails_3
        ) => Promise<void>
      : (
          context: SeeStringSelectMenuErrorPropertyForMoreDetails_2
        ) => Promise<void>
    : EnvironmentOnly extends true
    ? (
        context: SeeStringSelectMenuErrorPropertyForMoreDetails_1
      ) => Promise<void>
    : (context: StringSelectMenuContext) => Promise<void>
  : PassPlayer extends true
  ? PassEnvironment extends true
    ? (
        context: StringSelectMenuInteraction<CacheType>,
        player: Player,
        environment: Environment
      ) => Promise<void>
    : (
        context: StringSelectMenuInteraction<CacheType>,
        player: Player
      ) => Promise<void>
  : PassEnvironment extends true
  ? EnvironmentOnly extends true
    ? (
        context: SeeStringSelectMenuErrorPropertyForMoreDetails_3
      ) => Promise<void>
    : (
        context: SeeStringSelectMenuErrorPropertyForMoreDetails_2
      ) => Promise<void>
  : EnvironmentOnly extends true
  ? (context: SeeStringSelectMenuErrorPropertyForMoreDetails_1) => Promise<void>
  : (context: StringSelectMenuInteraction<CacheType>) => Promise<void>;

export interface IStringSelectMenu<
  Acknowledge extends boolean,
  PassPlayer extends boolean,
  PassEnvironment extends boolean,
  EnvironmentOnly extends boolean
> {
  data: StringSelectMenuBuilder;
  customId: string;
  permissionsRequired?: Array<bigint>;
  adminOnly?: boolean;
  acknowledge: Acknowledge;
  ephemeral?: boolean;
  environmentOnly: EnvironmentOnly;
  passEnvironment: PassEnvironment;
  deleted?: boolean;
  passPlayer: PassPlayer;
  callback: StringSelectMenuCallback<
    Acknowledge,
    PassPlayer,
    PassEnvironment,
    EnvironmentOnly
  >;
  onError: (e: unknown) => void;
}

export default class StringSelectMenu<
  Acknowledge extends boolean,
  PassPlayer extends boolean,
  PassEnvironment extends boolean,
  EnvironmentOnly extends boolean
> implements
    IStringSelectMenu<
      Acknowledge,
      PassPlayer,
      PassEnvironment,
      EnvironmentOnly
    >
{
  data: StringSelectMenuBuilder = new StringSelectMenuBuilder();
  customId: string = "";
  permissionsRequired?: Array<bigint> = [];
  adminOnly?: boolean = false;
  acknowledge: Acknowledge = true as Acknowledge;
  ephemeral?: boolean = true;
  environmentOnly: EnvironmentOnly = false as EnvironmentOnly;
  passEnvironment: PassEnvironment = false as PassEnvironment;
  deleted?: boolean = false;
  passPlayer: PassPlayer = false as PassPlayer;
  callback: StringSelectMenuCallback<
    Acknowledge,
    PassPlayer,
    PassEnvironment,
    EnvironmentOnly
  > = async () => {
    log({
      header: "String select menu callback not implemented",
      processName: "StringSelectMenuHandler",
      type: "Error",
    });
  };
  onError: (e: unknown) => void = (e) => {
    log({
      header: "String select menu Error (error handler not implemented!)",
      processName: "StringSelectMenuHandler",
      payload: e,
      type: "Error",
    });
  };

  constructor(
    stringSelectMenuObject: IStringSelectMenu<
      Acknowledge,
      PassPlayer,
      PassEnvironment,
      EnvironmentOnly
    >
  ) {
    return hardMerge(this, stringSelectMenuObject);
  }
}
