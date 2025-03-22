import Button from "./button.js";
import path from "path";
import getAllFiles from "../utils/getAllFiles.js";
import url from "url";

export default async (exceptions: string[] = []) => {
  let localButtons: Button[] = [];
  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

  const buttonFiles = getAllFiles(path.join(__dirname, "content"));
  for (const buttonFile of buttonFiles) {
    const filePath = path.resolve(buttonFile);
    const fileUrl = url.pathToFileURL(filePath);
    const buttonObject: Button = (await import(fileUrl.toString())).default;

    if (exceptions.includes(buttonObject.customId)) {
      continue;
    }

    localButtons.push(buttonObject);
  }

  return localButtons;
};
