// get all files in a directory and return an array of their paths

import path from "path"; // Get the path library.
import fs from "fs"; // Get the file system library.

export default (directory: string, foldersOnly = false): string[] => {
  //export the function
  let fileNames = []; // define fileNames as an array

  const files = fs.readdirSync(directory, { withFileTypes: true }); // get all files/folders in directory

  for (const file of files) {
    // loop through all files/folders
    const filePath = path.join(directory, file.name); // get file/folder path

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
