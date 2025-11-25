import Aeonix from "../../aeonix.js";
import Environment from "../environment/environment.js";
import { EnvironmentEvents } from "../environment/utils/environmentEvents.js";

export class EnvironmentEventParams<
  Args extends EnvironmentEvents[keyof EnvironmentEvents]
> {
  env: Environment;
  aeonix: Aeonix;
  args: Args;

  constructor(env: Environment, aeonix: Aeonix, ...args: Args) {
    this.env = env;
    this.aeonix = aeonix;
    this.args = args;
  }
}

export default class EnvironmentEvent<T extends keyof EnvironmentEvents> {
  callback: (
    event: EnvironmentEventParams<EnvironmentEvents[T]>
  ) => Promise<void>;
  onError: (
    e: unknown,
    event: EnvironmentEventParams<EnvironmentEvents[T]>
  ) => void;

  constructor({
    callback,
    onError,
  }: {
    callback: (
      event: EnvironmentEventParams<EnvironmentEvents[T]>
    ) => Promise<void>;
    onError: (
      e: unknown,
      event: EnvironmentEventParams<EnvironmentEvents[T]>
    ) => void;
  }) {
    this.callback = callback;
    this.onError = onError;
  }
}
