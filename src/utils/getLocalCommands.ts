import path from "path"; // Get the path library.
import getAllFiles from "../utils/getAllFiles"; // Get the getAllFiles function.
import url from "url";

export default async (exceptions = []) => {
  // Export the function.
  let localCommands = []; // define local commands as an array

  const commandCategories = getAllFiles(
    // get all command categories and store in an array
    path.join(__dirname, "..", "commands"), // get the path to the commands folder
    true // folders only
  );

  for (const commandCategory of commandCategories) {
    // loop through all command categories.
    const commandFiles = getAllFiles(commandCategory); // get all files in the command category
    for (const commandFile of commandFiles) {
      // loop through all files in the command category
      const filePath = path.resolve(commandFile); // get the path to the file
      const fileUrl = url.pathToFileURL(filePath); // get the url to the file
      const commandObject = (await import(fileUrl.toString())).default.default; // import the file

      if (exceptions.includes(commandObject.name)) {
        // if the command name is in the exceptions array
        continue; // skip the command
      }

      localCommands.push(commandObject); // add the command to the local commands array
    }
  }

  return localCommands; // return the array of local commands
};
