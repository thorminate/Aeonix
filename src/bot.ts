/**
 * This file is the main entrypoint for the shards.
 * It defines the bot and connects it to the Discord and MongoDB.
 * @param {Client} bot
 * @param {string} token
 */
import { Client, IntentsBitField, Partials } from "discord.js"; // Get the discord.js library.
import mongoose from "mongoose"; // Get the mongoose library.
import eventHandler from "./handlers/eventHandler.js"; // Get the event handler.
import log from "./utils/log.js";
import { config } from "dotenv";
config();

// Define 'bot'
export const bot = new Client({
  // Create the bot.
  intents: [
    // With all the intents.
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildModeration,
    IntentsBitField.Flags.GuildEmojisAndStickers,
    IntentsBitField.Flags.GuildIntegrations,
    IntentsBitField.Flags.GuildWebhooks,
    IntentsBitField.Flags.GuildInvites,
    IntentsBitField.Flags.GuildVoiceStates,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.GuildMessageTyping,
    IntentsBitField.Flags.DirectMessages,
    IntentsBitField.Flags.DirectMessageReactions,
    IntentsBitField.Flags.DirectMessageTyping,
    IntentsBitField.Flags.GuildScheduledEvents,
    IntentsBitField.Flags.AutoModerationConfiguration,
    IntentsBitField.Flags.AutoModerationExecution,
    IntentsBitField.Flags.GuildMessagePolls,
    IntentsBitField.Flags.DirectMessagePolls,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
    IntentsBitField.Flags.GuildPresences,
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

const MongoDBToken = process.env.MONGODB_URI; // Get the MongoDB token and concatenate it with 'the_system'.
const DiscordToken = process.env.TOKEN; // Get the Discord token.
// Connect to DB and Discord.
(async () => {
  // Connect to MongoDB and Discord asynchronously.
  try {
    log({
      header: "Beginning bot setup",
      type: "Info",
    });

    log({
      header: "Connecting to DB...",
      type: "Info",
    }); // Log that we are attempting to connect to the DB.
    await mongoose.connect(MongoDBToken);
    log({
      header: "Connected to DB",
      type: "Info",
    }); // Connect to the DB. When the connection is successful, log that it was successful.

    process.on("SIGINT", () => {
      // When the bot is shut down, close the connection to the DB.
      mongoose.connection.close();
    });

    log({
      header: "Initializing event handler...",
      type: "Info",
    }); // Log that we are setting up the events.
    await eventHandler(bot); // Set up the events.
    log({
      header: "Events ready",
      type: "Info",
    });

    log({
      header: "Connecting to Discord...",
      type: "Info",
    }); // Log that we are connecting to Discord.
    await bot.login(DiscordToken);
    log({
      header: "Connected to Discord",
      type: "Info",
    }); // Connect to Discord. When the connection is successful, log that it was successful.
  } catch (error) {
    log({
      header: "Index error",
      payload: `${error}`,
      type: "Error",
    });
  }
})();
