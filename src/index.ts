#!/usr/bin/env node

import log from "./utils/log.js";
import readline from "readline/promises";
import { appendFileSync, existsSync, writeFileSync } from "fs";
import { config } from "@dotenvx/dotenvx";
import { magenta, green } from "ansis";
import Aeonix from "./aeonix.js";

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
const dotenvx = config({
  quiet: true,
});

log({
  header: `Injecting env (${
    Object.keys(dotenvx.parsed ?? {}).length
  }) from .env`,
  processName: "Dotenvx",
  type: "Info",
});

const aeonix = new Aeonix(rl);

export default aeonix;

//TODO:
// 1. DONE.
// 2. convert all paginator V1 instances to use paginator V2.
// 3. DONE.
