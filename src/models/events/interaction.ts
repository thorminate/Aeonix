import {
  APIButtonComponentWithCustomId,
  AutocompleteInteraction,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
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
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
  UserSelectMenuBuilder,
  UserSelectMenuInteraction,
} from "discord.js";
import merge from "../../utils/merge.js";
import Environment from "../environment/environment.js";
import Aeonix from "../../aeonix.js";
import PlayerRef from "../player/utils/playerRef.js";

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

export enum InteractionTypes {
  Button = "button",
  ChannelSelectMenu = "channelSelectMenu",
  Command = "command",
  MentionableSelectMenu = "mentionableSelectMenu",
  Modal = "modal",
  RoleSelectMenu = "roleSelectMenu",
  StringSelectMenu = "stringSelectMenu",
  UserSelectMenu = "userSelectMenu",
}

export type ButtonStyleV2 =
  | ButtonStyle.Primary
  | ButtonStyle.Secondary
  | ButtonStyle.Danger
  | ButtonStyle.Success;

export class ButtonBuilderV2 extends ButtonBuilder {
  override data: Partial<APIButtonComponentWithCustomId> = {};
  override setStyle(style: ButtonStyleV2): this {
    return super.setStyle(style);
  }
}

type BuilderTypeFromInteractionType<T extends InteractionTypes> =
  T extends "button"
    ? ButtonBuilderV2
    : T extends "channelSelectMenu"
    ? ChannelSelectMenuBuilder
    : T extends "command"
    ?
        | SlashCommandBuilder
        | SlashCommandSubcommandsOnlyBuilder
        | SlashCommandOptionsOnlyBuilder
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

type AutocompleteCallback<PassPlayer extends boolean> = PassPlayer extends true
  ? (masterContext: {
      context: AutocompleteInteraction<CacheType>;
      player: PlayerRef;
    }) => Promise<{ name: string; value: string }[]>
  : (masterContext: {
      context: AutocompleteInteraction<CacheType>;
    }) => Promise<{ name: string; value: string }[]>;

class AutocompleteHandler<PassPlayer extends boolean> {
  passPlayer!: PassPlayer;
  callback!: AutocompleteCallback<PassPlayer>;

  constructor(o: AutocompleteHandler<PassPlayer>) {
    return merge(this, o);
  }
}

type TAutocompleteHandler<
  InteractionType extends InteractionTypes,
  PassPlayer extends boolean
> = InteractionType extends "command" ? AutocompleteHandler<PassPlayer> : never;

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
          player: PlayerRef;
          environment: Environment;
          aeonix: Aeonix;
        }) => Promise<void>
      : (masterContext: {
          context: ContextTypeFromInteractionType<InteractionType>;
          player: PlayerRef;
          aeonix: Aeonix;
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
        aeonix: Aeonix;
      }) => Promise<void>
  : PassPlayer extends true
  ? PassEnvironment extends true
    ? (masterContext: {
        context: RawInteractionTypeFromInteractionType<InteractionType>;
        player: PlayerRef;
        environment: Environment;
        aeonix: Aeonix;
      }) => Promise<void>
    : (masterContext: {
        context: RawInteractionTypeFromInteractionType<InteractionType>;
        player: PlayerRef;
        aeonix: Aeonix;
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
      aeonix: Aeonix;
    }) => Promise<void>;

export default class Interaction<
  InteractionType extends InteractionTypes,
  Acknowledge extends boolean = true,
  PassPlayer extends boolean = false,
  EnvironmentOnly extends boolean = false,
  PassEnvironment extends boolean = false,
  AutocompletePassPlayer extends boolean = false
> {
  id?: string;
  data!: BuilderTypeFromInteractionType<InteractionType>;
  interactionType!: InteractionType;
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
  autocomplete?: TAutocompleteHandler<InteractionType, AutocompletePassPlayer>;
  onError!: (e: unknown, aeonix: Aeonix) => void;

  constructor(
    o: Interaction<
      InteractionType,
      Acknowledge,
      PassPlayer,
      EnvironmentOnly,
      PassEnvironment,
      AutocompletePassPlayer
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

    return merge(this, o, {
      data: interactionTypeToBuilderMap[o.interactionType],
    });
  }
}
