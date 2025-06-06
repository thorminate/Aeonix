import {
  CacheType,
  ChannelSelectMenuBuilder,
  ChannelSelectMenuInteraction,
} from "discord.js";
import Player from "../models/player/player.js";
import hardMerge from "../utils/hardMerge.js";
import log from "../utils/log.js";

export type ChannelSelectMenuContext = Omit<
  ChannelSelectMenuInteraction<CacheType>,
  "reply" | "deferReply" | "showModal" | "update" | "deferUpdate"
>;

type ChannelSelectMenuCallback<
  Acknowledge extends boolean,
  PassPlayer extends boolean
> = Acknowledge extends true
  ? PassPlayer extends true
    ? (context: ChannelSelectMenuContext, player: Player) => Promise<void>
    : (context: ChannelSelectMenuContext) => Promise<void>
  : PassPlayer extends true
  ? (
      context: ChannelSelectMenuInteraction<CacheType>,
      player: Player
    ) => Promise<void>
  : (context: ChannelSelectMenuInteraction<CacheType>) => Promise<void>;

type EnvironmentOnly<PassPlayer extends boolean> = PassPlayer extends true
  ? boolean
  : false;

export interface IChannelSelectMenu<
  Acknowledge extends boolean,
  PassPlayer extends boolean
> {
  data: ChannelSelectMenuBuilder;
  customId: string;
  permissionsRequired?: Array<bigint>;
  adminOnly?: boolean;
  acknowledge: Acknowledge;
  ephemeral?: boolean;
  environmentOnly: EnvironmentOnly<PassPlayer>;
  deleted?: boolean;
  passPlayer: PassPlayer;
  callback: ChannelSelectMenuCallback<Acknowledge, PassPlayer>;
  onError: (e: unknown) => void;
}

export default class ChannelSelectMenu<
  Acknowledge extends boolean,
  PassPlayer extends boolean
> implements IChannelSelectMenu<Acknowledge, PassPlayer>
{
  data: ChannelSelectMenuBuilder = new ChannelSelectMenuBuilder();
  customId: string = "";
  permissionsRequired?: Array<bigint> = [];
  adminOnly?: boolean = false;
  acknowledge: Acknowledge = true as Acknowledge;
  ephemeral?: boolean = true;
  environmentOnly: EnvironmentOnly<PassPlayer> = false;
  deleted?: boolean = false;
  passPlayer: PassPlayer = false as PassPlayer;
  callback: ChannelSelectMenuCallback<Acknowledge, PassPlayer> = async () => {
    log({
      header: "Channel select menu callback not implemented",
      processName: "ChannelSelectMenuHandler",
      type: "Error",
    });
  };
  onError: (e: unknown) => void = (e) => {
    log({
      header: "Channel select menu Error (error handler not implemented!)",
      processName: "ChannelSelectMenuHandler",
      payload: e,
      type: "Error",
    });
  };

  constructor(
    channelSelectMenuObject: IChannelSelectMenu<Acknowledge, PassPlayer>
  ) {
    return hardMerge(this, channelSelectMenuObject);
  }
}
