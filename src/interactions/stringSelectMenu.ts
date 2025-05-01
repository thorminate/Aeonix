import {
  CacheType,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from "discord.js";
import Player from "../models/player/player.js";
import deepInstantiate from "../utils/deepInstantiate.js";
import log from "../utils/log.js";

export type StringSelectMenuContext = Omit<
  StringSelectMenuInteraction<CacheType>,
  "reply" | "deferReply" | "showModal" | "update" | "deferUpdate"
>;

type StringSelectMenuCallback<
  A extends boolean,
  P extends boolean
> = A extends true
  ? P extends true
    ? (context: StringSelectMenuContext, player: Player) => Promise<void>
    : (context: StringSelectMenuContext) => Promise<void>
  : P extends true
  ? (
      context: StringSelectMenuInteraction<CacheType>,
      player: Player
    ) => Promise<void>
  : (context: StringSelectMenuInteraction<CacheType>) => Promise<void>;

export interface IStringSelectMenu<A extends boolean, P extends boolean> {
  data: StringSelectMenuBuilder;
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
  data: StringSelectMenuBuilder = new StringSelectMenuBuilder();
  customId: string = "";
  permissionsRequired?: Array<bigint> = [];
  adminOnly?: boolean = false;
  acknowledge: A = true as A;
  ephemeral?: boolean = true;
  deleted?: boolean = false;
  passPlayer: P = false as P;
  callback: StringSelectMenuCallback<A, P> = async () => {
    log({
      header: "String select menu callback not implemented",
      processName: "StringSelectMenuHandler",
      type: "Error",
    });
  };
  onError: (e: unknown) => void = (e) => {
    log({
      header: "String select menu Error (error handler not implemented!)",
      processName: "StringSelectMenuHandler",
      payload: e,
      type: "Error",
    });
  };

  constructor(stringSelectMenuObject: IStringSelectMenu<A, P>) {
    return deepInstantiate(this, stringSelectMenuObject);
  }
}
