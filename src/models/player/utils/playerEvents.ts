import { EventEmitter } from "events";
import Quest from "#player/utils/quests/quest.js";
import path from "path";
import url from "url";
import getAllFiles from "#utils/getAllFiles.js";
import Player from "#player/player.js";
import PlayerEventDeclaration, {
  PlayerEventParams,
} from "#core/playerEvent.js";
import Environment from "#environment/environment.js";
import Item from "#item/item.js";
import aeonix from "#root/index.js";

export interface PlayerEvents {
  tick: [
    currentTime: number,
    currentDay: number,
    currentMonth: number,
    currentYear: number
  ];
  questAdded: [quest: Quest];
  questFulfilled: [quest: Quest];
  questFailed: [quest: Quest];
  questRemoved: [quest: Quest];
  inventoryItemAdded: [item: Item];
  inventoryItemRemoved: [item: Item];
  inventoryItemUsed: [item: Item];
  inventoryItemDropped: [item: Item];
  arrivedAtLocation: [env: Environment];
}

export type PlayerEvent = keyof PlayerEvents;

export type PlayerEventUnion<
  T extends { [K in keyof T]: unknown[] },
  Discriminant extends string = "type",
  PayloadProp extends string = "args"
> = {
  [K in keyof T]: { [P in Discriminant]: K } & { [P in PayloadProp]: T[K] } & {
    player: Player;
  };
}[keyof T];

export type AnyPlayerEvent = PlayerEventUnion<PlayerEvents>;

export default class PlayerEventsManager extends EventEmitter {
  parent: Player;

  override emit<Event extends keyof PlayerEvents>(
    eventName: Event,
    ...args: PlayerEvents[Event]
  ): boolean;
  override emit(eventName: string, ...args: unknown[]): boolean {
    return super.emit(eventName, ...args);
  }

  override on<Event extends keyof PlayerEvents>(
    event: Event,
    listener: (...args: PlayerEvents[Event]) => void
  ): this;
  override on(event: string, listener: (...args: unknown[]) => void): this {
    super.on(event, listener);
    return this;
  }

  override once<Event extends keyof PlayerEvents>(
    event: Event,
    listener: (...args: PlayerEvents[Event]) => void
  ): this;
  override once(event: string, listener: (...args: unknown[]) => void): this {
    super.once(event, listener);
    return this;
  }

  override off<Event extends keyof PlayerEvents>(
    event: Event,
    listener: (...args: PlayerEvents[Event]) => void
  ): this;
  override off(event: string, listener: (...args: unknown[]) => void): this {
    super.off(event, listener);
    return this;
  }

  override removeAllListeners<Event extends keyof PlayerEvents>(
    event?: Event
  ): this;
  override removeAllListeners(event?: string): this {
    super.removeAllListeners(event);
    return this;
  }

  override addListener<Event extends keyof PlayerEvents>(
    event: Event,
    listener: (...args: PlayerEvents[Event]) => void
  ): this;
  override addListener(
    event: string,
    listener: (...args: unknown[]) => void
  ): this {
    super.addListener(event, listener);
    return this;
  }

  override prependListener<Event extends keyof PlayerEvents>(
    event: Event,
    listener: (...args: PlayerEvents[Event]) => void
  ): this;
  override prependListener(
    event: string,
    listener: (...args: unknown[]) => void
  ): this {
    super.prependListener(event, listener);
    return this;
  }

  override prependOnceListener<Event extends keyof PlayerEvents>(
    event: Event,
    listener: (...args: PlayerEvents[Event]) => void
  ): this;
  override prependOnceListener(
    event: string,
    listener: (...args: unknown[]) => void
  ): this {
    super.prependOnceListener(event, listener);
    return this;
  }

  override listeners<Event extends keyof PlayerEvents>(
    event: Event
  ): Array<(...args: unknown[]) => void>;
  override listeners(event: string): Array<(...args: unknown[]) => void> {
    return super.listeners(event) as Array<(...args: unknown[]) => void>;
  }

  override rawListeners<Event extends keyof PlayerEvents>(
    event: Event
  ): Array<(...args: unknown[]) => void>;
  override rawListeners(event: string): Array<(...args: unknown[]) => void> {
    return super.rawListeners(event) as Array<(...args: unknown[]) => void>;
  }

  override listenerCount<Event extends keyof PlayerEvents>(
    event: Event
  ): number;
  override listenerCount(event: string): number {
    return super.listenerCount(event);
  }

  override eventNames(): Array<keyof PlayerEvents> {
    return super.eventNames() as Array<keyof PlayerEvents>;
  }

  constructor(player: Player) {
    super();
    this.parent = player;
    this.setUpListeners();
  }

  call<T extends keyof PlayerEvents>(e: T, ...args: PlayerEvents[T]): boolean;
  call(e: string, ...args: unknown[]): boolean {
    return super.emit(e, ...args);
  }

  private async setUpListeners() {
    try {
      const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

      const eventFolders = await getAllFiles(
        path.join(__dirname, "..", "..", "..", "events", "player"),
        true
      );

      for (const eventFolder of eventFolders) {
        const eventFiles = await getAllFiles(eventFolder);
        eventFiles.sort((a: string, b: string) => a.localeCompare(b));

        const eventName = eventFolder.replace(/\\/g, "/").split("/").pop();

        if (!eventName) {
          aeonix.logger.error(
            "PlayerEventsManager",
            "Event name is undefined",
            eventFolder
          );
          return;
        }

        this.on(eventName as keyof PlayerEvents, async (...args) => {
          for (const eventFile of eventFiles) {
            const filePath = path.resolve(eventFile);
            const fileUrl = url.pathToFileURL(filePath);
            const eventModule: {
              default: PlayerEventDeclaration<keyof PlayerEvents>;
            } = await import(
              fileUrl.toString() +
                "?t=" +
                Date.now() +
                "&debug=fromPlayerEventHandler"
            );

            const params = new PlayerEventParams(this.parent, aeonix, ...args);

            await eventModule.default.callback(params).catch((e: unknown) => {
              eventModule.default.onError(e, params);
            });
          }
        });
      }
    } catch (e) {
      aeonix.logger.error("PlayerEventsManager", "Failed to load events", e);
    }
  }
}
