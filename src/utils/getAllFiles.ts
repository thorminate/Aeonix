// get all files in a directory and return an array of their paths

import path from "path"; // Get the path library.
import fs from "fs/promises"; // Get the file system library.

export default async (
  directory: string,
  foldersOnly = false,
  strict = true
): Promise<string[]> => {
  //export the function
  const fileNames = []; // define fileNames as an array

  const files = strict
    ? await fs.readdir(directory, { withFileTypes: true })
    : await fs.readdir(directory, { withFileTypes: true }).catch(() => []); // get all files/folders in directory

  for (const file of files) {
    // loop through all files/folders
    const filePath = path.join(directory, file.name); // get file/folder path

    if (path.extname(filePath) === ".map") continue; // skip files with .map extension
    if (path.extname(filePath) === ".ts") continue; // skip files with .ts extension
    if (path.basename(filePath).startsWith("_")) continue; // exclude files that start with _

    if (foldersOnly) {
      // if foldersOnly is true, only push folders to fileNames
      if (file.isDirectory()) {
        fileNames.push(filePath); // push folders to fileNames
      }
    } else {
      // if foldersOnly is false, push both files and folders to fileNames
      if (file.isFile()) {
        fileNames.push(filePath);
      }
    }
  }

  return fileNames; // return the array of file/folder paths
};
