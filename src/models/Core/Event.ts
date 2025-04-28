import { Aeonix } from "../../aeonix.js";

export class EventParams {
  aeonix: Aeonix;
  context: unknown;

  constructor(aeonix: Aeonix, context: unknown) {
    this.aeonix = aeonix;
    this.context = context;
  }
}

export default class Event {
  callback: (event: EventParams) => Promise<void>;
  onError: (e: unknown) => Promise<void>;

  constructor({
    callback,
    onError,
  }: {
    callback: (event: EventParams) => Promise<void>;
    onError: (e: unknown) => Promise<void>;
  }) {
    this.callback = callback;
    this.onError = onError;
  }
}
