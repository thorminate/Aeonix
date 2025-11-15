import Aeonix, { AeonixEvents } from "../../aeonix.js";

export class AeonixEventParams<Args extends AeonixEvents[keyof AeonixEvents]> {
  aeonix: Aeonix;
  args: Args;

  constructor(aeonix: Aeonix, ...args: Args) {
    this.aeonix = aeonix;
    this.args = args;
  }
}

export default class AeonixEvent<T extends keyof AeonixEvents> {
  callback: (event: AeonixEventParams<AeonixEvents[T]>) => Promise<void>;
  onError: (e: unknown, event: AeonixEventParams<AeonixEvents[T]>) => void;

  constructor({
    callback,
    onError,
  }: {
    callback: (event: AeonixEventParams<AeonixEvents[T]>) => Promise<void>;
    onError: (e: unknown, event: AeonixEventParams<AeonixEvents[T]>) => void;
  }) {
    this.callback = callback;
    this.onError = onError;
  }
}
