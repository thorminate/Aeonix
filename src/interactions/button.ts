import { ButtonInteraction } from "discord.js";
import Player from "../models/game/player/player.js";
import deepInstantiate from "../utils/deepInstantiate.js";
import log from "../utils/log.js";

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
  customId: string = "";
  permissionsRequired?: Array<bigint> = [];
  adminOnly?: boolean = false;
  deleted?: boolean = false;
  passPlayer?: boolean = false;
  callback: (
    buttonContext: ButtonInteraction,
    player?: Player
  ) => Promise<void> = async () => {
    log({
      header: "Button callback not implemented",
      processName: "ButtonHandler",
      type: "Error",
    });
  };
  onError: (error: unknown) => void = (e) => {
    log({
      header: "Button Error (error handler not implemented!)",
      processName: "ButtonHandler",
      payload: e,
      type: "Error",
    });
  };

  constructor(buttonObject: IButton) {
    return deepInstantiate(this, buttonObject);
  }
}
