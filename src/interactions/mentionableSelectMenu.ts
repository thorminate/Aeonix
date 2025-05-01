import {
  CacheType,
  MentionableSelectMenuBuilder,
  MentionableSelectMenuInteraction,
} from "discord.js";
import Player from "../models/player/player.js";
import deepInstantiate from "../utils/deepInstantiate.js";
import log from "../utils/log.js";

export type MentionableSelectMenuContext = Omit<
  MentionableSelectMenuInteraction<CacheType>,
  "reply" | "deferReply" | "showModal" | "update" | "deferUpdate"
>;

type MentionableSelectMenuCallback<
  A extends boolean,
  P extends boolean
> = A extends true
  ? P extends true
    ? (context: MentionableSelectMenuContext, player: Player) => Promise<void>
    : (context: MentionableSelectMenuContext) => Promise<void>
  : P extends true
  ? (
      context: MentionableSelectMenuInteraction<CacheType>,
      player: Player
    ) => Promise<void>
  : (context: MentionableSelectMenuInteraction<CacheType>) => Promise<void>;

export interface IMentionableSelectMenu<A extends boolean, P extends boolean> {
  data: MentionableSelectMenuBuilder;
  customId: string;
  permissionsRequired?: Array<bigint>;
  adminOnly?: boolean;
  acknowledge: A;
  ephemeral?: boolean;
  deleted?: boolean;
  passPlayer: P;
  callback: MentionableSelectMenuCallback<A, P>;
  onError: (e: unknown) => void;
}

export default class MentionableSelectMenu<A extends boolean, P extends boolean>
  implements IMentionableSelectMenu<A, P>
{
  data: MentionableSelectMenuBuilder = new MentionableSelectMenuBuilder();
  customId: string = "";
  permissionsRequired?: Array<bigint> = [];
  adminOnly?: boolean = false;
  acknowledge: A = true as A;
  ephemeral?: boolean = true;
  deleted?: boolean = false;
  passPlayer: P = false as P;
  callback: MentionableSelectMenuCallback<A, P> = async () => {
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

  constructor(mentionableSelectMenuObject: IMentionableSelectMenu<A, P>) {
    return deepInstantiate(this, mentionableSelectMenuObject);
  }
}
