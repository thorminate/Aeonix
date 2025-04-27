import { CacheType, ModalSubmitInteraction } from "discord.js";
import Player from "../models/player/player.js";
import deepInstantiate from "../utils/deepInstantiate.js";
import log from "../utils/log.js";

export type ModalContext = Omit<
  ModalSubmitInteraction<CacheType>,
  "reply" | "deferReply" | "update" | "deferUpdate"
>;

type ButtonCallback<A extends boolean, P extends boolean> = A extends true
  ? P extends true
    ? (buttonContext: ModalContext, player: Player) => Promise<void>
    : (buttonContext: ModalContext) => Promise<void>
  : P extends true
  ? (
      buttonContext: ModalSubmitInteraction<CacheType>,
      player: Player
    ) => Promise<void>
  : (buttonContext: ModalSubmitInteraction<CacheType>) => Promise<void>;

export interface IModal<A extends boolean, P extends boolean> {
  customId: string;
  permissionsRequired?: Array<bigint>;
  adminOnly?: boolean;
  acknowledge: A;
  ephemeral?: boolean;
  deleted?: boolean;
  passPlayer: P;
  callback: ButtonCallback<A, P>;
  onError: (error: Error) => Promise<void>;
}

export default class Modal<A extends boolean, P extends boolean>
  implements IModal<A, P>
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
      header: "Modal callback not implemented",
      processName: "ModalHandler",
      type: "Error",
    });
  };
  onError: (error: unknown) => Promise<void> = async (e) => {
    log({
      header: "Modal Error (error handler not implemented!)",
      processName: "ModalHandler",
      payload: e,
      type: "Error",
    });
  };

  constructor(modalObject: IModal<A, P>) {
    return deepInstantiate(this, modalObject);
  }
}
