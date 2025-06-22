#!/usr/bin/env node

import { ActivityType, Client, GatewayIntentBits, Partials } from "discord.js";
import mongoose from "mongoose";
import eventHandler from "./handlers/eventHandler.js";
import log from "./utils/log.js";
import readline from "readline/promises";
import {
  appendFileSync,
  existsSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "fs";
import { config } from "@dotenvx/dotenvx";
import { blue, blueBright, green, magenta, redBright } from "ansis";
import { execSync } from "child_process";
import path from "path";
import environmentModel from "./models/environment/utils/environmentModel.js";
import loadEnvironmentClassById from "./models/environment/utils/loadEnvironmentClassById.js";
import softMerge from "./utils/softMerge.js";

interface PackageJson {
  name: string;
  version: string;
  main: string;
  author: string;
  license: string;
  type: string;
  homepage: string;
  description: string;
  keywords: [];
  scripts: {
    start: string;
  };
  dependencies: {
    "@dotenvx/dotenvx": string;
    ansis: string;
    "discord.js": string;
    mongoose: string;
    typescript: string;
  };
  repository: {
    type: string;
    url: string;
  };
  bugs: {
    url: string;
  };
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  history: ["exit"],
  historySize: 10,
  prompt: `${magenta("Aeonix")} ${green(">>")} `,
});

// Make sure the .env file exists
if (!existsSync("./.env")) {
  // If the .env file doesn't exist, we create it.

  log({
    header: ".env file not found, starting setup wizard",
    processName: "AeonixSetupWizard",
    type: "Warn",
  });

  const token = await rl.question("Enter your token: ");
  writeFileSync("./.env", `TOKEN="${token}"`);

  const mongodbUri = await rl.question("Enter your MongoDB URI: ");
  appendFileSync("./.env", `\nMONGODB_URI="${mongodbUri}"`);

  const playerRoleId = await rl.question("What ID does the player role have? ");
  appendFileSync("./.env", `\nPLAYER_ROLE="${playerRoleId}"`);

  const onboardingChannelId = await rl.question(
    "What ID does the onboarding channel have? "
  );
  appendFileSync("./.env", `\nONBOARDING_CHANNEL="${onboardingChannelId}"`);

  const rulesChannelId = await rl.question(
    "What ID does the rules channel have? "
  );
  appendFileSync("./.env", `\nRULES_CHANNEL="${rulesChannelId}"`);

  log({
    header: "Created .env file",
    processName: "AeonixSetupWizard",
    type: "Info",
  });
}

// Load environment variables
const __dotenvx = config({
  quiet: true,
});

log({
  header: `Injecting env (${
    Object.keys(__dotenvx.parsed ?? {}).length
  }) from .env`,
  processName: "Dotenvx",
  type: "Info",
});

class EnvironmentManager {
  async get(location: string) {
    let [classInstance, dbData] = await Promise.all([
      loadEnvironmentClassById(location),
      environmentModel.findById(location).lean().exec(),
    ]);

    if (!classInstance) return;

    await classInstance.init();

    if (!dbData) {
      await classInstance.save();
      return classInstance;
    }

    return softMerge(classInstance, dbData, classInstance.getFullClassMap());
  }
  async getAll() {
    const allDocs = await environmentModel.find().lean().exec();

    return Promise.all(
      allDocs.map(async (doc) => {
        await this.get((doc._id as string) || "");
      })
    );
  }
}

export class Aeonix extends Client {
  rl = rl;
  environments = new EnvironmentManager();

  packageJson: PackageJson = JSON.parse(
    readFileSync("./package.json").toString()
  );

  private _currentTime = 1;

  playerRoleId: string = process.env.PLAYER_ROLE || "";
  guildId: string = process.env.GUILD_ID || "";
  onboardingChannelId: string = process.env.ONBOARDING_CHANNEL || "";
  rulesChannelId: string = process.env.RULES_CHANNEL || "";
  masterRoleId: string = process.env.MASTER_ROLE || "";

  verbs = [
    "Learning about",
    "Exploring",
    "Playing with",
    "Reading about",
    "Watching tutorials on",
    "Studying",
    "Discovering",
    "Researching",
    "Delving into",
    "Examining",
    "Investigating",
  ];

  nouns = [
    "advanced mathematics",
    "electromagnetism",
    "elementary chemistry",
    "different species",
    "differential equations",
    "modern computer programs",
    "programming in typescript",
    "classical art",
    "EDM music",
    "dancing",
    "singing great hits",
    "poetry",
    "novels",
    "paintings in the style of Van Gogh",
    "drawings a beautiful landscape",
    "popular sculptures",
    "taking stunning shots",
    "video editing",
    "game development",
    "web development",
    "app development",
    "data analysis",
    "data visualization",
    "data science",
    "data mining",
    "philosophical concepts",
    "psychology",
    "conscience",
    "neuralese",
    "board games",
    "calligraphy",
    "new languages",
    "blockchain",
    "cryptography",
    "encryption techniques",
    "decryption techniques",
    "encryption algorithms",
    "decryption algorithms",
    "virtual reality",
    "augmented reality",
    "modern robotics",
    "artificial intelligence",
    "hackathons",
    "celestial phenomena",
    "economic models",
    "archiving",
    "physical forces",
    "quantum physics",
    "quantum computing",
    "historical events",
    "abandoned codebases",
    "martial arts",
    "renewable energy solutions",
    "digital security",
    "quantum mechanics",
    "quantum entanglement",
    "nuclear physics",
    "particle physics",
    "genetic engineering",
    "climate change",
    "environmental science",
    "marine biology",
    "cosmology",
    "theoretical physics",
    "string theory",
    "biotechnology",
    "nanotechnology",
    "cybersecurity",
    "ethical hacking",
    "space exploration",
    "astrophysics",
    "biomechanics",
    "neuroscience",
    "behavioral science",
    "social dynamics",
    "cultural anthropology",
    "historical analysis",
    "geopolitical strategies",
    "sustainable development",
    "urban planning",
    "wildlife conservation",
    "oceanography",
    "meteorology",
    "robotics engineering",
    "autonomous vehicles",
    "machine learning",
    "deep learning",
    "natural language processing",
    "computer vision",
    "augmented reality",
    "virtual reality",
    "3D modeling",
    "digital art",
    "geographic information systems",
    "remote sensing",
    "cartography",
    "spatial analysis",
  ];

  get currentTime() {
    const now = this._currentTime;

    if (now <= 0 || now > 24) {
      log({
        header: "Invalid current time, resetting to 1",
        processName: "Aeonix.currentTime",
        type: "Error",
        payload: { currentTime: now },
      });
      this._currentTime = 1; // Reset to 1 if the time is invalid
      return 1; // Default to 1 if the time is invalid
    }

    return now;
  }

  tick() {
    this._currentTime += 1;
    if (this._currentTime > 24) {
      this._currentTime = 1; // Reset to 1 if the time exceeds 24
    }

    this.emit("tick");
  }

  async exit(code: number = 0) {
    log({
      header: "Shutting down",
      processName: "Process",
      type: "Warn",
      doNotPrompt: true,
    });
    try {
      if (this.user) {
        this.user.setPresence({ status: "invisible" });
      }
      await this.destroy();
      process.exit(code); // Exit with the provided code
    } catch (e) {
      log({
        header: "Error while shutting down",
        processName: "Process",
        payload: e,
        type: "Error",
      });
      process.exit(1); // Exit with error code
    }
  }

  async statusRefresh() {
    if (!Array.isArray(this.verbs) || !Array.isArray(this.nouns)) {
      log({
        header: "Verbs or nouns are not arrays",
        processName: "Aeonix.statusRefresh",
        type: "Error",
        payload: { verbs: this.verbs, nouns: this.nouns },
      });
      return;
    }

    const randomChoice =
      this.verbs[Math.floor(Math.random() * (this.verbs?.length ?? 0))] +
      " " +
      this.nouns[Math.floor(Math.random() * (this.nouns?.length ?? 0))];
    if (this.user) {
      this.user.setPresence({
        status: "online",
        activities: [
          {
            name: "Aeonix",
            type: ActivityType.Custom,
            state: randomChoice,
          },
        ],
      });
    }
  }

  constructor() {
    log({
      header: "Initializing Aeonix...",
      processName: "AeonixConstructor",
      type: "Info",
    });

    super({
      presence: {
        status: "online",
        afk: false,
      },
      intents: [
        // This is every possible intent :)
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildExpressions,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.GuildScheduledEvents,
        GatewayIntentBits.AutoModerationConfiguration,
        GatewayIntentBits.AutoModerationExecution,
        GatewayIntentBits.GuildMessagePolls,
        GatewayIntentBits.DirectMessagePolls,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences,
      ],
      partials: [
        Partials.Channel,
        Partials.GuildMember,
        Partials.GuildScheduledEvent,
        Partials.Message,
        Partials.Reaction,
        Partials.User,
        Partials.ThreadMember,
      ],
    });

    this.rl.on("line", async (input: string) => {
      const inputArr: string[] = input.split(" ");
      const firstOptionIndex: number = inputArr.findIndex((arg) =>
        arg.includes("--")
      );

      // When a line is typed.
      switch (inputArr[0]?.toLowerCase().trim()) {
        case "help": {
          log({
            header: "Help Command",
            processName: "CLI",
            payload: [
              "'exit' to quit and turn off Aeonix",
              "'help' for help",
              "'log <header> [options]' options are --payload and --folder",
              "'clear' to clear the console",
              "'tsc' to recompile the bot's typescript files",
              "'info' to get information about the bot",
            ],
            type: "Info",
          });
          break;
        }

        case "clear": {
          log({
            header: "Clearing console",
            processName: "CLI",
            type: "Info",
          });
          process.stdout.write("\x1B[2J\x1B[0f");
          console.clear();
          break;
        }

        case "exit": {
          // Exit aeonix.
          await this.exit();
          break;
        }

        case "log": {
          // Log the inputs
          if (firstOptionIndex === -1) {
            log({
              header: inputArr.slice(1).join(" "),
              processName: "CLI",
              type: "Info",
            });
            return;
          }
          const header: string = inputArr.slice(1, firstOptionIndex).join(" ");

          const options: string[] = inputArr.slice(firstOptionIndex);
          let payload: string = "";
          let processName: string = "";
          let type:
            | "Info"
            | "Warn"
            | "Error"
            | "Fatal"
            | "Verbose"
            | "Debug"
            | "Silly" = "Info";
          for (let i = 0; i < options.length; i++) {
            if (options[i] === "--payload") {
              for (
                let j = i + 1;
                j < options.length &&
                options[j] != "--processName" &&
                options[j] != "--type";
                j++
              ) {
                payload += options[j];
              }
            } else if (options[i] === "--processName") {
              for (
                let j = i + 1;
                j < options.length &&
                options[j] != "--payload" &&
                options[j] != "--type";
                j++
              ) {
                processName += options[j];
              }
            } else if (options[i] === "--type") {
              if (
                options[i + 1] !== "Fatal" &&
                options[i + 1] !== "Error" &&
                options[i + 1] !== "Warn" &&
                options[i + 1] !== "Info" &&
                options[i + 1] !== "Verbose" &&
                options[i + 1] !== "Debug" &&
                options[i + 1] !== "Silly"
              ) {
                log({
                  header: "Invalid type: " + options[i + 1],
                  processName: "CLI",
                  type: "Warn",
                });
                return;
              }
              type = options[i + 1] as
                | "Info"
                | "Warn"
                | "Error"
                | "Fatal"
                | "Verbose"
                | "Debug"
                | "Silly";
            }
          }
          log({
            header,
            payload,
            processName,
            type,
          });
          break;
        }

        case "tsc": {
          log({
            header: "Recompiling",
            processName: "CLI",
            type: "Info",
          });

          rmSync("./dist", { recursive: true, force: true });
          try {
            execSync("tsc", { stdio: "inherit" });
          } catch (e) {
            log({
              header: "Recompilation failed",
              processName: "CLI",
              payload: e,
              type: "Error",
            });
          }
          break;
        }

        case "info": {
          const deps = this.packageJson.dependencies;
          log({
            header: "Info",
            processName: "CLI",
            payload: [
              blue`Version: ` + blueBright(this.packageJson.version),
              blue`Git hash: ` +
                blueBright(
                  execSync("git rev-parse --short HEAD").toString().trim()
                ),
              blue`Installed at: ` +
                blueBright(path.join(import.meta.url, "..").slice(8)),
              " ",
              redBright`Dependencies:`,
              "  Node.js: " + process.version,
              `  Discord.js: ${deps["discord.js"].replace("^", "v")}`,
              `  Mongoose: ${deps.mongoose.replace("^", "v")}`,
              `  Dotenvx: ${deps["@dotenvx/dotenvx"].replace("^", "v")}`,
              `  Ansis: ` + deps.ansis.replace("^", "v"),
              `  TypeScript: ${deps.typescript.replace("^", "v")}`,
              " ",
            ],
            type: "Info",
          });
          break;
        }

        default: {
          // Invalid command handling.
          log({
            header: "Invalid command: " + input,
            processName: "CLI",
            payload: ["'exit' to quit and turn off Aeonix, or 'help' for help"],
            type: "Warn",
          });
          break;
        }
      }

      this.rl.prompt();
    });
    this.rl.prompt();

    const mdbToken = process.env.MONGODB_URI;
    const dscToken = process.env.DISCORD_TOKEN;

    (async () => {
      try {
        if (!dscToken || !mdbToken) {
          log({
            header: "Missing token(s)",
            processName: "AeonixConstructor",
            type: "Fatal",
          });
          return;
        }

        await mongoose.connect(mdbToken).then(() => {
          log({
            header: "Linked to DB",
            processName: "NetworkingHandler",
            type: "Info",
          });

          process.on("SIGINT", () => {
            mongoose.connection.close();
          });
        });

        eventHandler(this);

        log({
          header: "Event handler ready to rumble!",
          processName: "EventHandler",
          type: "Info",
        });

        await this.login(dscToken).then(() => {
          log({
            header: "Connected to Discord",
            processName: "NetworkingHandler",
            type: "Info",
          });
        });
        await this.statusRefresh();
      } catch (e) {
        log({
          header: "Error whilst creating Aeonix object",
          processName: "ErrorSuppressant",
          payload: e,
          type: "Fatal",
        });
      }
    })();

    setInterval(() => {
      this.statusRefresh();
      this.tick();
    }, 60 * 1000);
  }
}

// Export the Aeonix object
export default new Aeonix();
