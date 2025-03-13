import path from "node:path";
import fs from "node:fs";

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

  const logPrefix = `${date.toLocaleTimeString()}`;
  const logContent = `${header}\n${payload}`;
  const logProcessName = processName ? `${processName}/` : "Main/";
  const logType = type ? `${type}` : "Info";

  const log = `[${logPrefix}] [${logProcessName}${logType}] ${logContent}`;

  logStream.write(log + "\n");
  switch (type) {
    case "Fatal":
    case "Error":
      console.error(log);
      break;
    case "Warn":
      console.warn(log);
      break;
    case "Info":
      console.info(log);
      break;
    case "Verbose":
      console.log(log);
      break;
    case "Debug":
      console.debug(log);
      break;
    case "Silly":
      console.log(log);
      break;
    default:
      console.log(log);
  }
};
