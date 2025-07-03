import Aeonix, { AeonixEvents } from "../../aeonix.js";

export class EventParams<Args extends AeonixEvents[keyof AeonixEvents]> {
  aeonix: Aeonix;
  args: Args;

  constructor(aeonix: Aeonix, ...args: Args) {
    this.aeonix = aeonix;
    this.args = args;
  }
}

export default class Event<T extends AeonixEvents[keyof AeonixEvents]> {
  callback: (event: EventParams<T>) => Promise<void>;
  onError: (e: unknown) => Promise<void>;

  constructor({
    callback,
    onError,
  }: {
    callback: (event: EventParams<T>) => Promise<void>;
    onError: (e: unknown) => Promise<void>;
  }) {
    this.callback = callback;
    this.onError = onError;
  }
}
