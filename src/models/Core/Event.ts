import { Aeonix } from "../../aeonix.js";

export class EventParams {
  aeonix: Aeonix;
  context: any;

  constructor(aeonix: Aeonix, context: any) {
    this.aeonix = aeonix;
    this.context = context;
  }
}

export default class Event {
  callback: (event: EventParams) => Promise<void>;
  onError: (e: any) => Promise<void>;

  constructor({
    callback,
    onError,
  }: {
    callback: (event: EventParams) => Promise<void>;
    onError: (e: any) => Promise<void>;
  }) {
    this.callback = callback;
    this.onError = onError;
  }
}
