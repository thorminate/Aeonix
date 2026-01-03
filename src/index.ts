#!/usr/bin/env node

import readline from "readline/promises";
import { appendFileSync, existsSync, writeFileSync } from "fs";
import { config as dotenv } from "@dotenvx/dotenvx";
import { magenta, green } from "ansis";
import Aeonix from "./aeonix.js";
import Logger from "./utils/log.js";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  history: ["exit"],
  historySize: 10,
  prompt: `${magenta("Aeonix")} ${green(">>")} `,
});

const logger = new Logger(rl);

// Make sure the .env file exists
if (!existsSync("./.env")) {
  const log = logger.for("AeonixSetupWizard");
  // If the .env file doesn't exist, we create it.

  log.warn(".env file not found, starting setup wizard...");

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

  log.info("Setup wizard complete!");
}

// Load environment variables
const dotenvx = dotenv({
  quiet: true,
});

logger.info(
  "Dotenvx",
  `Injecting env (${Object.keys(dotenvx.parsed ?? {}).length}) from .env`
);

const aeonix = new Aeonix(rl, logger);

export default aeonix;
