import {
  ActivityType,
  Client,
  ClientEvents,
  GatewayIntentBits,
  Partials,
} from "discord.js";
import readline from "readline/promises";
import Logger from "./utils/log.js";
import mongoose from "mongoose";
import { readFileSync } from "fs";
import eventManager from "./handlers/eventHandler.js";
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
import StatusManager from "./managers/statusManager.js";
import PlayerManager from "./managers/playerManager.js";
import QuestManager from "./managers/questManager.js";
import { IPackageJson } from "package-json-type";
import AeonixCLI from "./models/cli/cli.js";
import config from "./config.js";
import RaceManager from "./managers/raceManager.js";

export type AeonixEvents = ClientEvents & {
  tick: [
    currentTime: number,
    currentDay: number,
    currentMonth: number,
    currentYear: number
  ];
};

export default class Aeonix extends Client {
  rl: readline.Interface;
  db = mongoose;

  private _currentTime = 1;
  private _currentDay = 1;
  private _currentMonth = 1;
  private _currentYear = 1;

  playerRoleId: string = "";
  guildId: string = "";
  onboardingChannelId: string = "";
  rulesChannelId: string = "";
  masterRoleId: string = "";
  packageJson: IPackageJson = JSON.parse(
    readFileSync("./package.json").toString()
  );

  ticker!: NodeJS.Timeout;

  players = new PlayerManager(this);
  buttons = new ButtonManager(this);
  channelSelectMenus = new ChannelSelectMenuManager(this);
  commands = new CommandManager(this);
  environments = new EnvironmentManager(this);
  items = new ItemManager(this);
  letters = new LetterManager(this);
  mentionableSelectMenus = new MentionableSelectMenuManager(this);
  modals = new ModalManager(this);
  quests = new QuestManager(this);
  races = new RaceManager(this);
  roleSelectMenus = new RoleSelectMenuManager(this);
  statusEffects = new StatusEffectManager(this);
  stringSelectMenus = new StringSelectMenuManager(this);
  userSelectMenus = new UserSelectMenuManager(this);
  status = new StatusManager(this);
  cli = new AeonixCLI(this);
  config = config;

  logger: Logger;

  get currentTime() {
    const now = this._currentTime;

    if (now <= 0 || now > 24) {
      this.logger.error(
        "Aeonix.currentTime",
        "Invalid current time, resetting to 1",
        { currentTime: now }
      );
      this._currentTime = 1; // Reset to 1 if the time is invalid
      return 1; // Default to 1 if the time is invalid
    }

    return now;
  }

  tick() {
    this._currentTime += 1;
    if (this._currentTime > 24) {
      this._currentTime = 1;
      this._currentDay += 1;
      if (this._currentDay > 30) {
        this._currentDay = 1;
        this._currentMonth += 1;
        if (this._currentMonth > 12) {
          this._currentMonth = 1;
          this._currentYear += 1;
        }
      }
    }

    this.emit(
      "tick",
      this.currentTime,
      this._currentDay,
      this._currentMonth,
      this._currentYear
    );
  }

  async exit(code: number = 0) {
    this.logger.setShouldReprompt(false);
    try {
      await this.fullSave();
      if (this.user) {
        this.user.setPresence({ status: "invisible" });
      }
      await this.destroy();
      process.exit(code); // Exit with the provided code
    } catch (e) {
      this.logger.error("Process", "Failed to shutdown", e);
      process.exit(1); // Exit with error code
    }
  }

  reloadEnvironmentVars() {
    this.playerRoleId = process.env.PLAYER_ROLE || "";
    this.guildId = process.env.GUILD_ID || "";
    this.onboardingChannelId = process.env.ONBOARDING_CHANNEL || "";
    this.rulesChannelId = process.env.RULES_CHANNEL || "";
    this.masterRoleId = process.env.MASTER_ROLE || "";
  }

  async savePlayers() {
    const allPlayers = await this.players.getAll(false);

    for (const player of allPlayers) {
      const diff = Date.now() - player.lastAccessed!;

      // if the player has not been accessed within the alloted tick rate, unload the player from the cache
      if (diff > this.config.tickRate) {
        await player.commit(false);
        this.players.release(player._id);
      } else {
        await player.commit();
      }
    }
  }

  async saveEnvironments() {
    const allEnvironments = await this.environments.getAll(false);

    for (const environment of allEnvironments) {
      const diff = Date.now() - environment.lastAccessed!;

      // if the environment has not been accessed within the alloted tick rate, unload the environment from the cache
      if (diff > this.config.tickRate) {
        await environment.commit(false);
        this.environments.release(environment._id);
      } else {
        await environment.commit();
      }
    }
  }

  async fullSave() {
    await this.savePlayers();
    await this.saveEnvironments();
  }

  async makeAllCaches(o: Aeonix, shouldInitCLI = false, shouldClear = false) {
    if (shouldClear) {
      const clearCLI = () => {
        o.cli.cache.clear();
        o.rl.removeAllListeners("line");
      };

      o.buttons.empty();
      o.channelSelectMenus.empty();
      o.commands.empty();
      o.environments.empty();
      o.items.empty();
      o.letters.empty();
      o.mentionableSelectMenus.empty();
      o.modals.empty();
      o.players.empty();
      o.quests.empty();
      o.races.empty();
      o.roleSelectMenus.empty();
      o.statusEffects.empty();
      o.stringSelectMenus.empty();
      o.userSelectMenus.empty();

      if (shouldInitCLI) clearCLI();
    }

    await Promise.all([
      o.buttons.loadAll(),
      o.channelSelectMenus.loadAll(),
      o.commands.loadAll(),
      o.environments.loadAll(),
      o.items.loadAll(),
      o.letters.loadAll(),
      o.mentionableSelectMenus.loadAll(),
      o.modals.loadAll(),
      o.players.markReady(),
      o.quests.loadAll(),
      o.races.loadAll(),
      o.roleSelectMenus.loadAll(),
      o.statusEffects.loadAll(),
      o.stringSelectMenus.loadAll(),
      o.userSelectMenus.loadAll(),
      shouldInitCLI ? o.cli.init() : null,
    ]);

    this.logger.info("CacheOrchestrator", "All caches made");

    return o;
  }

  reloadTicker(rate: number) {
    if (this.ticker) clearInterval(this.ticker);
    this.ticker = setInterval(() => {
      this.status.refresh();
      this.tick();
    }, rate);
  }

  async refreshCaches() {
    await this.makeAllCaches(this, true, true);
  }

  constructor(rl: readline.Interface, logger: Logger) {
    const log = logger.for("AeonixConstructor");

    log.info("Starting boot-up sequence...");

    const statusMgr: StatusManager | null = new StatusManager();

    super({
      presence: {
        status: "online",
        afk: false,
        activities: [
          {
            name: "Aeonix",
            type: ActivityType.Custom,
            state:
              statusMgr.verbs[
                Math.floor(Math.random() * (statusMgr.verbs?.length ?? 0))
              ] +
              " " +
              statusMgr.nouns[
                Math.floor(Math.random() * (statusMgr.nouns.length ?? 0))
              ],
          },
        ],
      },
      intents: [
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

    this.logger = logger;
    this.config = config;
    this.rl = rl;

    this.reloadEnvironmentVars();

    const mdbToken = process.env.MONGODB_URI;
    const dscToken = process.env.DISCORD_TOKEN;

    (async () => {
      try {
        if (!dscToken || !mdbToken) {
          log.fatal("Missing token(s)", {
            discordToken: dscToken,
            mongodbToken: mdbToken,
          });
          return;
        }

        await this.cli.init();

        await eventManager(this).then(() => {
          this.logger.info("EventDistributor", "Event handler initialized.");
        });

        await Promise.all([
          mongoose.connect(mdbToken),
          this.login(dscToken),
        ]).then(([db]) => {
          this.logger.info(
            "NetworkingHandler",
            "Established connection to external services."
          );
          this.db = db;
          process.on("SIGINT", () => {
            mongoose.connection.close();
          });
        });

        await this.makeAllCaches(this);
      } catch (e) {
        log.fatal("Failed to start Aeonix", e);
        this.exit(1);
      }
    })();

    this.reloadTicker(this.config.tickRate);
  }

  override on<Event extends keyof AeonixEvents>(
    event: Event,
    listener: (...args: AeonixEvents[Event]) => void
  ): this {
    super.on(event as string, listener);
    return this;
  }

  override once<Event extends keyof AeonixEvents>(
    event: Event,
    listener: (...args: AeonixEvents[Event]) => void
  ): this {
    super.once(event as string, listener);
    return this;
  }

  override emit<Event extends keyof AeonixEvents>(
    event: Event,
    ...args: AeonixEvents[Event]
  ): boolean {
    return super.emit(event as string, ...args);
  }

  override off<Event extends keyof AeonixEvents>(
    event: Event,
    listener: (...args: AeonixEvents[Event]) => void
  ): this {
    super.off(event as string, listener);
    return this;
  }

  override removeAllListeners<Event extends keyof AeonixEvents>(
    event?: Event
  ): this {
    super.removeAllListeners(event as string);
    return this;
  }
}
