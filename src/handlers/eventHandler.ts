import path from "path"; // Get the path library.
import getAllFiles from "../utils/getAllFiles.js"; // Get the getAllFiles function.
import url from "url";
import log from "../utils/log.js";
import Event, { EventParams } from "../models/core/event.js";
import Aeonix from "../aeonix.js";

export default async (aeonix: Aeonix) => {
  try {
    const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

    const eventFolders = await getAllFiles(
      path.join(__dirname, "..", "events"),
      true
    );

    for (const eventFolder of eventFolders) {
      const eventFiles = await getAllFiles(eventFolder);
      eventFiles.sort((a: string, b: string) => a.localeCompare(b));

      const eventName = eventFolder.replace(/\\/g, "/").split("/").pop();

      if (!eventName) {
        log({
          header: "Event name is undefined",
          processName: "EventHandler",
          type: "Error",
          payload: [eventName, eventFolder],
        });
        return;
      }

      aeonix.on(eventName, async (arg) => {
        for (const eventFile of eventFiles) {
          const filePath = path.resolve(eventFile);
          const fileUrl = url.pathToFileURL(filePath);
          const eventModule: { default: Event<unknown> } = await import(
            fileUrl.toString()
          );

          await eventModule.default
            .callback(new EventParams(aeonix, arg))
            .catch((e: unknown) => {
              eventModule.default.onError(e).catch((e: unknown) =>
                log({
                  header: `Error in event ${eventName}`,
                  processName: "EventHandler",
                  type: "Error",
                  payload: e,
                })
              );
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
