import {
  ActivityType,
  Client,
  ClientEvents,
  GatewayIntentBits,
  Partials,
} from "discord.js";
import readline from "readline/promises";
import log from "./utils/log.js";
import mongoose from "mongoose";
import { readFileSync } from "fs";
import eventManager from "./handlers/eventHandlers.js";
import cliManager from "./handlers/cliHandlers.js";
import Player from "./models/player/player.js";
import ButtonManager from "./managers/buttonManager.js";
import CommandManager from "./managers/commandManager.js";
import ChannelSelectMenuManager from "./managers/channelSelectMenuManager.js";
import EnvironmentManager from "./managers/environmentManager.js";
import ItemManager from "./managers/itemManager.js";
import LetterManager from "./managers/letterManager.js";
import MentionableSelectMenuManager from "./managers/mentionableSelectMenuManager.js";
import ModalManager from "./managers/modalManager.js";
import RoleSelectMenuManager from "./managers/roleSelectMenuManager.js";
import StatusEffectManager from "./managers/statusEffectManager.js";
import StringSelectMenuManager from "./managers/stringSelectMenuManager.js";
import UserSelectMenuManager from "./managers/userSelectMenuManager.js";

export type AeonixEvents = ClientEvents & {
  tick: [currentTime: number];
};

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
  db: typeof mongoose = mongoose;

  private _currentTime = 1;

  playerRoleId: string = process.env.PLAYER_ROLE || "";
  guildId: string = process.env.GUILD_ID || "";
  onboardingChannelId: string = process.env.ONBOARDING_CHANNEL || "";
  rulesChannelId: string = process.env.RULES_CHANNEL || "";
  masterRoleId: string = process.env.MASTER_ROLE || "";
  packageJson: PackageJson = JSON.parse(
    readFileSync("./package.json").toString()
  );

  players: typeof Player = Player;
  buttons = new ButtonManager();
  channelSelectMenus = new ChannelSelectMenuManager();
  commands = new CommandManager();
  environments = new EnvironmentManager();
  items = new ItemManager();
  letters = new LetterManager();
  mentionableSelectMenus = new MentionableSelectMenuManager();
  modals = new ModalManager();
  quests = new ModalManager();
  roleSelectMenus = new RoleSelectMenuManager();
  statusEffects = new StatusEffectManager();
  stringSelectMenus = new StringSelectMenuManager();
  userSelectMenus = new UserSelectMenuManager();

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

    this.emit("tick", this.currentTime);
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
        activities: [
          {
            name: "Aeonix",
            type: ActivityType.Custom,
            state: "Initializing...",
          },
        ],
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

    cliManager(this);

    const mdbToken = process.env.MONGODB_URI;
    const dscToken = process.env.DISCORD_TOKEN;

    (async () => {
      try {
        if (!dscToken || !mdbToken) {
          log({
            header: "Missing token(s)",
            processName: "AeonixConstructor",
            type: "Fatal",
            payload: { discordToken: dscToken, mongodbToken: mdbToken },
          });
          return;
        }

        eventManager(this).then(() => {
          log({
            header: "Event handler ready to rumble!",
            processName: "EventHandler",
            type: "Info",
          });
        });

        await Promise.all([
          mongoose.connect(mdbToken),
          this.login(dscToken),
        ]).then(([db]) => {
          log({
            header: "Connected to external services",
            processName: "NetworkingHandler",
            type: "Info",
          });
          this.db = db;
          process.on("SIGINT", () => {
            mongoose.connection.close();
          });
        });

        makeAllCaches(this).then((newAeonix) => {
          log({
            header: "All caches made",
            processName: "AeonixConstructor",
            type: "Info",
          });
        });
      } catch (e) {
        log({
          header: "Error whilst creating Aeonix object",
          processName: "ErrorSuppressant",
          payload: e,
          type: "Fatal",
        });
        this.exit(1);
      }
    })();

    setInterval(() => {
      this.statusRefresh();
      this.tick();
    }, 60 * 1000);
  }

  override on<Event extends keyof AeonixEvents>(
    event: Event,
    listener: (...args: AeonixEvents[Event]) => void
  ): this;
  override on(event: string, listener: (...args: any[]) => void): this {
    super.on(event, listener);
    return this;
  }

  override once<Event extends keyof AeonixEvents>(
    event: Event,
    listener: (...args: AeonixEvents[Event]) => void
  ): this;
  override once(event: string, listener: (...args: any[]) => void): this {
    super.once(event, listener);
    return this;
  }

  override emit<Event extends keyof AeonixEvents>(
    event: Event,
    ...args: AeonixEvents[Event]
  ): boolean;
  override emit(event: string, ...args: any[]): boolean {
    return super.emit(event, ...args);
  }

  override off<Event extends keyof AeonixEvents>(
    event: Event,
    listener: (...args: AeonixEvents[Event]) => void
  ): this;
  override off(event: string, listener: (...args: any[]) => void): this {
    super.off(event, listener);
    return this;
  }

  override removeAllListeners<Event extends keyof AeonixEvents>(
    event?: Event
  ): this;
  override removeAllListeners(event?: string): this {
    super.removeAllListeners(event);
    return this;
  }
}

async function makeAllCaches(o: Aeonix) {
  await Promise.all([
    o.buttons.loadAll(),
    o.channelSelectMenus.loadAll(),
    o.commands.loadAll(),
    o.environments.loadAll(),
    o.items.loadAll(),
    o.letters.loadAll(),
    o.mentionableSelectMenus.loadAll(),
    o.modals.loadAll(),
    o.quests.loadAll(),
    o.roleSelectMenus.loadAll(),
    o.statusEffects.loadAll(),
    o.stringSelectMenus.loadAll(),
    o.userSelectMenus.loadAll(),
  ]);

  return o;
}
