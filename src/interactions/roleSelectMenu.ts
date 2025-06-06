import {
  CacheType,
  RoleSelectMenuBuilder,
  RoleSelectMenuInteraction,
} from "discord.js";
import Player from "../models/player/player.js";
import hardMerge from "../utils/hardMerge.js";
import log from "../utils/log.js";
import Environment from "../models/environment/environment.js";

export type RoleSelectMenuContext = Omit<
  RoleSelectMenuInteraction<CacheType>,
  "reply" | "deferReply" | "showModal" | "update" | "deferUpdate"
>;

export interface SeeRoleSelectMenuErrorPropertyForMoreDetails_1 {
  /**
   * ❌ ERROR: `passPlayer` must be `true` if `environmentOnly` is `true`.
   * Fix your arguments to the role select menu constructor.
   */
  error: never;
}

export interface SeeRoleSelectMenuErrorPropertyForMoreDetails_2 {
  /**
   * ❌ ERROR: `passPlayer` must be `true` if `passEnvironment` is `true`.
   * Fix your arguments to the role select menu constructor.
   */
  error: never;
}

export interface SeeRoleSelectMenuErrorPropertyForMoreDetails_3 {
  /**
   * ❌ ERROR: `passPlayer` must be `true` if `passEnvironment` is `true` or `environmentOnly` is `true`.
   * Fix your arguments to the role select menu constructor.
   */
  error: never;
}

// im sorry for this abomination -- it does its job pretty well though
type RoleSelectMenuCallback<
  Acknowledge extends boolean,
  PassPlayer extends boolean,
  PassEnvironment extends boolean,
  EnvironmentOnly extends boolean
> = Acknowledge extends true
  ? PassPlayer extends true
    ? PassEnvironment extends true
      ? (
          context: RoleSelectMenuContext,
          player: Player,
          environment: Environment
        ) => Promise<void>
      : (context: RoleSelectMenuContext, player: Player) => Promise<void>
    : PassEnvironment extends true
    ? EnvironmentOnly extends true
      ? (
          context: SeeRoleSelectMenuErrorPropertyForMoreDetails_3
        ) => Promise<void>
      : (
          context: SeeRoleSelectMenuErrorPropertyForMoreDetails_2
        ) => Promise<void>
    : EnvironmentOnly extends true
    ? (context: SeeRoleSelectMenuErrorPropertyForMoreDetails_1) => Promise<void>
    : (context: RoleSelectMenuContext) => Promise<void>
  : PassPlayer extends true
  ? PassEnvironment extends true
    ? (
        context: RoleSelectMenuInteraction<CacheType>,
        player: Player,
        environment: Environment
      ) => Promise<void>
    : (
        context: RoleSelectMenuInteraction<CacheType>,
        player: Player
      ) => Promise<void>
  : PassEnvironment extends true
  ? EnvironmentOnly extends true
    ? (context: SeeRoleSelectMenuErrorPropertyForMoreDetails_3) => Promise<void>
    : (context: SeeRoleSelectMenuErrorPropertyForMoreDetails_2) => Promise<void>
  : EnvironmentOnly extends true
  ? (context: SeeRoleSelectMenuErrorPropertyForMoreDetails_1) => Promise<void>
  : (context: RoleSelectMenuInteraction<CacheType>) => Promise<void>;

export interface IRoleSelectMenu<
  Acknowledge extends boolean,
  PassPlayer extends boolean,
  PassEnvironment extends boolean,
  EnvironmentOnly extends boolean
> {
  data: RoleSelectMenuBuilder;
  customId: string;
  permissionsRequired?: Array<bigint>;
  adminOnly?: boolean;
  acknowledge: Acknowledge;
  ephemeral?: boolean;
  environmentOnly: EnvironmentOnly;
  passEnvironment: PassEnvironment;
  deleted?: boolean;
  passPlayer: PassPlayer;
  callback: RoleSelectMenuCallback<
    Acknowledge,
    PassPlayer,
    PassEnvironment,
    EnvironmentOnly
  >;
  onError: (e: unknown) => void;
}

export default class RoleSelectMenu<
  Acknowledge extends boolean,
  PassPlayer extends boolean,
  PassEnvironment extends boolean,
  EnvironmentOnly extends boolean
> implements
    IRoleSelectMenu<Acknowledge, PassPlayer, PassEnvironment, EnvironmentOnly>
{
  data: RoleSelectMenuBuilder = new RoleSelectMenuBuilder();
  customId: string = "";
  permissionsRequired?: Array<bigint> = [];
  adminOnly?: boolean = false;
  acknowledge: Acknowledge = true as Acknowledge;
  ephemeral?: boolean = true;
  environmentOnly: EnvironmentOnly = false as EnvironmentOnly;
  passEnvironment: PassEnvironment = false as PassEnvironment;
  deleted?: boolean = false;
  passPlayer: PassPlayer = false as PassPlayer;
  callback: RoleSelectMenuCallback<
    Acknowledge,
    PassPlayer,
    PassEnvironment,
    EnvironmentOnly
  > = async () => {
    log({
      header: "Role select menu callback not implemented",
      processName: "RoleSelectMenuHandler",
      type: "Error",
    });
  };
  onError: (e: unknown) => void = (e) => {
    log({
      header: "Role select menu Error (error handler not implemented!)",
      processName: "RoleSelectMenuHandler",
      payload: e,
      type: "Error",
    });
  };

  constructor(
    roleSelectMenuObject: IRoleSelectMenu<
      Acknowledge,
      PassPlayer,
      PassEnvironment,
      EnvironmentOnly
    >
  ) {
    return hardMerge(this, roleSelectMenuObject);
  }
}
