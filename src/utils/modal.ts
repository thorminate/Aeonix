import { ModalSubmitInteraction } from "discord.js";
import Player from "../models/Game/Player/Player.js";
import deepInstantiate from "./deepInstantiate.js";

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
  customId: string;
  permissionsRequired?: Array<bigint> = [];
  adminOnly?: boolean = false;
  deleted?: boolean = false;
  passPlayer?: boolean = false;
  callback: (
    buttonContext: ModalSubmitInteraction,
    player?: Player
  ) => Promise<void>;
  onError: (error: Error) => Promise<void>;

  constructor(modalObject: IModal) {
    return deepInstantiate(this, modalObject);
  }
}
