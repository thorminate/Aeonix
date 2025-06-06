import {
  CacheType,
  MentionableSelectMenuBuilder,
  MentionableSelectMenuInteraction,
} from "discord.js";
import Player from "../models/player/player.js";
import hardMerge from "../utils/hardMerge.js";
import log from "../utils/log.js";
import Environment from "../models/environment/environment.js";

export type MentionableSelectMenuContext = Omit<
  MentionableSelectMenuInteraction<CacheType>,
  "reply" | "deferReply" | "showModal" | "update" | "deferUpdate"
>;

export interface SeeMentionableSelectMenuErrorPropertyForMoreDetails_1 {
  /**
   * ❌ ERROR: `passPlayer` must be `true` if `environmentOnly` is `true`.
   * Fix your arguments to the mentionable select menu constructor.
   */
  error: never;
}

export interface SeeMentionableSelectMenuErrorPropertyForMoreDetails_2 {
  /**
   * ❌ ERROR: `passPlayer` must be `true` if `passEnvironment` is `true`.
   * Fix your arguments to the mentionable select menu constructor.
   */
  error: never;
}

export interface SeeMentionableSelectMenuErrorPropertyForMoreDetails_3 {
  /**
   * ❌ ERROR: `passPlayer` must be `true` if `passEnvironment` is `true` or `environmentOnly` is `true`.
   * Fix your arguments to the mentionable select menu constructor.
   */
  error: never;
}

// im sorry for this abomination -- it does its job pretty well though
type MentionableSelectMenuCallback<
  Acknowledge extends boolean,
  PassPlayer extends boolean,
  PassEnvironment extends boolean,
  EnvironmentOnly extends boolean
> = Acknowledge extends true
  ? PassPlayer extends true
    ? PassEnvironment extends true
      ? (
          context: MentionableSelectMenuContext,
          player: Player,
          environment: Environment | undefined
        ) => Promise<void>
      : (context: MentionableSelectMenuContext, player: Player) => Promise<void>
    : PassEnvironment extends true
    ? EnvironmentOnly extends true
      ? (
          context: SeeMentionableSelectMenuErrorPropertyForMoreDetails_3
        ) => Promise<void>
      : (
          context: SeeMentionableSelectMenuErrorPropertyForMoreDetails_2
        ) => Promise<void>
    : EnvironmentOnly extends true
    ? (
        context: SeeMentionableSelectMenuErrorPropertyForMoreDetails_1
      ) => Promise<void>
    : (context: MentionableSelectMenuContext) => Promise<void>
  : PassPlayer extends true
  ? PassEnvironment extends true
    ? (
        context: MentionableSelectMenuInteraction<CacheType>,
        player: Player,
        environment: Environment | undefined
      ) => Promise<void>
    : (
        context: MentionableSelectMenuInteraction<CacheType>,
        player: Player
      ) => Promise<void>
  : PassEnvironment extends true
  ? EnvironmentOnly extends true
    ? (
        context: SeeMentionableSelectMenuErrorPropertyForMoreDetails_3
      ) => Promise<void>
    : (
        context: SeeMentionableSelectMenuErrorPropertyForMoreDetails_2
      ) => Promise<void>
  : EnvironmentOnly extends true
  ? (
      context: SeeMentionableSelectMenuErrorPropertyForMoreDetails_1
    ) => Promise<void>
  : (context: MentionableSelectMenuInteraction<CacheType>) => Promise<void>;

export interface IMentionableSelectMenu<
  Acknowledge extends boolean,
  PassPlayer extends boolean,
  PassEnvironment extends boolean,
  EnvironmentOnly extends boolean
> {
  data: MentionableSelectMenuBuilder;
  customId: string;
  permissionsRequired?: Array<bigint>;
  adminOnly?: boolean;
  acknowledge: Acknowledge;
  ephemeral?: boolean;
  environmentOnly: EnvironmentOnly;
  passEnvironment: PassEnvironment;
  deleted?: boolean;
  passPlayer: PassPlayer;
  callback: MentionableSelectMenuCallback<
    Acknowledge,
    PassPlayer,
    PassEnvironment,
    EnvironmentOnly
  >;
  onError: (e: unknown) => void;
}

export default class MentionableSelectMenu<
  Acknowledge extends boolean,
  PassPlayer extends boolean,
  PassEnvironment extends boolean,
  EnvironmentOnly extends boolean
> implements
    IMentionableSelectMenu<
      Acknowledge,
      PassPlayer,
      PassEnvironment,
      EnvironmentOnly
    >
{
  data: MentionableSelectMenuBuilder = new MentionableSelectMenuBuilder();
  customId: string = "";
  permissionsRequired?: Array<bigint> = [];
  adminOnly?: boolean = false;
  acknowledge: Acknowledge = true as Acknowledge;
  ephemeral?: boolean = true;
  environmentOnly: EnvironmentOnly = false as EnvironmentOnly;
  passEnvironment: PassEnvironment = false as PassEnvironment;
  deleted?: boolean = false;
  passPlayer: PassPlayer = false as PassPlayer;
  callback: MentionableSelectMenuCallback<
    Acknowledge,
    PassPlayer,
    PassEnvironment,
    EnvironmentOnly
  > = async () => {
    log({
      header: "Select menu callback not implemented",
      processName: "MentionableSelectMenu",
      type: "Error",
    });
  };
  onError: (e: unknown) => void = (e) => {
    log({
      header: "Select menu Error (error handler not implemented!)",
      processName: "MentionableSelectMenu",
      payload: e,
      type: "Error",
    });
  };

  constructor(
    mentionableSelectMenuObject: IMentionableSelectMenu<
      Acknowledge,
      PassPlayer,
      PassEnvironment,
      EnvironmentOnly
    >
  ) {
    return hardMerge(this, mentionableSelectMenuObject);
  }
}
