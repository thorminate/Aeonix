import {
  ButtonBuilder,
  ButtonInteraction,
  CacheType,
  ChannelSelectMenuBuilder,
  ChannelSelectMenuInteraction,
  ChatInputCommandInteraction,
  MentionableSelectMenuBuilder,
  MentionableSelectMenuInteraction,
  ModalBuilder,
  ModalSubmitInteraction,
  RoleSelectMenuBuilder,
  RoleSelectMenuInteraction,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  UserSelectMenuBuilder,
  UserSelectMenuInteraction,
} from "discord.js";
import Player from "../models/player/player.js";
import hardMerge from "../utils/hardMerge.js";
import Environment from "../models/environment/environment.js";

export type ButtonContext = Omit<
  ButtonInteraction<CacheType>,
  "reply" | "deferReply" | "showModal" | "update" | "deferUpdate"
>;

export type ChannelSelectMenuContext = Omit<
  ChannelSelectMenuInteraction<CacheType>,
  "reply" | "deferReply" | "showModal" | "update" | "deferUpdate"
>;

export type CommandContext = Omit<
  ChatInputCommandInteraction<CacheType>,
  "reply" | "deferReply" | "showModal"
>;

export type MentionableSelectMenuContext = Omit<
  MentionableSelectMenuInteraction<CacheType>,
  "reply" | "deferReply" | "showModal" | "update" | "deferUpdate"
>;

export type ModalContext = Omit<
  ModalSubmitInteraction<CacheType>,
  "reply" | "deferReply" | "update" | "deferUpdate"
>;

export type RoleSelectMenuContext = Omit<
  RoleSelectMenuInteraction<CacheType>,
  "reply" | "deferReply" | "showModal" | "update" | "deferUpdate"
>;

export type StringSelectMenuContext = Omit<
  StringSelectMenuInteraction<CacheType>,
  "reply" | "deferReply" | "showModal" | "update" | "deferUpdate"
>;

export type UserSelectMenuContext = Omit<
  UserSelectMenuInteraction<CacheType>,
  "reply" | "deferReply" | "showModal" | "update" | "deferUpdate"
>;

export type InteractionTypes =
  | "button"
  | "channelSelectMenu"
  | "command"
  | "mentionableSelectMenu"
  | "modal"
  | "roleSelectMenu"
  | "stringSelectMenu"
  | "userSelectMenu";

type BuilderTypeFromInteractionType<T extends InteractionTypes> =
  T extends "button"
    ? ButtonBuilder
    : T extends "channelSelectMenu"
    ? ChannelSelectMenuBuilder
    : T extends "command"
    ? SlashCommandBuilder
    : T extends "mentionableSelectMenu"
    ? MentionableSelectMenuBuilder
    : T extends "modal"
    ? ModalBuilder
    : T extends "roleSelectMenu"
    ? RoleSelectMenuBuilder
    : T extends "stringSelectMenu"
    ? StringSelectMenuBuilder
    : T extends "userSelectMenu"
    ? UserSelectMenuBuilder
    : never;

type ContextTypeFromInteractionType<T extends InteractionTypes> =
  T extends "button"
    ? ButtonContext
    : T extends "channelSelectMenu"
    ? ChannelSelectMenuContext
    : T extends "command"
    ? CommandContext
    : T extends "mentionableSelectMenu"
    ? MentionableSelectMenuContext
    : T extends "modal"
    ? ModalContext
    : T extends "roleSelectMenu"
    ? RoleSelectMenuContext
    : T extends "stringSelectMenu"
    ? StringSelectMenuContext
    : T extends "userSelectMenu"
    ? UserSelectMenuContext
    : never;

type RawInteractionTypeFromInteractionType<T extends InteractionTypes> =
  T extends "button"
    ? ButtonInteraction<CacheType>
    : T extends "channelSelectMenu"
    ? ChannelSelectMenuInteraction<CacheType>
    : T extends "command"
    ? ChatInputCommandInteraction<CacheType>
    : T extends "mentionableSelectMenu"
    ? MentionableSelectMenuInteraction<CacheType>
    : T extends "modal"
    ? ModalSubmitInteraction<CacheType>
    : T extends "roleSelectMenu"
    ? RoleSelectMenuInteraction<CacheType>
    : T extends "stringSelectMenu"
    ? StringSelectMenuInteraction<CacheType>
    : T extends "userSelectMenu"
    ? UserSelectMenuInteraction<CacheType>
    : never;

export interface SeeInteractionErrorPropertyForMoreDetails_1 {
  /**
   * ❌ ERROR: `passPlayer` must be `true` if `environmentOnly` is `true`.
   * Fix your arguments to the interaction constructor.
   */
  error: never;
}

export interface SeeInteractionErrorPropertyForMoreDetails_2 {
  /**
   * ❌ ERROR: `passPlayer` must be `true` if `passEnvironment` is `true`.
   * Fix your arguments to the interaction constructor.
   */
  error: never;
}

export interface SeeInteractionErrorPropertyForMoreDetails_3 {
  /**
   * ❌ ERROR: `passPlayer` must be `true` if `passEnvironment` is `true` or `environmentOnly` is `true`.
   * Fix your arguments to the interaction constructor.
   */
  error: never;
}

// im sorry for this abomination -- it does its job pretty well though
type InteractionCallback<
  Acknowledge extends boolean | undefined,
  PassPlayer extends boolean | undefined,
  PassEnvironment extends boolean | undefined,
  EnvironmentOnly extends boolean | undefined,
  InteractionType extends InteractionTypes
> = Acknowledge extends true
  ? PassPlayer extends true
    ? PassEnvironment extends true
      ? (masterContext: {
          context: ContextTypeFromInteractionType<InteractionType>;
          player: Player;
          environment: Environment;
        }) => Promise<void>
      : (masterContext: {
          context: ContextTypeFromInteractionType<InteractionType>;
          player: Player;
        }) => Promise<void>
    : PassEnvironment extends true
    ? EnvironmentOnly extends true
      ? (masterContext: {
          error: SeeInteractionErrorPropertyForMoreDetails_3;
        }) => Promise<void>
      : (masterContext: {
          error: SeeInteractionErrorPropertyForMoreDetails_2;
        }) => Promise<void>
    : EnvironmentOnly extends true
    ? (masterContext: {
        error: SeeInteractionErrorPropertyForMoreDetails_1;
      }) => Promise<void>
    : (masterContext: {
        context: ContextTypeFromInteractionType<InteractionType>;
      }) => Promise<void>
  : PassPlayer extends true
  ? PassEnvironment extends true
    ? (masterContext: {
        context: RawInteractionTypeFromInteractionType<InteractionType>;
        player: Player;
        environment: Environment;
      }) => Promise<void>
    : (masterContext: {
        context: RawInteractionTypeFromInteractionType<InteractionType>;
        player: Player;
      }) => Promise<void>
  : PassEnvironment extends true
  ? EnvironmentOnly extends true
    ? (masterContext: {
        error: SeeInteractionErrorPropertyForMoreDetails_3;
      }) => Promise<void>
    : (masterContext: {
        error: SeeInteractionErrorPropertyForMoreDetails_2;
      }) => Promise<void>
  : EnvironmentOnly extends true
  ? (masterContext: {
      error: SeeInteractionErrorPropertyForMoreDetails_1;
    }) => Promise<void>
  : (masterContext: {
      context: RawInteractionTypeFromInteractionType<InteractionType>;
    }) => Promise<void>;

export default class Interaction<
  Acknowledge extends boolean,
  PassPlayer extends boolean,
  EnvironmentOnly extends boolean,
  PassEnvironment extends boolean,
  InteractionType extends InteractionTypes
> {
  interactionType!: InteractionType;
  data!: BuilderTypeFromInteractionType<InteractionType>;
  permissionsRequired?: Array<bigint>;
  adminOnly?: boolean;
  acknowledge?: Acknowledge;
  ephemeral?: boolean;
  deleted?: boolean;
  passPlayer?: PassPlayer;
  environmentOnly?: EnvironmentOnly;
  passEnvironment?: PassEnvironment;
  callback!: InteractionCallback<
    Acknowledge,
    PassPlayer,
    PassEnvironment,
    EnvironmentOnly,
    InteractionType
  >;
  onError!: (e: unknown) => void;

  constructor(
    o: Interaction<
      Acknowledge,
      PassPlayer,
      EnvironmentOnly,
      PassEnvironment,
      InteractionType
    >
  ) {
    const interactionTypeToBuilderMap = {
      button: ButtonBuilder,
      channelSelectMenu: ChannelSelectMenuBuilder,
      command: SlashCommandBuilder,
      mentionableSelectMenu: MentionableSelectMenuBuilder,
      modal: ModalBuilder,
      roleSelectMenu: RoleSelectMenuBuilder,
      stringSelectMenu: StringSelectMenuBuilder,
      userSelectMenu: UserSelectMenuBuilder,
    } as const;

    if (o.ephemeral === undefined) o.ephemeral = false;
    if (o.permissionsRequired === undefined) o.permissionsRequired = [];
    if (o.adminOnly === undefined) o.adminOnly = false;
    if (o.deleted === undefined) o.deleted = false;
    if (o.passPlayer === undefined) o.passPlayer = false as PassPlayer;
    if (o.environmentOnly === undefined)
      o.environmentOnly = false as EnvironmentOnly;
    if (o.passEnvironment === undefined)
      o.passEnvironment = false as PassEnvironment;
    if (o.acknowledge === undefined) o.acknowledge = true as Acknowledge;

    return hardMerge(this, o, {
      data: interactionTypeToBuilderMap[o.interactionType],
    });
  }
}
