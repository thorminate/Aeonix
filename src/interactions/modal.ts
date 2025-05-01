import { CacheType, ModalBuilder, ModalSubmitInteraction } from "discord.js";
import Player from "../models/player/player.js";
import deepInstantiate from "../utils/deepInstantiate.js";
import log from "../utils/log.js";

export type ModalContext = Omit<
  ModalSubmitInteraction<CacheType>,
  "reply" | "deferReply" | "update" | "deferUpdate"
>;

type ModalCallback<A extends boolean, P extends boolean> = A extends true
  ? P extends true
    ? (context: ModalContext, player: Player) => Promise<void>
    : (context: ModalContext) => Promise<void>
  : P extends true
  ? (
      context: ModalSubmitInteraction<CacheType>,
      player: Player
    ) => Promise<void>
  : (context: ModalSubmitInteraction<CacheType>) => Promise<void>;

export interface IModal<A extends boolean, P extends boolean> {
  data: ModalBuilder;
  customId: string;
  permissionsRequired?: Array<bigint>;
  adminOnly?: boolean;
  acknowledge: A;
  ephemeral?: boolean;
  deleted?: boolean;
  passPlayer: P;
  callback: ModalCallback<A, P>;
  onError: (e: unknown) => void;
}

export default class Modal<A extends boolean, P extends boolean>
  implements IModal<A, P>
{
  data: ModalBuilder = new ModalBuilder();
  customId: string = "";
  permissionsRequired?: Array<bigint> = [];
  adminOnly?: boolean = false;
  acknowledge: A = true as A;
  ephemeral?: boolean = true;
  deleted?: boolean = false;
  passPlayer: P = false as P;
  callback: ModalCallback<A, P> = async () => {
    log({
      header: "Modal callback not implemented",
      processName: "ModalHandler",
      type: "Error",
    });
  };
  onError: (e: unknown) => void = (e) => {
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
