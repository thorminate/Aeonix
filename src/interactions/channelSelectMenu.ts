import {
  CacheType,
  ChannelSelectMenuBuilder,
  ChannelSelectMenuInteraction,
} from "discord.js";
import Player from "../models/player/player.js";
import hardMerge from "../utils/hardMerge.js";
import log from "../utils/log.js";
import Environment from "../models/environment/environment.js";

export type ChannelSelectMenuContext = Omit<
  ChannelSelectMenuInteraction<CacheType>,
  "reply" | "deferReply" | "showModal" | "update" | "deferUpdate"
>;

export interface SeeChannelSelectMenuErrorPropertyForMoreDetails_1 {
  /**
   * ❌ ERROR: `passPlayer` must be `true` if `environmentOnly` is `true`.
   * Fix your arguments to the channel select menu constructor.
   */
  error: never;
}

export interface SeeChannelSelectMenuErrorPropertyForMoreDetails_2 {
  /**
   * ❌ ERROR: `passPlayer` must be `true` if `passEnvironment` is `true`.
   * Fix your arguments to the channel select menu constructor.
   */
  error: never;
}

export interface SeeChannelSelectMenuErrorPropertyForMoreDetails_3 {
  /**
   * ❌ ERROR: `passPlayer` must be `true` if `passEnvironment` is `true` or `environmentOnly` is `true`.
   * Fix your arguments to the channel select menu constructor.
   */
  error: never;
}

// im sorry for this abomination -- it does its job pretty well though
type ChannelSelectMenuCallback<
  Acknowledge extends boolean,
  PassPlayer extends boolean,
  PassEnvironment extends boolean,
  EnvironmentOnly extends boolean
> = Acknowledge extends true
  ? PassPlayer extends true
    ? PassEnvironment extends true
      ? (
          context: ChannelSelectMenuContext,
          player: Player,
          environment: Environment
        ) => Promise<void>
      : (context: ChannelSelectMenuContext, player: Player) => Promise<void>
    : PassEnvironment extends true
    ? EnvironmentOnly extends true
      ? (
          context: SeeChannelSelectMenuErrorPropertyForMoreDetails_3
        ) => Promise<void>
      : (
          context: SeeChannelSelectMenuErrorPropertyForMoreDetails_2
        ) => Promise<void>
    : EnvironmentOnly extends true
    ? (
        context: SeeChannelSelectMenuErrorPropertyForMoreDetails_1
      ) => Promise<void>
    : (context: ChannelSelectMenuContext) => Promise<void>
  : PassPlayer extends true
  ? PassEnvironment extends true
    ? (
        context: ChannelSelectMenuInteraction<CacheType>,
        player: Player,
        environment: Environment
      ) => Promise<void>
    : (
        context: ChannelSelectMenuInteraction<CacheType>,
        player: Player
      ) => Promise<void>
  : PassEnvironment extends true
  ? EnvironmentOnly extends true
    ? (
        context: SeeChannelSelectMenuErrorPropertyForMoreDetails_3
      ) => Promise<void>
    : (
        context: SeeChannelSelectMenuErrorPropertyForMoreDetails_2
      ) => Promise<void>
  : EnvironmentOnly extends true
  ? (
      context: SeeChannelSelectMenuErrorPropertyForMoreDetails_1
    ) => Promise<void>
  : (context: ChannelSelectMenuInteraction<CacheType>) => Promise<void>;

export interface IChannelSelectMenu<
  Acknowledge extends boolean,
  PassPlayer extends boolean,
  PassEnvironment extends boolean,
  EnvironmentOnly extends boolean
> {
  data: ChannelSelectMenuBuilder;
  customId: string;
  permissionsRequired?: Array<bigint>;
  adminOnly?: boolean;
  acknowledge: Acknowledge;
  ephemeral?: boolean;
  environmentOnly: EnvironmentOnly;
  passEnvironment: PassEnvironment;
  deleted?: boolean;
  passPlayer: PassPlayer;
  callback: ChannelSelectMenuCallback<
    Acknowledge,
    PassPlayer,
    PassEnvironment,
    EnvironmentOnly
  >;
  onError: (e: unknown) => void;
}

export default class ChannelSelectMenu<
  Acknowledge extends boolean,
  PassPlayer extends boolean,
  EnvironmentOnly extends boolean,
  PassEnvironment extends boolean
> implements
    IChannelSelectMenu<
      Acknowledge,
      PassPlayer,
      PassEnvironment,
      EnvironmentOnly
    >
{
  data: ChannelSelectMenuBuilder = new ChannelSelectMenuBuilder();
  customId: string = "";
  permissionsRequired?: Array<bigint> = [];
  adminOnly?: boolean = false;
  acknowledge: Acknowledge = true as Acknowledge;
  ephemeral?: boolean = true;
  environmentOnly: EnvironmentOnly = false as EnvironmentOnly;
  passEnvironment: PassEnvironment = false as PassEnvironment;
  deleted?: boolean = false;
  passPlayer: PassPlayer = false as PassPlayer;
  callback: ChannelSelectMenuCallback<
    Acknowledge,
    PassPlayer,
    PassEnvironment,
    EnvironmentOnly
  > = async () => {
    log({
      header: "Channel select menu callback not implemented",
      processName: "ChannelSelectMenuHandler",
      type: "Error",
    });
  };
  onError: (e: unknown) => void = (e) => {
    log({
      header: "Channel select menu Error (error handler not implemented!)",
      processName: "ChannelSelectMenuHandler",
      payload: e,
      type: "Error",
    });
  };

  constructor(
    channelSelectMenuObject: IChannelSelectMenu<
      Acknowledge,
      PassPlayer,
      PassEnvironment,
      EnvironmentOnly
    >
  ) {
    return hardMerge(this, channelSelectMenuObject);
  }
}
