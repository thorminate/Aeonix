import { ButtonBuilder, ButtonInteraction, CacheType } from "discord.js";
import Player from "../models/player/player.js";
import hardMerge from "../utils/hardMerge.js";
import log from "../utils/log.js";
import Environment from "../models/environment/environment.js";

export type ButtonContext = Omit<
  ButtonInteraction<CacheType>,
  "reply" | "deferReply" | "showModal" | "update" | "deferUpdate"
>;

export interface SeeButtonErrorPropertyForMoreDetails_1 {
  /**
   * ❌ ERROR: `passPlayer` must be `true` if `environmentOnly` is `true`.
   * Fix your arguments to the button constructor.
   */
  error: never;
}

export interface SeeButtonErrorPropertyForMoreDetails_2 {
  /**
   * ❌ ERROR: `passPlayer` must be `true` if `passEnvironment` is `true`.
   * Fix your arguments to the button constructor.
   */
  error: never;
}

export interface SeeButtonErrorPropertyForMoreDetails_3 {
  /**
   * ❌ ERROR: `passPlayer` must be `true` if `passEnvironment` is `true` or `environmentOnly` is `true`.
   * Fix your arguments to the button constructor.
   */
  error: never;
}

// im sorry for this abomination -- it does its job pretty well though
type ButtonCallback<
  Acknowledge extends boolean,
  PassPlayer extends boolean,
  PassEnvironment extends boolean,
  EnvironmentOnly extends boolean
> = Acknowledge extends true
  ? PassPlayer extends true
    ? PassEnvironment extends true
      ? (
          context: ButtonContext,
          player: Player,
          environment: Environment
        ) => Promise<void>
      : (context: ButtonContext, player: Player) => Promise<void>
    : PassEnvironment extends true
    ? EnvironmentOnly extends true
      ? (context: SeeButtonErrorPropertyForMoreDetails_3) => Promise<void>
      : (context: SeeButtonErrorPropertyForMoreDetails_2) => Promise<void>
    : EnvironmentOnly extends true
    ? (context: SeeButtonErrorPropertyForMoreDetails_1) => Promise<void>
    : (context: ButtonContext) => Promise<void>
  : PassPlayer extends true
  ? PassEnvironment extends true
    ? (
        context: ButtonInteraction<CacheType>,
        player: Player,
        environment: Environment
      ) => Promise<void>
    : (context: ButtonInteraction<CacheType>, player: Player) => Promise<void>
  : PassEnvironment extends true
  ? EnvironmentOnly extends true
    ? (context: SeeButtonErrorPropertyForMoreDetails_3) => Promise<void>
    : (context: SeeButtonErrorPropertyForMoreDetails_2) => Promise<void>
  : EnvironmentOnly extends true
  ? (context: SeeButtonErrorPropertyForMoreDetails_1) => Promise<void>
  : (context: ButtonInteraction<CacheType>) => Promise<void>;

export interface IButton<
  Acknowledge extends boolean,
  PassPlayer extends boolean,
  EnvironmentOnly extends boolean,
  PassEnvironment extends boolean
> {
  data: ButtonBuilder;
  customId: string;
  permissionsRequired?: Array<bigint>;
  adminOnly?: boolean;
  acknowledge: Acknowledge;
  ephemeral?: boolean;
  deleted?: boolean;
  passPlayer: PassPlayer;
  environmentOnly: EnvironmentOnly;
  passEnvironment: PassEnvironment;
  callback: ButtonCallback<
    Acknowledge,
    PassPlayer,
    PassEnvironment,
    EnvironmentOnly
  >;
  onError: (e: unknown) => void;
}

export default class Button<
  Acknowledge extends boolean,
  PassPlayer extends boolean,
  EnvironmentOnly extends boolean,
  PassEnvironment extends boolean
> implements IButton<Acknowledge, PassPlayer, EnvironmentOnly, PassEnvironment>
{
  data: ButtonBuilder = new ButtonBuilder();
  customId: string = "";
  permissionsRequired?: Array<bigint> = [];
  adminOnly?: boolean = false;
  acknowledge: Acknowledge = true as Acknowledge;
  ephemeral?: boolean = true;
  deleted?: boolean = false;
  passPlayer: PassPlayer = false as PassPlayer;
  environmentOnly: EnvironmentOnly = false as EnvironmentOnly;
  passEnvironment: PassEnvironment = false as PassEnvironment;
  callback: ButtonCallback<
    Acknowledge,
    PassPlayer,
    PassEnvironment,
    EnvironmentOnly
  > = async () => {
    log({
      header: "Button callback not implemented",
      processName: "ButtonHandler",
      type: "Error",
    });
  };
  onError: (e: unknown) => void = (e) => {
    log({
      header: "Button Error (error handler not implemented!)",
      processName: "ButtonHandler",
      payload: e,
      type: "Error",
    });
  };

  constructor(
    buttonObject: IButton<
      Acknowledge,
      PassPlayer,
      EnvironmentOnly,
      PassEnvironment
    >
  ) {
    return hardMerge(this, buttonObject);
  }
}
