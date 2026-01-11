import { EventEmitter } from "events";
import path from "path";
import url from "url";
import getAllFiles from "#utils/getAllFiles.js";
import EnvironmentEventDeclaration, {
  EnvironmentEventParams,
} from "#core/environmentEvent.js";
import Environment from "#environment/environment.js";
import Item from "#item/item.js";
import Player from "#player/player.js";
import aeonix from "#root/index.js";

export interface EnvironmentEvents {
  playerJoined: [player: Player];
  playerLeft: [player: Player];
  itemAdded: [item: Item, player?: Player];
  itemRemoved: [item: Item, player?: Player];
}

export type EnvironmentEvent = keyof EnvironmentEvents;

export type EnvironmentEventUnion<
  T extends { [K in keyof T]: unknown[] },
  Discriminant extends string = "type",
  PayloadProp extends string = "args"
> = {
  [K in keyof T]: { [P in Discriminant]: K } & { [P in PayloadProp]: T[K] } & {
    env: Environment;
  };
}[keyof T];

export type AnyEnvironmentEvent = EnvironmentEventUnion<EnvironmentEvents>;

export default class EnvironmentEventsManager extends EventEmitter {
  parent: Environment | null = null;

  override emit<Event extends keyof EnvironmentEvents>(
    eventName: Event,
    ...args: EnvironmentEvents[Event]
  ): boolean;
  override emit(eventName: string, ...args: unknown[]): boolean {
    return super.emit(eventName, ...args);
  }

  override on<Event extends keyof EnvironmentEvents>(
    event: Event,
    listener: (...args: EnvironmentEvents[Event]) => void
  ): this;
  override on(event: string, listener: (...args: unknown[]) => void): this {
    super.on(event, listener);
    return this;
  }

  override once<Event extends keyof EnvironmentEvents>(
    event: Event,
    listener: (...args: EnvironmentEvents[Event]) => void
  ): this;
  override once(event: string, listener: (...args: unknown[]) => void): this {
    super.once(event, listener);
    return this;
  }

  override off<Event extends keyof EnvironmentEvents>(
    event: Event,
    listener: (...args: EnvironmentEvents[Event]) => void
  ): this;
  override off(event: string, listener: (...args: unknown[]) => void): this {
    super.off(event, listener);
    return this;
  }

  override removeAllListeners<Event extends keyof EnvironmentEvents>(
    event?: Event
  ): this;
  override removeAllListeners(event?: string): this {
    super.removeAllListeners(event);
    return this;
  }

  override addListener<Event extends keyof EnvironmentEvents>(
    event: Event,
    listener: (...args: EnvironmentEvents[Event]) => void
  ): this;
  override addListener(
    event: string,
    listener: (...args: unknown[]) => void
  ): this {
    super.addListener(event, listener);
    return this;
  }

  override prependListener<Event extends keyof EnvironmentEvents>(
    event: Event,
    listener: (...args: EnvironmentEvents[Event]) => void
  ): this;
  override prependListener(
    event: string,
    listener: (...args: unknown[]) => void
  ): this {
    super.prependListener(event, listener);
    return this;
  }

  override prependOnceListener<Event extends keyof EnvironmentEvents>(
    event: Event,
    listener: (...args: EnvironmentEvents[Event]) => void
  ): this;
  override prependOnceListener(
    event: string,
    listener: (...args: unknown[]) => void
  ): this {
    super.prependOnceListener(event, listener);
    return this;
  }

  override listeners<Event extends keyof EnvironmentEvents>(
    event: Event
  ): Array<(...args: unknown[]) => void>;
  override listeners(event: string): Array<(...args: unknown[]) => void> {
    return super.listeners(event) as Array<(...args: unknown[]) => void>;
  }

  override rawListeners<Event extends keyof EnvironmentEvents>(
    event: Event
  ): Array<(...args: unknown[]) => void>;
  override rawListeners(event: string): Array<(...args: unknown[]) => void> {
    return super.rawListeners(event) as Array<(...args: unknown[]) => void>;
  }

  override listenerCount<Event extends keyof EnvironmentEvents>(
    event: Event
  ): number;
  override listenerCount(event: string): number {
    return super.listenerCount(event);
  }

  override eventNames(): Array<keyof EnvironmentEvents> {
    return super.eventNames() as Array<keyof EnvironmentEvents>;
  }

  constructor(parent?: Environment) {
    super();
    this.setUpListeners();
    if (parent) this.parent = parent;
  }

  call<T extends keyof EnvironmentEvents>(
    e: T,
    ...args: EnvironmentEvents[T]
  ): boolean;
  call(e: string, ...args: unknown[]): boolean {
    return super.emit(e, ...args);
  }

  private async setUpListeners() {
    const log = aeonix.logger.for("EnvironmentEventsManager.setUpListeners");
    try {
      const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

      const eventFolders = await getAllFiles(
        path.join(__dirname, "..", "..", "..", "..", "events", "environment"),
        true
      );

      for (const eventFolder of eventFolders) {
        const eventFiles = await getAllFiles(eventFolder);
        eventFiles.sort((a: string, b: string) => a.localeCompare(b));

        const eventName = eventFolder.replace(/\\/g, "/").split("/").pop();

        if (!eventName) {
          log.error("Environment event name is undefined", eventFolder);
          return;
        }

        this.on(eventName as keyof EnvironmentEvents, async (...args) => {
          if (this.parent === null) {
            log.error("Parent is null");
            return;
          }

          for (const eventFile of eventFiles) {
            const filePath = path.resolve(eventFile);
            const fileUrl = url.pathToFileURL(filePath);
            const eventModule: {
              default: EnvironmentEventDeclaration<keyof EnvironmentEvents>;
            } = await import(
              fileUrl.toString() +
                "?t=" +
                Date.now() +
                "&debug=fromPlayerEventHandler"
            );

            const params = new EnvironmentEventParams(
              this.parent,
              aeonix,
              ...args
            );

            await eventModule.default.callback(params).catch((e: unknown) => {
              eventModule.default.onError(e, params);
            });
          }
        });
      }
    } catch (e) {
      log.error("Failed to set up environment event listeners", e);
    }
  }
}
