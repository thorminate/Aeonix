import { ButtonInteraction } from "discord.js";
import Player from "../models/player/Player.js";

export interface Button {
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
