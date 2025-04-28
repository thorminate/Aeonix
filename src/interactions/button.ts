import { ButtonInteraction, CacheType } from "discord.js";
import Player from "../models/player/player.js";
import deepInstantiate from "../utils/deepInstantiate.js";
import log from "../utils/log.js";

export type ButtonContext = Omit<
  ButtonInteraction<CacheType>,
  "reply" | "deferReply" | "showModal" | "update" | "deferUpdate"
>;

type ButtonCallback<A extends boolean, P extends boolean> = A extends true
  ? P extends true
    ? (buttonContext: ButtonContext, player: Player) => Promise<void>
    : (buttonContext: ButtonContext) => Promise<void>
  : P extends true
  ? (
      buttonContext: ButtonInteraction<CacheType>,
      player: Player
    ) => Promise<void>
  : (buttonContext: ButtonInteraction<CacheType>) => Promise<void>;

export interface IButton<A extends boolean, P extends boolean> {
  customId: string;
  permissionsRequired?: Array<bigint>;
  adminOnly?: boolean;
  acknowledge: A;
  ephemeral?: boolean;
  deleted?: boolean;
  passPlayer: P;
  callback: ButtonCallback<A, P>;
  onError: (e: unknown) => void;
}

export default class Button<A extends boolean, P extends boolean>
  implements IButton<A, P>
{
  customId: string = "";
  permissionsRequired?: Array<bigint> = [];
  adminOnly?: boolean = false;
  acknowledge: A = true as A;
  ephemeral?: boolean = true;
  deleted?: boolean = false;
  passPlayer: P = false as P;
  callback: ButtonCallback<A, P> = async () => {
    log({
      header: "Button callback not implemented",
      processName: "ButtonHandler",
      type: "Error",
    });
  };
  onError: (e: unknown) => void = (e) => {
    log({
      header: "Button Error (error handler not implemented!)",
      processName: "ButtonHandler",
      payload: e,
      type: "Error",
    });
  };

  constructor(buttonObject: IButton<A, P>) {
    return deepInstantiate(this, buttonObject);
  }
}
