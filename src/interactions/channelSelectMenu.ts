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
  A extends boolean,
  P extends boolean
> = A extends true
  ? P extends true
    ? (context: ChannelSelectMenuContext, player: Player) => Promise<void>
    : (context: ChannelSelectMenuContext) => Promise<void>
  : P extends true
  ? (
      context: ChannelSelectMenuInteraction<CacheType>,
      player: Player
    ) => Promise<void>
  : (context: ChannelSelectMenuInteraction<CacheType>) => Promise<void>;

export interface IChannelSelectMenu<A extends boolean, P extends boolean> {
  data: ChannelSelectMenuBuilder;
  customId: string;
  permissionsRequired?: Array<bigint>;
  adminOnly?: boolean;
  acknowledge: A;
  ephemeral?: boolean;
  deleted?: boolean;
  passPlayer: P;
  callback: ChannelSelectMenuCallback<A, P>;
  onError: (e: unknown) => void;
}

export default class ChannelSelectMenu<A extends boolean, P extends boolean>
  implements IChannelSelectMenu<A, P>
{
  data: ChannelSelectMenuBuilder = new ChannelSelectMenuBuilder();
  customId: string = "";
  permissionsRequired?: Array<bigint> = [];
  adminOnly?: boolean = false;
  acknowledge: A = true as A;
  ephemeral?: boolean = true;
  deleted?: boolean = false;
  passPlayer: P = false as P;
  callback: ChannelSelectMenuCallback<A, P> = async () => {
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

  constructor(channelSelectMenuObject: IChannelSelectMenu<A, P>) {
    return hardMerge(this, channelSelectMenuObject);
  }
}
