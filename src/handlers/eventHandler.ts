import path from "path"; // Get the path library.
import getAllFiles from "../utils/getAllFiles.js"; // Get the getAllFiles function.
import url from "url";
import log from "../utils/log.js";
import DiscordEvent, { DiscordEventParams } from "../models/core/event.js";
import Aeonix, { AeonixEvents } from "../aeonix.js";

export default async (aeonix: Aeonix) => {
  try {
    const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

    const eventFolders = await getAllFiles(
      path.join(__dirname, "..", "events", "discord"),
      true
    );

    for (const eventFolder of eventFolders) {
      const eventFiles = await getAllFiles(eventFolder);
      eventFiles.sort((a: string, b: string) => a.localeCompare(b));

      const eventName = eventFolder.replace(/\\/g, "/").split("/").pop();

      if (!eventName) {
        log({
          header: "Discord event name is undefined",
          processName: "EventHandler",
          type: "Error",
          payload: [eventName, eventFolder],
        });
        return;
      }

      aeonix.on(eventName as keyof AeonixEvents, async (...args) => {
        for (const eventFile of eventFiles) {
          const filePath = path.resolve(eventFile);
          const fileUrl = url.pathToFileURL(filePath);
          const eventModule: {
            default: DiscordEvent<keyof AeonixEvents>;
          } = await import(fileUrl.toString());

          const params = new DiscordEventParams(aeonix, ...args);

          await eventModule.default.callback(params).catch((e: unknown) => {
            eventModule.default.onError(e, params);
          });
        }
      });
    }
  } catch (e) {
    log({
      header: "Fatal Error in event handler",
      processName: "EventHandler",
      type: "Fatal",
      payload: e,
    });
  }
};
