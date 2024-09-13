"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Define Requirements
const discord_js_1 = require("discord.js");
const discord_js_rate_limiter_1 = require("discord.js-rate-limiter");
const mongoose_1 = __importDefault(require("mongoose"));
const eventHandler_1 = __importDefault(require("./handlers/eventHandler"));
// Define 'bot'
const bot = new discord_js_1.Client({
    intents: [
        discord_js_1.IntentsBitField.Flags.Guilds,
        discord_js_1.IntentsBitField.Flags.GuildModeration,
        discord_js_1.IntentsBitField.Flags.GuildEmojisAndStickers,
        discord_js_1.IntentsBitField.Flags.GuildIntegrations,
        discord_js_1.IntentsBitField.Flags.GuildWebhooks,
        discord_js_1.IntentsBitField.Flags.GuildInvites,
        discord_js_1.IntentsBitField.Flags.GuildVoiceStates,
        discord_js_1.IntentsBitField.Flags.GuildMessageReactions,
        discord_js_1.IntentsBitField.Flags.GuildMessageTyping,
        discord_js_1.IntentsBitField.Flags.DirectMessages,
        discord_js_1.IntentsBitField.Flags.DirectMessageReactions,
        discord_js_1.IntentsBitField.Flags.DirectMessageTyping,
        discord_js_1.IntentsBitField.Flags.GuildScheduledEvents,
        discord_js_1.IntentsBitField.Flags.AutoModerationConfiguration,
        discord_js_1.IntentsBitField.Flags.AutoModerationExecution,
        discord_js_1.IntentsBitField.Flags.GuildMessagePolls,
        discord_js_1.IntentsBitField.Flags.DirectMessagePolls,
        discord_js_1.IntentsBitField.Flags.GuildMembers,
        discord_js_1.IntentsBitField.Flags.GuildMessages,
        discord_js_1.IntentsBitField.Flags.MessageContent,
        discord_js_1.IntentsBitField.Flags.GuildPresences,
    ],
});
// Define 'RateLimiter'
const limiter = new discord_js_rate_limiter_1.RateLimiter(1, 1000);
const MongoDBToken = process.env.MONGODB_URI + "/the_system";
const DiscordToken = process.env.TOKEN;
// Connect to DB and Discord.
(async () => {
    try {
        console.log("Attempting to connect to DB...");
        await mongoose_1.default.connect(MongoDBToken).then(() => console.log("OK"));
        console.log("Setting up events...");
        (0, eventHandler_1.default)(bot);
        console.log("OK");
        console.log("Connecting to Discord...");
        await bot.login(DiscordToken).then(() => console.log("OK"));
    }
    catch (error) {
        console.log(`Index Error: ${error}`);
    }
})();
