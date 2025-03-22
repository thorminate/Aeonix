import { ButtonInteraction } from "discord.js";
import Player from "../models/player/Player.js";
import deepInstantiate from "../utils/deepInstantiate.js";

export interface IButton {
  customId: string;
  permissionsRequired?: Array<bigint>;
  adminOnly?: boolean;
  deleted?: boolean;
  passPlayer?: boolean;
  callback: (
    buttonContext: ButtonInteraction,
    player?: Player
  ) => Promise<void>;
  onError: (error: Error) => Promise<void>;
}

export default class Button implements IButton {
  customId: string;
  permissionsRequired?: Array<bigint>;
  adminOnly?: boolean;
  deleted?: boolean;
  passPlayer?: boolean;
  callback: (
    buttonContext: ButtonInteraction,
    player?: Player
  ) => Promise<void>;
  onError: (error: Error) => Promise<void>;

  constructor(buttonObject: IButton) {
    return deepInstantiate(this, buttonObject);
  }
}
