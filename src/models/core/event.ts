import Aeonix, { AeonixEvents } from "../../aeonix.js";

export class DiscordEventParams<Args extends AeonixEvents[keyof AeonixEvents]> {
  aeonix: Aeonix;
  args: Args;

  constructor(aeonix: Aeonix, ...args: Args) {
    this.aeonix = aeonix;
    this.args = args;
  }
}

export default class DiscordEvent<T extends keyof AeonixEvents> {
  callback: (event: DiscordEventParams<AeonixEvents[T]>) => Promise<void>;
  onError: (e: unknown, event: DiscordEventParams<AeonixEvents[T]>) => void;

  constructor({
    callback,
    onError,
  }: {
    callback: (event: DiscordEventParams<AeonixEvents[T]>) => Promise<void>;
    onError: (e: unknown, event: DiscordEventParams<AeonixEvents[T]>) => void;
  }) {
    this.callback = callback;
    this.onError = onError;
  }
}
