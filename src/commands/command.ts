import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import Player from "../models/Game/Player/Player.js";
import deepInstantiate from "../utils/deepInstantiate.js";

export interface ICommand {
  data: SlashCommandBuilder;
  permissionsRequired?: Array<bigint>;
  adminOnly?: boolean;
  deleted?: boolean;
  passPlayer?: boolean;
  ephemeral?: boolean;
  callback: (context: CommandInteraction, player?: Player) => Promise<void>;
  onError: (error: Error) => void;
}

export default class Command implements ICommand {
  data: SlashCommandBuilder;
  permissionsRequired?: Array<bigint> = [];
  adminOnly?: boolean = false;
  deleted?: boolean = false;
  passPlayer?: boolean = false;
  ephemeral?: boolean = true;
  callback: (context: CommandInteraction, player?: Player) => Promise<void>;
  onError: (error: Error) => void;

  constructor(commandObject: ICommand) {
    return deepInstantiate(this, commandObject, { data: SlashCommandBuilder });
  }
}
