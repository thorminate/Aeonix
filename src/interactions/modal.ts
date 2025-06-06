import { CacheType, ModalBuilder, ModalSubmitInteraction } from "discord.js";
import Player from "../models/player/player.js";
import hardMerge from "../utils/hardMerge.js";
import log from "../utils/log.js";

export type ModalContext = Omit<
  ModalSubmitInteraction<CacheType>,
  "reply" | "deferReply" | "update" | "deferUpdate"
>;

type ModalCallback<
  Acknowledge extends boolean,
  PassPlayer extends boolean
> = Acknowledge extends true
  ? PassPlayer extends true
    ? (context: ModalContext, player: Player) => Promise<void>
    : (context: ModalContext) => Promise<void>
  : PassPlayer extends true
  ? (
      context: ModalSubmitInteraction<CacheType>,
      player: Player
    ) => Promise<void>
  : (context: ModalSubmitInteraction<CacheType>) => Promise<void>;

type EnvironmentOnly<PassPlayer extends boolean> = PassPlayer extends true
  ? boolean
  : false;

export interface IModal<
  Acknowledge extends boolean,
  PassPlayer extends boolean
> {
  data: ModalBuilder;
  customId: string;
  permissionsRequired?: Array<bigint>;
  adminOnly?: boolean;
  acknowledge: Acknowledge;
  ephemeral?: boolean;
  environmentOnly: EnvironmentOnly<PassPlayer>;
  deleted?: boolean;
  passPlayer: PassPlayer;
  callback: ModalCallback<Acknowledge, PassPlayer>;
  onError: (e: unknown) => void;
}

export default class Modal<
  Acknowledge extends boolean,
  PassPlayer extends boolean
> implements IModal<Acknowledge, PassPlayer>
{
  data: ModalBuilder = new ModalBuilder();
  customId: string = "";
  permissionsRequired?: Array<bigint> = [];
  adminOnly?: boolean = false;
  acknowledge: Acknowledge = true as Acknowledge;
  ephemeral?: boolean = true;
  environmentOnly: EnvironmentOnly<PassPlayer> = false;
  deleted?: boolean = false;
  passPlayer: PassPlayer = false as PassPlayer;
  callback: ModalCallback<Acknowledge, PassPlayer> = async () => {
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

  constructor(modalObject: IModal<Acknowledge, PassPlayer>) {
    return hardMerge(this, modalObject);
  }
}
