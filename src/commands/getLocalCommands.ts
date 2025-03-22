import path from "path"; // Get the path library.
import getAllFiles from "../utils/getAllFiles.js"; // Get the getAllFiles function.
import url from "url";
import Command from "./command.js";

export default async (exceptions = []) => {
  // Export the function.
  let localCommands: Command[] = []; // define local commands as an array

  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

  const commandCategories = getAllFiles(
    // get all command categories and store in an array
    path.join(__dirname, "content"), // get the path to the commands folder
    true // folders only
  );

  for (const commandCategory of commandCategories) {
    // loop through all command categories.
    const commandFiles = getAllFiles(commandCategory); // get all files in the command category
    for (const commandFile of commandFiles) {
      // loop through all files in the command category
      const filePath = path.resolve(commandFile); // get the path to the file
      const fileUrl = url.pathToFileURL(filePath); // get the url to the file
      const commandObject: Command = (await import(fileUrl.toString())).default; // import the file

      if (exceptions.includes(commandObject.data.name)) {
        // if the command name is in the exceptions array
        continue; // skip the command
      }

      localCommands.push(commandObject); // add the command to the local commands array
    }
  }

  return localCommands; // return the array of local commands
};
