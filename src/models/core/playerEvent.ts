import Player from "../player/player.js";
import { PlayerEvents } from "../player/utils/playerEvents.js";

export class PlayerEventParams<Args extends PlayerEvents[keyof PlayerEvents]> {
  player: Player;
  args: Args;

  constructor(player: Player, ...args: Args) {
    this.player = player;
    this.args = args;
  }
}

export default class PlayerEventDeclaration<T extends keyof PlayerEvents> {
  callback: (event: PlayerEventParams<PlayerEvents[T]>) => Promise<void>;
  onError: (e: unknown, event: PlayerEventParams<PlayerEvents[T]>) => void;

  constructor({
    callback,
    onError,
  }: {
    callback: (event: PlayerEventParams<PlayerEvents[T]>) => Promise<void>;
    onError: (e: unknown, event: PlayerEventParams<PlayerEvents[T]>) => void;
  }) {
    this.callback = callback;
    this.onError = onError;
  }
}
