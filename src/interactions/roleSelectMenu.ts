import {
  CacheType,
  RoleSelectMenuBuilder,
  RoleSelectMenuInteraction,
} from "discord.js";
import Player from "../models/player/player.js";
import hardMerge from "../utils/hardMerge.js";
import log from "../utils/log.js";

export type RoleSelectMenuContext = Omit<
  RoleSelectMenuInteraction<CacheType>,
  "reply" | "deferReply" | "showModal" | "update" | "deferUpdate"
>;

type RoleSelectMenuCallback<
  Acknowledge extends boolean,
  PassPlayer extends boolean
> = Acknowledge extends true
  ? PassPlayer extends true
    ? (context: RoleSelectMenuContext, player: Player) => Promise<void>
    : (context: RoleSelectMenuContext) => Promise<void>
  : PassPlayer extends true
  ? (
      context: RoleSelectMenuInteraction<CacheType>,
      player: Player
    ) => Promise<void>
  : (context: RoleSelectMenuInteraction<CacheType>) => Promise<void>;

type EnvironmentOnly<PassPlayer extends boolean> = PassPlayer extends true
  ? boolean
  : false;

export interface IRoleSelectMenu<
  Acknowledge extends boolean,
  PassPlayer extends boolean
> {
  data: RoleSelectMenuBuilder;
  customId: string;
  permissionsRequired?: Array<bigint>;
  adminOnly?: boolean;
  acknowledge: Acknowledge;
  ephemeral?: boolean;
  environmentOnly: EnvironmentOnly<PassPlayer>;
  deleted?: boolean;
  passPlayer: PassPlayer;
  callback: RoleSelectMenuCallback<Acknowledge, PassPlayer>;
  onError: (e: unknown) => void;
}

export default class RoleSelectMenu<
  Acknowledge extends boolean,
  PassPlayer extends boolean
> implements IRoleSelectMenu<Acknowledge, PassPlayer>
{
  data: RoleSelectMenuBuilder = new RoleSelectMenuBuilder();
  customId: string = "";
  permissionsRequired?: Array<bigint> = [];
  adminOnly?: boolean = false;
  acknowledge: Acknowledge = true as Acknowledge;
  ephemeral?: boolean = true;
  environmentOnly: EnvironmentOnly<PassPlayer> = false;
  deleted?: boolean = false;
  passPlayer: PassPlayer = false as PassPlayer;
  callback: RoleSelectMenuCallback<Acknowledge, PassPlayer> = async () => {
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

  constructor(roleSelectMenuObject: IRoleSelectMenu<Acknowledge, PassPlayer>) {
    return hardMerge(this, roleSelectMenuObject);
  }
}
