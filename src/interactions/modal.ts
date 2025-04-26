import { ModalSubmitInteraction } from "discord.js";
import Player from "../models/game/player/player.js";
import deepInstantiate from "../utils/deepInstantiate.js";
import log from "../utils/log.js";

export interface IModal {
  customId: string;
  permissionsRequired?: Array<bigint>;
  adminOnly?: boolean;
  deleted?: boolean;
  passPlayer?: boolean;
  callback: (
    buttonContext: ModalSubmitInteraction,
    player?: Player
  ) => Promise<void>;
  onError: (error: Error) => Promise<void>;
}

export default class Modal implements IModal {
  customId: string = "";
  permissionsRequired?: Array<bigint> = [];
  adminOnly?: boolean = false;
  deleted?: boolean = false;
  passPlayer?: boolean = false;
  callback: (
    buttonContext: ModalSubmitInteraction,
    player?: Player
  ) => Promise<void> = async () => {
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

  constructor(modalObject: IModal) {
    return deepInstantiate(this, modalObject);
  }
}
