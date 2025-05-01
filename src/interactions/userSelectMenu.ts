import {
  CacheType,
  UserSelectMenuBuilder,
  UserSelectMenuInteraction,
} from "discord.js";
import Player from "../models/player/player.js";
import deepInstantiate from "../utils/deepInstantiate.js";
import log from "../utils/log.js";

export type UserSelectMenuContext = Omit<
  UserSelectMenuInteraction<CacheType>,
  "reply" | "deferReply" | "showModal" | "update" | "deferUpdate"
>;

type UserSelectMenuCallback<
  A extends boolean,
  P extends boolean
> = A extends true
  ? P extends true
    ? (context: UserSelectMenuContext, player: Player) => Promise<void>
    : (context: UserSelectMenuContext) => Promise<void>
  : P extends true
  ? (
      context: UserSelectMenuInteraction<CacheType>,
      player: Player
    ) => Promise<void>
  : (context: UserSelectMenuInteraction<CacheType>) => Promise<void>;

export interface IUserSelectMenu<A extends boolean, P extends boolean> {
  data: UserSelectMenuBuilder;
  customId: string;
  permissionsRequired?: Array<bigint>;
  adminOnly?: boolean;
  acknowledge: A;
  ephemeral?: boolean;
  deleted?: boolean;
  passPlayer: P;
  callback: UserSelectMenuCallback<A, P>;
  onError: (e: unknown) => void;
}

export default class UserSelectMenu<A extends boolean, P extends boolean>
  implements IUserSelectMenu<A, P>
{
  data: UserSelectMenuBuilder = new UserSelectMenuBuilder();
  customId: string = "";
  permissionsRequired?: Array<bigint> = [];
  adminOnly?: boolean = false;
  acknowledge: A = true as A;
  ephemeral?: boolean = true;
  deleted?: boolean = false;
  passPlayer: P = false as P;
  callback: UserSelectMenuCallback<A, P> = async () => {
    log({
      header: "User select menu callback not implemented",
      processName: "UserSelectMenuHandler",
      type: "Error",
    });
  };
  onError: (e: unknown) => void = (e) => {
    log({
      header: "User select menu Error (error handler not implemented!)",
      processName: "UserSelectMenuHandler",
      payload: e,
      type: "Error",
    });
  };

  constructor(userSelectMenuObject: IUserSelectMenu<A, P>) {
    return deepInstantiate(this, userSelectMenuObject);
  }
}
