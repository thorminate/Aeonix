import path from "path";
import getAllFiles from "./getAllFiles.js";
import url from "url";
import Command from "./command.js";
import log from "./log.js";

export default async (exceptions = []) => {
  let localCommands: Command[] = [];

  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

  const commandFiles = getAllFiles(path.join(__dirname, "..", "commands"));

  for (const commandFile of commandFiles) {
    const filePath = path.resolve(commandFile);
    const fileUrl = url.pathToFileURL(filePath);
    const commandObject: Command = (await import(fileUrl.toString())).default;

    if (exceptions.includes(commandObject.data.name)) {
      continue;
    }

    localCommands.push(commandObject);
  }

  return localCommands;
};
