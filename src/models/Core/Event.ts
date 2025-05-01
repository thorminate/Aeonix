import { BaseInteraction } from "discord.js";
import { Aeonix } from "../../aeonix.js";

export class EventParams<T extends BaseInteraction | unknown = unknown> {
  aeonix: Aeonix;
  context: T;

  constructor(aeonix: Aeonix, context: T) {
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
