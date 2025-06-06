import {
  CacheType,
  MentionableSelectMenuBuilder,
  MentionableSelectMenuInteraction,
} from "discord.js";
import Player from "../models/player/player.js";
import hardMerge from "../utils/hardMerge.js";
import log from "../utils/log.js";

export type MentionableSelectMenuContext = Omit<
  MentionableSelectMenuInteraction<CacheType>,
  "reply" | "deferReply" | "showModal" | "update" | "deferUpdate"
>;

type MentionableSelectMenuCallback<
  Acknowledge extends boolean,
  PassPlayer extends boolean
> = Acknowledge extends true
  ? PassPlayer extends true
    ? (context: MentionableSelectMenuContext, player: Player) => Promise<void>
    : (context: MentionableSelectMenuContext) => Promise<void>
  : PassPlayer extends true
  ? (
      context: MentionableSelectMenuInteraction<CacheType>,
      player: Player
    ) => Promise<void>
  : (context: MentionableSelectMenuInteraction<CacheType>) => Promise<void>;

type EnvironmentOnly<PassPlayer extends boolean> = PassPlayer extends true
  ? boolean
  : false;

export interface IMentionableSelectMenu<
  Acknowledge extends boolean,
  PassPlayer extends boolean
> {
  data: MentionableSelectMenuBuilder;
  customId: string;
  permissionsRequired?: Array<bigint>;
  adminOnly?: boolean;
  acknowledge: Acknowledge;
  ephemeral?: boolean;
  environmentOnly: EnvironmentOnly<PassPlayer>;
  deleted?: boolean;
  passPlayer: PassPlayer;
  callback: MentionableSelectMenuCallback<Acknowledge, PassPlayer>;
  onError: (e: unknown) => void;
}

export default class MentionableSelectMenu<
  Acknowledge extends boolean,
  PassPlayer extends boolean
> implements IMentionableSelectMenu<Acknowledge, PassPlayer>
{
  data: MentionableSelectMenuBuilder = new MentionableSelectMenuBuilder();
  customId: string = "";
  permissionsRequired?: Array<bigint> = [];
  adminOnly?: boolean = false;
  acknowledge: Acknowledge = true as Acknowledge;
  ephemeral?: boolean = true;
  environmentOnly: EnvironmentOnly<PassPlayer> = false;
  deleted?: boolean = false;
  passPlayer: PassPlayer = false as PassPlayer;
  callback: MentionableSelectMenuCallback<Acknowledge, PassPlayer> =
    async () => {
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
    mentionableSelectMenuObject: IMentionableSelectMenu<Acknowledge, PassPlayer>
  ) {
    return hardMerge(this, mentionableSelectMenuObject);
  }
}
