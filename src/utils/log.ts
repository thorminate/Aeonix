import path from "node:path";
import fs from "node:fs";
import url from "node:url";

interface Options {
  header: string;
  processName?: string;
  folder?: string;
  payload?: any;
  type?: "Fatal" | "Error" | "Warn" | "Info" | "Verbose" | "Debug" | "Silly";
}

export default (options: Options) => {
  let { folder, payload, header, type, processName } = options;

  if (!header) return;

  const date = new Date();

  const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

  if (!fs.existsSync(path.join(__dirname, "..", "..", "logs"))) {
    fs.mkdirSync(path.join(__dirname, "..", "..", "logs"), {
      recursive: true,
    });
  }
  if (!folder) {
    folder = path.join(__dirname, "..", "..", "logs");
  }
  const logStream = fs.createWriteStream(
    path.join(folder, `${date.toISOString().slice(0, 10)}.log`),
    { flags: "a" }
  );

  payload = payload ? "\n" + JSON.stringify(payload) : "";
  const logPrefix = `${date.toLocaleTimeString()}`;
  const logContent = `${header}${payload}`;
  const logProcessName = processName ? `${processName}/` : "Main/";
  const logType = type ? `${type}` : "Info";

  const log = `[${logPrefix}] [${logProcessName}${logType}] ${logContent}`;

  logStream.write(log + "\n");

  switch (type) {
    case "Fatal":
    case "Error":
    case "Warn":
      console.error(log);
      break;

    case "Verbose":
    case "Silly":
    case "Debug":
    case "Info":
    default:
      console.log(log);
      break;
  }
};
