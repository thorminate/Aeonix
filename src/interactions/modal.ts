import { CacheType, ModalBuilder, ModalSubmitInteraction } from "discord.js";
import Player from "../models/player/player.js";
import hardMerge from "../utils/hardMerge.js";
import log from "../utils/log.js";
import Environment from "../models/environment/environment.js";

export type ModalContext = Omit<
  ModalSubmitInteraction<CacheType>,
  "reply" | "deferReply" | "update" | "deferUpdate"
>;

export interface SeeModalErrorPropertyForMoreDetails_1 {
  /**
   * ❌ ERROR: `passPlayer` must be `true` if `environmentOnly` is `true`.
   * Fix your arguments to the button constructor.
   */
  error: never;
}

export interface SeeModalErrorPropertyForMoreDetails_2 {
  /**
   * ❌ ERROR: `passPlayer` must be `true` if `passEnvironment` is `true`.
   * Fix your arguments to the button constructor.
   */
  error: never;
}

export interface SeeModalErrorPropertyForMoreDetails_3 {
  /**
   * ❌ ERROR: `passPlayer` must be `true` if `passEnvironment` is `true` or `environmentOnly` is `true`.
   * Fix your arguments to the button constructor.
   */
  error: never;
}

// im sorry for this abomination -- it does its job pretty well though
type ModalCallback<
  Acknowledge extends boolean,
  PassPlayer extends boolean,
  PassEnvironment extends boolean,
  EnvironmentOnly extends boolean
> = Acknowledge extends true
  ? PassPlayer extends true
    ? PassEnvironment extends true
      ? (
          context: ModalContext,
          player: Player,
          environment: Environment
        ) => Promise<void>
      : (context: ModalContext, player: Player) => Promise<void>
    : PassEnvironment extends true
    ? EnvironmentOnly extends true
      ? (context: SeeModalErrorPropertyForMoreDetails_3) => Promise<void>
      : (context: SeeModalErrorPropertyForMoreDetails_2) => Promise<void>
    : EnvironmentOnly extends true
    ? (context: SeeModalErrorPropertyForMoreDetails_1) => Promise<void>
    : (context: ModalContext) => Promise<void>
  : PassPlayer extends true
  ? PassEnvironment extends true
    ? (
        context: ModalSubmitInteraction<CacheType>,
        player: Player,
        environment: Environment
      ) => Promise<void>
    : (
        context: ModalSubmitInteraction<CacheType>,
        player: Player
      ) => Promise<void>
  : PassEnvironment extends true
  ? EnvironmentOnly extends true
    ? (context: SeeModalErrorPropertyForMoreDetails_3) => Promise<void>
    : (context: SeeModalErrorPropertyForMoreDetails_2) => Promise<void>
  : EnvironmentOnly extends true
  ? (context: SeeModalErrorPropertyForMoreDetails_1) => Promise<void>
  : (context: ModalSubmitInteraction<CacheType>) => Promise<void>;

export interface IModal<
  Acknowledge extends boolean,
  PassPlayer extends boolean,
  PassEnvironment extends boolean,
  EnvironmentOnly extends boolean
> {
  data: ModalBuilder;
  customId: string;
  permissionsRequired?: Array<bigint>;
  adminOnly?: boolean;
  acknowledge: Acknowledge;
  ephemeral?: boolean;
  environmentOnly: EnvironmentOnly;
  passEnvironment: PassEnvironment;
  deleted?: boolean;
  passPlayer: PassPlayer;
  callback: ModalCallback<
    Acknowledge,
    PassPlayer,
    PassEnvironment,
    EnvironmentOnly
  >;
  onError: (e: unknown) => void;
}

export default class Modal<
  Acknowledge extends boolean,
  PassPlayer extends boolean,
  PassEnvironment extends boolean,
  EnvironmentOnly extends boolean
> implements IModal<Acknowledge, PassPlayer, PassEnvironment, EnvironmentOnly>
{
  data: ModalBuilder = new ModalBuilder();
  customId: string = "";
  permissionsRequired?: Array<bigint> = [];
  adminOnly?: boolean = false;
  acknowledge: Acknowledge = true as Acknowledge;
  ephemeral?: boolean = true;
  environmentOnly: EnvironmentOnly = false as EnvironmentOnly;
  passEnvironment: PassEnvironment = false as PassEnvironment;
  deleted?: boolean = false;
  passPlayer: PassPlayer = false as PassPlayer;
  callback: ModalCallback<
    Acknowledge,
    PassPlayer,
    PassEnvironment,
    EnvironmentOnly
  > = async () => {
    log({
      header: "Modal callback not implemented",
      processName: "ModalHandler",
      type: "Error",
    });
  };
  onError: (e: unknown) => void = (e) => {
    log({
      header: "Modal Error (error handler not implemented!)",
      processName: "ModalHandler",
      payload: e,
      type: "Error",
    });
  };

  constructor(
    modalObject: IModal<
      Acknowledge,
      PassPlayer,
      PassEnvironment,
      EnvironmentOnly
    >
  ) {
    return hardMerge(this, modalObject);
  }
}
