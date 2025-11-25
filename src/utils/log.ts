import path from "node:path";
import fs from "node:fs";
import { inspect } from "node:util";
import readline from "node:readline";
import { gray, cyan, red, redBright, yellow } from "ansis";
import Aeonix from "../aeonix.js";

export type LogType =
  | "Fatal"
  | "Error"
  | "Warn"
  | "Info"
  | "Verbose"
  | "Debug"
  | "Silly";

function stripAnsiCodes(str: string) {
  return str.replace(
    // eslint-disable-next-line no-control-regex
    /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g,
    ""
  );
}

export default class Logger {
  private stream: fs.WriteStream;
  private logDir: string;
  private currentDate: string;

  constructor(logDir = path.resolve("./logs")) {
    this.logDir = logDir;

    if (!fs.existsSync(logDir)) {
      console.log(
        `Log dir ${logDir} does not exist, logger instantiation failed!`
      );
    }

    this.currentDate = this.getDate();
    this.stream = this.openStream();
  }

  for(processName: string) {
    return {
      info: (header: string, ...payload: unknown[]) => {
        this.write("Info", processName, header, payload);
      },
      warn: (header: string, ...payload: unknown[]) => {
        this.write("Warn", processName, header, payload);
      },
      error: (header: string, ...payload: unknown[]) => {
        this.write("Error", processName, header, payload);
      },
      fatal: (header: string, ...payload: unknown[]) => {
        this.write("Fatal", processName, header, payload);
      },
      debug: (header: string, ...payload: unknown[]) => {
        this.write("Debug", processName, header, payload);
      },
      silly: (header: string, ...payload: unknown[]) => {
        this.write("Silly", processName, header, payload);
      },
      verbose: (header: string, ...payload: unknown[]) => {
        this.write("Verbose", processName, header, payload);
      },
      log: (logType: LogType, header: string, ...payload: unknown[]) => {
        this.write(logType, processName, header, payload);
      },
    };
  }

  private getDate() {
    const date = new Date();
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return date.toISOString().slice(0, 10);
  }

  private openStream() {
    const file = path.join(this.logDir, `${this.currentDate}.log`);
    return fs.createWriteStream(file, { flags: "a" });
  }

  private ensureLogStream() {
    const today = this.getDate();
    if (today !== this.currentDate) {
      this.stream.end();
      this.currentDate = today;
      this.stream = this.openStream();
    }
  }

  private async reprompt() {
    const { default: aeonix }: { default: Aeonix } = await import(
      "../index.js"
    );
    if (aeonix) aeonix.rl.prompt();
  }

  private color(type: LogType) {
    switch (type) {
      case "Fatal":
        return redBright;
      case "Error":
        return red;
      case "Warn":
        return yellow;
      default:
        return cyan;
    }
  }

  private write(
    type: LogType,
    processName: string,
    header: string,
    payload?: unknown,
    depth = 5
  ) {
    this.ensureLogStream();

    const now = new Date().toLocaleString("sv");
    const ts = gray(`[${now}]`);
    const proc = processName ? `${processName}/` : "Main/";
    const lvl = `${proc}${type}`;
    const color = this.color(type);

    if (!Array.isArray(payload)) {
      payload = [payload];
    }

    const formattedPayload = (payload as unknown[])
      .map((p: unknown) => {
        const stringified =
          typeof p === "string"
            ? p
            : inspect(p, { depth, colors: true, sorted: true });

        if (!stringified || stringified === "[90mundefined[39m") return "";

        return "\n" + stringified;
      })
      .join(" ");

    const line = `${ts} [${lvl}] ${color(header)}${formattedPayload}`;

    this.stream.write(stripAnsiCodes(line) + "\n");

    readline.clearLine(process.stdout, 0);
    readline.cursorTo(process.stdout, 0);

    if (type === "Fatal" || type === "Error" || type === "Warn") {
      console.error(line);
    } else {
      console.log(line);
    }

    this.reprompt();
  }

  info(processName: string, header: string, ...payload: unknown[]) {
    this.write("Info", processName, header, payload);
  }

  error(processName: string, header: string, ...payload: unknown[]) {
    this.write("Error", processName, header, payload);
  }

  warn(processName: string, header: string, ...payload: unknown[]) {
    this.write("Warn", processName, header, payload);
  }

  fatal(processName: string, header: string, ...payload: unknown[]) {
    this.write("Fatal", processName, header, payload);
  }

  debug(processName: string, header: string, ...payload: unknown[]) {
    this.write("Debug", processName, header, payload);
  }

  silly(processName: string, header: string, ...payload: unknown[]) {
    this.write("Silly", processName, header, payload);
  }

  verbose(processName: string, header: string, ...payload: unknown[]) {
    this.write("Verbose", processName, header, payload);
  }

  log(
    logType: LogType,
    processName: string,
    header: string,
    payload?: unknown
  ) {
    this.write(logType, processName, header, payload);
  }
}
