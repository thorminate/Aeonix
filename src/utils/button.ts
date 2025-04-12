import { ButtonInteraction } from "discord.js";
import Player from "../models/Game/Player/Player.js";
import deepInstantiate from "./deepInstantiate.js";

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
  onError: (error: Error) => void;
}

export default class Button implements IButton {
  customId: string;
  permissionsRequired?: Array<bigint> = [];
  adminOnly?: boolean = false;
  deleted?: boolean = false;
  passPlayer?: boolean = false;
  callback: (
    buttonContext: ButtonInteraction,
    player?: Player
  ) => Promise<void>;
  onError: (error: Error) => void;

  constructor(buttonObject: IButton) {
    return deepInstantiate(this, buttonObject);
  }
}
