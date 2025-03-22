import Button from "./button.js";
import path from "path"; // Get the path library.
import getAllFiles from "../utils/getAllFiles.js"; // Get the getAllFiles function.
import url from "url";

export default async (exceptions: string[] = []) => {
  // Export the function.
  let localButtons: Button[] = []; // define local commands as an array

  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

  // loop through all command categories.
  const buttonFiles = getAllFiles(path.join(__dirname, "content")); // get all files in the command category
  for (const buttonFile of buttonFiles) {
    // loop through all files in the command category
    const filePath = path.resolve(buttonFile); // get the path to the file
    const fileUrl = url.pathToFileURL(filePath); // get the url to the file
    const commandObject: Button = (await import(fileUrl.toString())).default; // import the file

    if (exceptions.includes(commandObject.customId)) {
      // if the command name is in the exceptions array
      continue; // skip the command
    }

    localButtons.push(commandObject); // add the command to the local commands array
  }

  return localButtons; // return the array of local commands
};
