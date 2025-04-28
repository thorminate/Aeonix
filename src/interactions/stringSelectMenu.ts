import {
  AnySelectMenuInteraction,
  CacheType,
  StringSelectMenuInteraction,
} from "discord.js";
import Player from "../models/player/player.js";
import deepInstantiate from "../utils/deepInstantiate.js";
import log from "../utils/log.js";

export type SelectMenuContext = Omit<
  AnySelectMenuInteraction<CacheType>,
  "reply" | "deferReply" | "showModal" | "update" | "deferUpdate"
>;

type StringSelectMenuCallback<
  A extends boolean,
  P extends boolean
> = A extends true
  ? P extends true
    ? (buttonContext: SelectMenuContext, player: Player) => Promise<void>
    : (buttonContext: SelectMenuContext) => Promise<void>
  : P extends true
  ? (
      buttonContext: StringSelectMenuInteraction<CacheType>,
      player: Player
    ) => Promise<void>
  : (buttonContext: StringSelectMenuInteraction<CacheType>) => Promise<void>;

export interface IStringSelectMenu<A extends boolean, P extends boolean> {
  customId: string;
  permissionsRequired?: Array<bigint>;
  adminOnly?: boolean;
  acknowledge: A;
  ephemeral?: boolean;
  deleted?: boolean;
  passPlayer: P;
  callback: StringSelectMenuCallback<A, P>;
  onError: (e: unknown) => void;
}

export default class StringSelectMenu<A extends boolean, P extends boolean>
  implements IStringSelectMenu<A, P>
{
  customId: string = "";
  permissionsRequired?: Array<bigint> = [];
  adminOnly?: boolean = false;
  acknowledge: A = true as A;
  ephemeral?: boolean = true;
  deleted?: boolean = false;
  passPlayer: P = false as P;
  callback: StringSelectMenuCallback<A, P> = async () => {
    log({
      header: "Select menu callback not implemented",
      processName: "ButtonHandler",
      type: "Error",
    });
  };
  onError: (e: unknown) => void = (e) => {
    log({
      header: "Select menu Error (error handler not implemented!)",
      processName: "ButtonHandler",
      payload: e,
      type: "Error",
    });
  };

  constructor(stringSelectMenuObject: IStringSelectMenu<A, P>) {
    return deepInstantiate(this, stringSelectMenuObject);
  }
}
