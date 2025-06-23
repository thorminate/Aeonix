import { Aeonix } from "../../aeonix.js";

export class EventParams<T> {
  aeonix: Aeonix;
  context: T;

  constructor(aeonix: Aeonix, context: T) {
    this.aeonix = aeonix;
    this.context = context;
  }
}

export default class Event<T> {
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
