import path from "node:path";
import fs from "node:fs";
import { inspect } from "node:util";
import readline from "node:readline";
import { gray, cyan, red, redBright, yellow } from "ansis";

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

export function stripLogNoise(
  value: unknown,
  seen = new WeakSet<object>()
): unknown {
  if (typeof value !== "object" || value === null) return value;
  if (seen.has(value)) return "[Circular]";
  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((v) => stripLogNoise(v, seen));
  }

  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value)) {
    if (
      k === "_unknownFields" ||
      k === "excluded" ||
      k === "migrators" ||
      k === "fields" ||
      k === "parent"
    ) {
      continue;
    }

    out[k] = stripLogNoise(v, seen);
  }
  return out;
}

export default class Logger {
  private stream: fs.WriteStream;
  private readonly logDir: string;
  private currentDate: string;
  private rl: readline.Interface;
  private shouldReprompt = true;

  setShouldReprompt(shouldReprompt: boolean) {
    this.shouldReprompt = shouldReprompt;
  }

  constructor(rl: readline.Interface, logDir = path.resolve("./logs")) {
    this.logDir = logDir;

    if (!fs.existsSync(logDir)) {
      console.log(
        `Log dir ${logDir} does not exist, logger instantiation failed!`
      );
    }

    this.rl = rl;
    this.currentDate = this.getDate();
    this.stream = this.openStream();
  }

  /**
   * Creates a logger for a specific processName
   * @param processName The name of the process that logs.
   */
  for(processName: string) {
    return {
      /**
       * Logs informative data to the console.
       * @param header The primary context of the log.
       * @param payload Additional data, such as objects or stack traces.
       */
      info: (header: string, ...payload: unknown[]) => {
        this.info(processName, header, ...payload);
      },

      /**
       * Logs an error to the console.
       * @param header The primary context of the log.
       * @param payload Additional data, such as objects or stack traces.
       */
      error: (header: string, ...payload: unknown[]) => {
        this.error(processName, header, ...payload);
      },

      /**
       * Logs a warning to the console.
       * @param header The primary context of the log.
       * @param payload Additional data, such as objects or stack traces.
       */
      warn: (header: string, ...payload: unknown[]) => {
        this.warn(processName, header, ...payload);
      },

      /**
       * Logs a fatal error to the console.
       * @param header The primary context of the log.
       * @param payload Additional data, such as objects or stack traces.
       */
      fatal: (header: string, ...payload: unknown[]) => {
        this.fatal(processName, header, ...payload);
      },

      /**
       * Logs debugging info to the console.
       * @param header The primary context of the log.
       * @param payload Additional data, such as objects or stack traces.
       */
      debug: (header: string, ...payload: unknown[]) => {
        this.debug(processName, header, ...payload);
      },

      /**
       * Logs something silly to the console.
       * @param header The primary context of the log.
       * @param payload Additional data, such as objects or stack traces.
       */
      silly: (header: string, ...payload: unknown[]) => {
        this.silly(processName, header, ...payload);
      },

      /**
       * Logs something verbosely to the console.
       * @param header The primary context of the log.
       * @param payload Additional data, such as objects or stack traces.
       */
      verbose: (header: string, ...payload: unknown[]) => {
        this.verbose(processName, header, ...payload);
      },

      /**
       * Logs informative data to the console.
       * @param logType The type of log (Fatal, Warn, Info, Silly, etc.)
       * @param header The primary context of the log.
       * @param payload Additional data, such as objects or stack traces.
       */
      log: (logType: LogType, header: string, ...payload: unknown[]) => {
        this.log(logType, processName, header, payload);
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

  /**
   * Logs informative data to the console.
   * @param logType The type of log (Fatal, Warn, Info, Silly, etc.)
   * @param processName The name of the process that logs.
   * @param header The primary context of the log.
   * @param payload Additional data, such as objects or stack traces.
   */
  log(
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

    process.stdout.write(line + "\n");
    if (this.shouldReprompt) this.rl.prompt(true);
  }

  /**
   * Logs informative data to the console.
   * @param processName The name of the process that logs.
   * @param header The primary context of the log.
   * @param payload Additional data, such as objects or stack traces.
   */
  info(processName: string, header: string, ...payload: unknown[]) {
    this.log("Info", processName, header, payload);
  }

  /**
   * Logs an error to the console.
   * @param processName The name of the process that logs.
   * @param header The primary context of the log.
   * @param payload Additional data, such as objects or stack traces.
   */
  error(processName: string, header: string, ...payload: unknown[]) {
    this.log("Error", processName, header, payload);
  }

  /**
   * Logs a warning to the console.
   * @param processName The name of the process that logs.
   * @param header The primary context of the log.
   * @param payload Additional data, such as objects or stack traces.
   */
  warn(processName: string, header: string, ...payload: unknown[]) {
    this.log("Warn", processName, header, payload);
  }

  /**
   * Logs a fatal error to the console.
   * @param processName The name of the process that logs.
   * @param header The primary context of the log.
   * @param payload Additional data, such as objects or stack traces.
   */
  fatal(processName: string, header: string, ...payload: unknown[]) {
    this.log("Fatal", processName, header, payload);
  }

  /**
   * Logs debugging info to the console.
   * @param processName The name of the process that logs.
   * @param header The primary context of the log.
   * @param payload Additional data, such as objects or stack traces.
   */
  debug(processName: string, header: string, ...payload: unknown[]) {
    this.log("Debug", processName, header, payload);
  }

  /**
   * Logs something silly to the console.
   * @param processName The name of the process that logs.
   * @param header The primary context of the log.
   * @param payload Additional data, such as objects or stack traces.
   */
  silly(processName: string, header: string, ...payload: unknown[]) {
    this.log("Silly", processName, header, payload);
  }

  /**
   * Logs something verbosely to the console.
   * @param processName The name of the process that logs.
   * @param header The primary context of the log.
   * @param payload Additional data, such as objects or stack traces.
   */
  verbose(processName: string, header: string, ...payload: unknown[]) {
    this.log("Verbose", processName, header, payload);
  }
}
