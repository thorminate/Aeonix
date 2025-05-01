import {
  CacheType,
  RoleSelectMenuBuilder,
  RoleSelectMenuInteraction,
} from "discord.js";
import Player from "../models/player/player.js";
import deepInstantiate from "../utils/deepInstantiate.js";
import log from "../utils/log.js";

export type RoleSelectMenuContext = Omit<
  RoleSelectMenuInteraction<CacheType>,
  "reply" | "deferReply" | "showModal" | "update" | "deferUpdate"
>;

type RoleSelectMenuCallback<
  A extends boolean,
  P extends boolean
> = A extends true
  ? P extends true
    ? (context: RoleSelectMenuContext, player: Player) => Promise<void>
    : (context: RoleSelectMenuContext) => Promise<void>
  : P extends true
  ? (
      context: RoleSelectMenuInteraction<CacheType>,
      player: Player
    ) => Promise<void>
  : (context: RoleSelectMenuInteraction<CacheType>) => Promise<void>;

export interface IRoleSelectMenu<A extends boolean, P extends boolean> {
  data: RoleSelectMenuBuilder;
  customId: string;
  permissionsRequired?: Array<bigint>;
  adminOnly?: boolean;
  acknowledge: A;
  ephemeral?: boolean;
  deleted?: boolean;
  passPlayer: P;
  callback: RoleSelectMenuCallback<A, P>;
  onError: (e: unknown) => void;
}

export default class RoleSelectMenu<A extends boolean, P extends boolean>
  implements IRoleSelectMenu<A, P>
{
  data: RoleSelectMenuBuilder = new RoleSelectMenuBuilder();
  customId: string = "";
  permissionsRequired?: Array<bigint> = [];
  adminOnly?: boolean = false;
  acknowledge: A = true as A;
  ephemeral?: boolean = true;
  deleted?: boolean = false;
  passPlayer: P = false as P;
  callback: RoleSelectMenuCallback<A, P> = async () => {
    log({
      header: "Role select menu callback not implemented",
      processName: "RoleSelectMenuHandler",
      type: "Error",
    });
  };
  onError: (e: unknown) => void = (e) => {
    log({
      header: "Role select menu Error (error handler not implemented!)",
      processName: "RoleSelectMenuHandler",
      payload: e,
      type: "Error",
    });
  };

  constructor(roleSelectMenuObject: IRoleSelectMenu<A, P>) {
    return deepInstantiate(this, roleSelectMenuObject);
  }
}
