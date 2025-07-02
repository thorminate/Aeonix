import {
  ActivityType,
  Client,
  GatewayIntentBits,
  Partials,
  Collection,
} from "discord.js";
import readline from "readline/promises";
import log from "./utils/log.js";
import mongoose from "mongoose";
import { readFileSync } from "fs";
import path from "path";
import url from "url";
import eventHandler from "./handlers/eventHandler.js";
import Environment from "./models/environment/environment.js";
import Item from "./models/item/item.js";
import Letter from "./models/player/utils/inbox/letter.js";
import Quest from "./models/player/utils/quests/quest.js";
import StatusEffect from "./models/player/utils/statusEffect/statusEffect.js";
import getAllFiles from "./utils/getAllFiles.js";
import environmentModel from "./models/environment/utils/environmentModel.js";
import softMerge from "./utils/softMerge.js";
import cliHandler from "./handlers/cliHandler.js";

async function loadContent(folderName: string): Promise<any[]> {
  const contentPath = `./dist/content/${folderName}/`;

  const result = [];

  const allFiles = await getAllFiles(contentPath);

  for (const file of allFiles) {
    const filePath = path.resolve(file);
    const fileUrl = url.pathToFileURL(filePath);
    const content = (await import(fileUrl.toString())).default;

    result.push(new content());
  }

  return result;
}

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

export default class Aeonix extends Client {
  rl: readline.Interface;
  environments = new Collection<string, Environment>();
  items = new Collection<string, Item>();
  letters = new Collection<string, Letter>();
  quests = new Collection<string, Quest>();
  statusEffects = new Collection<string, StatusEffect>();

  packageJson: PackageJson = JSON.parse(
    readFileSync("./package.json").toString()
  );

  db: typeof mongoose = mongoose;

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

  constructor(rl: readline.Interface) {
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

    this.rl = rl;

    cliHandler(this);

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

        this.db = await mongoose.connect(mdbToken);

        log({
          header: "Linked to DB",
          processName: "NetworkingHandler",
          type: "Info",
        });

        process.on("SIGINT", () => {
          mongoose.connection.close();
        });

        eventHandler(this);

        log({
          header: "Event handler ready to rumble!",
          processName: "EventHandler",
          type: "Info",
        });

        await this.login(dscToken);

        log({
          header: "Connected to Discord",
          processName: "NetworkingHandler",
          type: "Info",
        });

        await this.statusRefresh();

        this.environments = new Collection<string, Environment>(
          await Promise.all(
            (
              await loadContent("environments")
            ).map(async (e: Environment) => {
              await e.init();

              const doc = environmentModel.findOne({ type: e.type }).exec();

              if (!doc) {
                await e.commit();
                return [e.type, e] as [string, Environment];
              }

              const env = softMerge(e, doc);

              return [e.type, env] as [string, Environment];
            })
          )
        );

        this.items = new Collection<string, Item>(
          (await loadContent("items")).map((i) => [i.type, i])
        );

        this.letters = new Collection<string, Letter>(
          (await loadContent("letters")).map((i) => [i.type, i])
        );

        this.quests = new Collection<string, Quest>(
          (await loadContent("quests")).map((q: Quest) => [q.type, q])
        );

        this.statusEffects = new Collection<string, StatusEffect>(
          (await loadContent("statusEffects")).map((s: StatusEffect) => [
            s.type,
            s,
          ])
        );
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
