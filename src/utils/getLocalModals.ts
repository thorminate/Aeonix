import Modal from "./modal.js";
import path from "path";
import getAllFiles from "./getAllFiles.js";
import url from "url";

export default async (exceptions: string[] = []) => {
  let localModals: Modal[] = [];

  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

  const modalFiles = getAllFiles(path.join(__dirname, "..", "modals"));
  for (const modalFile of modalFiles) {
    const filePath = path.resolve(modalFile);
    const fileUrl = url.pathToFileURL(filePath);
    const modalObject: Modal = (await import(fileUrl.toString())).default;

    if (exceptions.includes(modalObject.customId)) {
      continue;
    }

    localModals.push(modalObject);
  }

  return localModals;
};
