import {
  CacheType,
  UserSelectMenuBuilder,
  UserSelectMenuInteraction,
} from "discord.js";
import Player from "../models/player/player.js";
import hardMerge from "../utils/hardMerge.js";
import log from "../utils/log.js";
import Environment from "../models/environment/environment.js";

export type UserSelectMenuContext = Omit<
  UserSelectMenuInteraction<CacheType>,
  "reply" | "deferReply" | "showModal" | "update" | "deferUpdate"
>;

export interface SeeUserSelectMenuErrorPropertyForMoreDetails_1 {
  /**
   * ❌ ERROR: `passPlayer` must be `true` if `environmentOnly` is `true`.
   * Fix your arguments to the user select menu constructor.
   */
  error: never;
}

export interface SeeUserSelectMenuErrorPropertyForMoreDetails_2 {
  /**
   * ❌ ERROR: `passPlayer` must be `true` if `passEnvironment` is `true`.
   * Fix your arguments to the user select menu constructor.
   */
  error: never;
}

export interface SeeUserSelectMenuErrorPropertyForMoreDetails_3 {
  /**
   * ❌ ERROR: `passPlayer` must be `true` if `passEnvironment` is `true` or `environmentOnly` is `true`.
   * Fix your arguments to the user select menu constructor.
   */
  error: never;
}

// im sorry for this abomination -- it does its job pretty well though
type UserSelectMenuCallback<
  Acknowledge extends boolean,
  PassPlayer extends boolean,
  PassEnvironment extends boolean,
  EnvironmentOnly extends boolean
> = Acknowledge extends true
  ? PassPlayer extends true
    ? PassEnvironment extends true
      ? (
          context: UserSelectMenuContext,
          player: Player,
          environment: Environment
        ) => Promise<void>
      : (context: UserSelectMenuContext, player: Player) => Promise<void>
    : PassEnvironment extends true
    ? EnvironmentOnly extends true
      ? (
          context: SeeUserSelectMenuErrorPropertyForMoreDetails_3
        ) => Promise<void>
      : (
          context: SeeUserSelectMenuErrorPropertyForMoreDetails_2
        ) => Promise<void>
    : EnvironmentOnly extends true
    ? (context: SeeUserSelectMenuErrorPropertyForMoreDetails_1) => Promise<void>
    : (context: UserSelectMenuContext) => Promise<void>
  : PassPlayer extends true
  ? PassEnvironment extends true
    ? (
        context: UserSelectMenuInteraction<CacheType>,
        player: Player,
        environment: Environment
      ) => Promise<void>
    : (
        context: UserSelectMenuInteraction<CacheType>,
        player: Player
      ) => Promise<void>
  : PassEnvironment extends true
  ? EnvironmentOnly extends true
    ? (context: SeeUserSelectMenuErrorPropertyForMoreDetails_3) => Promise<void>
    : (context: SeeUserSelectMenuErrorPropertyForMoreDetails_2) => Promise<void>
  : EnvironmentOnly extends true
  ? (context: SeeUserSelectMenuErrorPropertyForMoreDetails_1) => Promise<void>
  : (context: UserSelectMenuInteraction<CacheType>) => Promise<void>;

export interface IUserSelectMenu<
  Acknowledge extends boolean,
  PassPlayer extends boolean,
  PassEnvironment extends boolean,
  EnvironmentOnly extends boolean
> {
  data: UserSelectMenuBuilder;
  customId: string;
  permissionsRequired?: Array<bigint>;
  adminOnly?: boolean;
  acknowledge: Acknowledge;
  ephemeral?: boolean;
  environmentOnly: EnvironmentOnly;
  passEnvironment: PassEnvironment;
  deleted?: boolean;
  passPlayer: PassPlayer;
  callback: UserSelectMenuCallback<
    Acknowledge,
    PassPlayer,
    PassEnvironment,
    EnvironmentOnly
  >;
  onError: (e: unknown) => void;
}

export default class UserSelectMenu<
  Acknowledge extends boolean,
  PassPlayer extends boolean,
  PassEnvironment extends boolean,
  EnvironmentOnly extends boolean
> implements
    IUserSelectMenu<Acknowledge, PassPlayer, PassEnvironment, EnvironmentOnly>
{
  data: UserSelectMenuBuilder = new UserSelectMenuBuilder();
  customId: string = "";
  permissionsRequired?: Array<bigint> = [];
  adminOnly?: boolean = false;
  acknowledge: Acknowledge = true as Acknowledge;
  ephemeral?: boolean = true;
  environmentOnly: EnvironmentOnly = false as EnvironmentOnly;
  passEnvironment: PassEnvironment = false as PassEnvironment;
  deleted?: boolean = false;
  passPlayer: PassPlayer = false as PassPlayer;
  callback: UserSelectMenuCallback<
    Acknowledge,
    PassPlayer,
    PassEnvironment,
    EnvironmentOnly
  > = async () => {
    log({
      header: "User select menu callback not implemented",
      processName: "UserSelectMenuHandler",
      type: "Error",
    });
  };
  onError: (e: unknown) => void = (e) => {
    log({
      header: "User select menu Error (error handler not implemented!)",
      processName: "UserSelectMenuHandler",
      payload: e,
      type: "Error",
    });
  };

  constructor(
    userSelectMenuObject: IUserSelectMenu<
      Acknowledge,
      PassPlayer,
      PassEnvironment,
      EnvironmentOnly
    >
  ) {
    return hardMerge(this, userSelectMenuObject);
  }
}
