import path from "node:path";
import fs from "node:fs";
import url from "node:url";
import { inspect } from "node:util";
import readline from "node:readline";
import { cyan, gray, red, redBright, yellow } from "ansis";
import { Aeonix } from "../aeonix.js";
import { actualPrimitives } from "mongoose";

interface Options {
  header: string;
  processName?: string;
  folder?: string;
  payload?: any[] | any;
  type?: "Fatal" | "Error" | "Warn" | "Info" | "Verbose" | "Debug" | "Silly";
}

function stripAnsiCodes(str: string) {
  return str.replace(
    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
    ""
  );
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

  if (!Array.isArray(payload)) {
    payload = [payload];
  }

  const fPayload: string = payload
    .map((p: object | actualPrimitives) => {
      const stringified =
        typeof p === "string"
          ? p
          : inspect(p, { depth: Infinity, colors: true, sorted: true });

      if (!stringified || stringified === "[90mundefined[39m") return "";

      return "\n" + stringified;
    })
    .join(" ");

  const headerColour =
    type === "Fatal"
      ? redBright
      : type === "Error"
      ? red
      : type === "Warn"
      ? yellow
      : cyan;

  const logTime = gray`${date.toLocaleTimeString()}`;
  const logContent = `${headerColour(header)}${fPayload}`;
  const logProcessName = processName ? `${processName}/` : "Main/";
  const logType = type ? `${type}` : "Info";

  const log = `[${logTime}] [${logProcessName}${logType}] ${logContent}`;

  logStream.write(stripAnsiCodes(log) + "\n");

  readline.clearLine(process.stdout, 0);
  readline.cursorTo(process.stdout, 0);

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

  logStream.end();

  import("../aeonix.js").then((module: any) => {
    const aeonix: Aeonix = module.default;
    if (aeonix) aeonix.rl.prompt();
  });
};
