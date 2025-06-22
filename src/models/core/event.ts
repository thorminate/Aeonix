import { BaseInteraction } from "discord.js";
import { Aeonix } from "../../aeonix.js";

export class EventParams<T extends BaseInteraction | unknown> {
  aeonix: Aeonix;
  context: T;

  constructor(aeonix: Aeonix, context: T) {
    this.aeonix = aeonix;
    this.context = context;
  }
}

export default class Event<
  T extends BaseInteraction | unknown = BaseInteraction
> {
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
