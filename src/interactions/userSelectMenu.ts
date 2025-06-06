import {
  CacheType,
  UserSelectMenuBuilder,
  UserSelectMenuInteraction,
} from "discord.js";
import Player from "../models/player/player.js";
import hardMerge from "../utils/hardMerge.js";
import log from "../utils/log.js";

export type UserSelectMenuContext = Omit<
  UserSelectMenuInteraction<CacheType>,
  "reply" | "deferReply" | "showModal" | "update" | "deferUpdate"
>;

type UserSelectMenuCallback<
  Acknowledge extends boolean,
  PassPlayer extends boolean
> = Acknowledge extends true
  ? PassPlayer extends true
    ? (context: UserSelectMenuContext, player: Player) => Promise<void>
    : (context: UserSelectMenuContext) => Promise<void>
  : PassPlayer extends true
  ? (
      context: UserSelectMenuInteraction<CacheType>,
      player: Player
    ) => Promise<void>
  : (context: UserSelectMenuInteraction<CacheType>) => Promise<void>;

type EnvironmentOnly<PassPlayer extends boolean> = PassPlayer extends true
  ? boolean
  : false;

export interface IUserSelectMenu<
  Acknowledge extends boolean,
  PassPlayer extends boolean
> {
  data: UserSelectMenuBuilder;
  customId: string;
  permissionsRequired?: Array<bigint>;
  adminOnly?: boolean;
  acknowledge: Acknowledge;
  ephemeral?: boolean;
  environmentOnly: EnvironmentOnly<PassPlayer>;
  deleted?: boolean;
  passPlayer: PassPlayer;
  callback: UserSelectMenuCallback<Acknowledge, PassPlayer>;
  onError: (e: unknown) => void;
}

export default class UserSelectMenu<
  Acknowledge extends boolean,
  PassPlayer extends boolean
> implements IUserSelectMenu<Acknowledge, PassPlayer>
{
  data: UserSelectMenuBuilder = new UserSelectMenuBuilder();
  customId: string = "";
  permissionsRequired?: Array<bigint> = [];
  adminOnly?: boolean = false;
  acknowledge: Acknowledge = true as Acknowledge;
  ephemeral?: boolean = true;
  environmentOnly: EnvironmentOnly<PassPlayer> = false;
  deleted?: boolean = false;
  passPlayer: PassPlayer = false as PassPlayer;
  callback: UserSelectMenuCallback<Acknowledge, PassPlayer> = async () => {
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

  constructor(userSelectMenuObject: IUserSelectMenu<Acknowledge, PassPlayer>) {
    return hardMerge(this, userSelectMenuObject);
  }
}
