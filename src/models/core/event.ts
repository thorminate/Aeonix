import Aeonix, { AeonixEvents } from "../../aeonix.js";

export class EventParams<Args extends AeonixEvents[keyof AeonixEvents]> {
  aeonix: Aeonix;
  args: Args;

  constructor(aeonix: Aeonix, ...args: Args) {
    this.aeonix = aeonix;
    this.args = args;
  }
}

export default class Event<T extends keyof AeonixEvents> {
  callback: (event: EventParams<AeonixEvents[T]>) => Promise<void>;
  onError: (e: unknown, event: EventParams<AeonixEvents[T]>) => void;

  constructor({
    callback,
    onError,
  }: {
    callback: (event: EventParams<AeonixEvents[T]>) => Promise<void>;
    onError: (e: unknown, event: EventParams<AeonixEvents[T]>) => void;
  }) {
    this.callback = callback;
    this.onError = onError;
  }
}
