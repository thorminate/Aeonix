import {
  CacheType,
  StringSelectMenuBuilder,
  StringSelectMenuInteraction,
} from "discord.js";
import Player from "../models/player/player.js";
import hardMerge from "../utils/hardMerge.js";
import log from "../utils/log.js";

export type StringSelectMenuContext = Omit<
  StringSelectMenuInteraction<CacheType>,
  "reply" | "deferReply" | "showModal" | "update" | "deferUpdate"
>;

type StringSelectMenuCallback<
  Acknowledge extends boolean,
  PassPlayer extends boolean
> = Acknowledge extends true
  ? PassPlayer extends true
    ? (context: StringSelectMenuContext, player: Player) => Promise<void>
    : (context: StringSelectMenuContext) => Promise<void>
  : PassPlayer extends true
  ? (
      context: StringSelectMenuInteraction<CacheType>,
      player: Player
    ) => Promise<void>
  : (context: StringSelectMenuInteraction<CacheType>) => Promise<void>;

type EnvironmentOnly<PassPlayer extends boolean> = PassPlayer extends true
  ? boolean
  : false;

export interface IStringSelectMenu<
  Acknowledge extends boolean,
  PassPlayer extends boolean
> {
  data: StringSelectMenuBuilder;
  customId: string;
  permissionsRequired?: Array<bigint>;
  adminOnly?: boolean;
  acknowledge: Acknowledge;
  ephemeral?: boolean;
  environmentOnly: EnvironmentOnly<PassPlayer>;
  deleted?: boolean;
  passPlayer: PassPlayer;
  callback: StringSelectMenuCallback<Acknowledge, PassPlayer>;
  onError: (e: unknown) => void;
}

export default class StringSelectMenu<
  Acknowledge extends boolean,
  PassPlayer extends boolean
> implements IStringSelectMenu<Acknowledge, PassPlayer>
{
  data: StringSelectMenuBuilder = new StringSelectMenuBuilder();
  customId: string = "";
  permissionsRequired?: Array<bigint> = [];
  adminOnly?: boolean = false;
  acknowledge: Acknowledge = true as Acknowledge;
  ephemeral?: boolean = true;
  environmentOnly: EnvironmentOnly<PassPlayer> = false;
  deleted?: boolean = false;
  passPlayer: PassPlayer = false as PassPlayer;
  callback: StringSelectMenuCallback<Acknowledge, PassPlayer> = async () => {
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

  constructor(
    stringSelectMenuObject: IStringSelectMenu<Acknowledge, PassPlayer>
  ) {
    return hardMerge(this, stringSelectMenuObject);
  }
}
