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
import { tickPlayers } from "./events/tick/tickPlayers.js";
import AeonixCLI from "./models/core/cli.js";

export type AeonixEvents = ClientEvents & {
  tick: [
    currentTime: number,
    currentDay: number,
    currentMonth: number,
    currentYear: number
  ];
};

export interface AeonixConfig {
  tickRate: number;
  maxNotifications: number;
}
export default class Aeonix extends Client {
  rl: readline.Interface;
  db = mongoose;

  config: AeonixConfig;

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
  roleSelectMenus = new RoleSelectMenuManager(this);
  statusEffects = new StatusEffectManager(this);
  stringSelectMenus = new StringSelectMenuManager(this);
  userSelectMenus = new UserSelectMenuManager(this);
  status = new StatusManager(this);
  cli = new AeonixCLI(this);

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
    log({
      header: "Shutting down",
      processName: "Process",
      type: "Warn",
      doNotPrompt: true,
    });
    try {
      tickPlayers(this);
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

  reloadEnvironmentVars() {
    this.playerRoleId = process.env.PLAYER_ROLE || "";
    this.guildId = process.env.GUILD_ID || "";
    this.onboardingChannelId = process.env.ONBOARDING_CHANNEL || "";
    this.rulesChannelId = process.env.RULES_CHANNEL || "";
    this.masterRoleId = process.env.MASTER_ROLE || "";
  }

  constructor(rl: readline.Interface, config: AeonixConfig) {
    log({
      header: "Starting boot-up sequence",
      processName: "AeonixConstructor",
      type: "Info",
    });

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

    this.config = config;
    this.rl = rl;

    this.reloadEnvironmentVars();

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

        await this.cli.init();

        await eventManager(this).then(() => {
          log({
            header: "Event handler initialized.",
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

        await makeAllCaches(this);
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
      this.status.refresh();
      this.tick();
    }, this.config.tickRate);
  }

  override on<Event extends keyof AeonixEvents>(
    event: Event,
    listener: (...args: AeonixEvents[Event]) => void
  ): this;
  override on(event: string, listener: (...args: unknown[]) => void): this {
    super.on(event, listener);
    return this;
  }

  override once<Event extends keyof AeonixEvents>(
    event: Event,
    listener: (...args: AeonixEvents[Event]) => void
  ): this;
  override once(event: string, listener: (...args: unknown[]) => void): this {
    super.once(event, listener);
    return this;
  }

  override emit<Event extends keyof AeonixEvents>(
    event: Event,
    ...args: AeonixEvents[Event]
  ): boolean;
  override emit(event: string, ...args: unknown[]): boolean {
    return super.emit(event, ...args);
  }

  override off<Event extends keyof AeonixEvents>(
    event: Event,
    listener: (...args: AeonixEvents[Event]) => void
  ): this;
  override off(event: string, listener: (...args: unknown[]) => void): this {
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
    o.players.markReady(),
    o.quests.loadAll(),
    o.roleSelectMenus.loadAll(),
    o.statusEffects.loadAll(),
    o.stringSelectMenus.loadAll(),
    o.userSelectMenus.loadAll(),
  ]);

  log({
    header: "All caches made",
    processName: "CacheOrchestrator",
    type: "Info",
  });

  return o;
}
