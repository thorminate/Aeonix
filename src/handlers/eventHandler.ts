import path from "path"; // Get the path library.
import getAllFiles from "#utils/getAllFiles.js"; // Get the getAllFiles function.
import url from "url";
import AeonixEvent, { AeonixEventParams } from "#core/aeonixEvent.js";
import Aeonix, { AeonixEvents } from "#root/aeonix.js";

export default async (aeonix: Aeonix) => {
  const log = aeonix.logger.for("EventHandler");
  try {
    const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

    const eventFolders = await getAllFiles(
      path.join(__dirname, "..", "events", "aeonix"),
      true
    );

    for (const eventFolder of eventFolders) {
      const eventFiles = await getAllFiles(eventFolder);
      eventFiles.sort((a: string, b: string) => a.localeCompare(b));

      const eventName = eventFolder.replace(/\\/g, "/").split("/").pop();

      if (!eventName) {
        log.error("Discord event name is undefined", eventFolder);
        return;
      }

      aeonix.on(eventName as keyof AeonixEvents, async (...args) => {
        for (const eventFile of eventFiles) {
          const filePath = path.resolve(eventFile);
          const fileUrl = url.pathToFileURL(filePath);
          const eventModule: {
            default: AeonixEvent<keyof AeonixEvents>;
          } = await import(
            fileUrl.toString() +
              "?t=" +
              Date.now() +
              "&debug=fromDiscordEventHandler"
          );

          const params = new AeonixEventParams(aeonix, ...args);

          await eventModule.default.callback(params).catch((e: unknown) => {
            eventModule.default.onError(e, params);
          });
        }
      });
    }
  } catch (e) {
    log.fatal("Failed to load events", e);
  }
};
