import { ActivityType, Client, GatewayIntentBits, Partials } from "discord.js";
import mongoose from "mongoose";
import eventHandler from "./handlers/eventHandler.js";
import log from "./utils/log.js";
import readline from "readline/promises";
import { appendFileSync, existsSync, writeFileSync } from "fs";
import { config } from "@dotenvx/dotenvx";
import { green, magenta } from "ansis";

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
config();

// Define Aeonix
export class Aeonix extends Client {
  rl: readline.Interface;
  logger: typeof log;

  constructor() {
    // Initialise variables

    const activities = [
      "Reading through the archives",
      "Manipulating physical forces",
      "Predicting the future",
      "Exploring virtual realms",
      "Solving complex puzzles",
      "Composing symphonies",
      "Crafting digital art",
      "Engaging in strategic battles",
      "Hosting trivia challenges",
      "Developing new algorithms",
      "Analyzing data patterns",
      "Training neural networks",
      "Simulating quantum physics",
      "Navigating through codebases",
      "Designing architectural models",
      "Experimenting with chemistry formulas",
      "Writing interactive fiction",
      "Conducting virtual experiments",
      "Building mechanical prototypes",
      "Investigating historical mysteries",
      "Planning space missions",
      "Creating culinary recipes",
      "Learning new languages",
      "Practicing martial arts",
      "Sketching futuristic designs",
      "Meditating in digital gardens",
      "Organizing virtual events",
      "Reviewing scientific journals",
      "Participating in hackathons",
      "Exploring ancient civilizations",
      "Curating music playlists",
      "Studying celestial phenomena",
      "Simulating economic models",
      "Crafting immersive narratives",
      "Developing mobile applications",
      "Analyzing genetic sequences",
      "Planning urban developments",
      "Researching cybersecurity trends",
      "Designing user interfaces",
      "Exploring philosophical concepts",
      "Experimenting with soundscapes",
      "Building virtual communities",
      "Investigating paranormal activities",
      "Learning sign language",
      "Practicing calligraphy",
      "Exploring deep-sea mysteries",
      "Training for marathons",
      "Studying behavioral psychology",
      "Developing board games",
      "Exploring renewable energy solutions",
      "Crafting leather goods",
      "Learning about cryptocurrency",
      "Practicing yoga poses",
      "Studying architectural history",
      "Exploring virtual reality worlds",
      "Learning to play instruments",
      "Practicing photography skills",
      "Studying marine biology",
      "Exploring artificial intelligence",
      "Learning about blockchain technology",
      "Practicing public speaking",
      "Studying environmental science",
      "Exploring space technologies",
      "Learning about robotics",
      "Practicing graphic design",
      "Studying human anatomy",
      "Exploring cultural anthropology",
      "Learning about quantum computing",
      "Practicing animation techniques",
      "Studying political science",
      "Exploring ancient mythologies",
      "Learning about astronomy",
      "Practicing woodworking skills",
      "Studying meteorology",
      "Exploring virtual economies",
      "Learning about nanotechnology",
      "Practicing sculpture techniques",
      "Studying criminology",
      "Exploring digital marketing",
      "Learning about gastronomy",
      "Practicing dance routines",
      "Studying linguistics",
      "Exploring fashion design",
      "Learning about cinematography",
      "Practicing pottery making",
      "Studying sociology",
      "Exploring interior design",
      "Learning about archaeology",
      "Practicing metalworking skills",
      "Studying zoology",
      "Exploring landscape architecture",
      "Learning about mythology",
      "Practicing embroidery techniques",
      "Studying astronomy",
      "Exploring culinary arts",
      "Learning about paleontology",
      "Practicing glassblowing",
      "Studying economics",
      "Exploring urban planning",
      "Learning about ethnomusicology",
      "Practicing jewelry making",
      "Studying cartography",
      "Exploring industrial design",
      "Learning about viticulture",
      "Practicing bookbinding",
      "Studying psychology",
      "Exploring game theory",
      "Learning about oceanography",
      "Practicing knitting techniques",
      "Studying anthropology",
      "Exploring graphic novels",
      "Learning about ecology",
      "Practicing origami",
      "Studying philosophy",
      "Exploring digital photography",
      "Learning about meteorology",
      "Practicing quilting",
      "Studying art history",
      "Exploring sound engineering",
      "Learning about geology",
      "Practicing sewing techniques",
      "Studying literature",
      "Exploring animation",
      "Learning about botany",
      "Practicing candle making",
      "Studying theater arts",
      "Exploring photography",
      "Learning about chemistry",
      "Practicing soap making",
      "Studying film studies",
      "Exploring sculpture",
      "Learning about physics",
      "Practicing weaving",
      "Studying music theory",
      "Exploring ceramics",
      "Learning about astronomy",
      "Practicing leather crafting",
      "Studying dance",
      "Exploring painting techniques",
      "Learning about biology",
      "Practicing woodworking",
      "Studying creative writing",
      "Exploring textile arts",
      "Learning about mathematics",
      "Practicing metalworking",
      "Studying poetry",
      "Exploring printmaking",
      "Learning about environmental science",
      "Practicing glass art",
      "Studying journalism",
      "Exploring fashion illustration",
      "Learning about political science",
      "Practicing calligraphy",
      "Studying linguistics",
      "Exploring interior decoration",
      "Learning about sociology",
      "Practicing embroidery",
      "Studying cultural studies",
      "Exploring landscape painting",
      "Learning about anthropology",
      "Practicing pottery",
      "Studying communication",
      "Exploring graphic design",
      "Learning about psychology",
      "Practicing knitting",
      "Studying media studies",
      "Exploring digital art",
      "Learning about economics",
      "Practicing origami",
      "Studying education",
      "Exploring photography editing",
      "Learning about history",
      "Practicing quilting",
      "Studying philosophy",
      "Exploring video production",
      "Learning about geography",
      "Practicing sewing",
      "Studying art therapy",
      "Exploring animation techniques",
      "Learning about archaeology",
      "Practicing candle making",
      "Studying film production",
      "Exploring sculpture techniques",
      "Learning about theology",
      "Practicing soap making",
      "Studying music production",
      "Exploring ceramics techniques",
      "Learning about literature",
      "Practicing leatherworking",
      "Studying creative arts",
      "Exploring textile design",
      "Learning about cultural anthropology",
      "Practicing metal crafting",
      "Studying performing arts",
      "Exploring printmaking techniques",
      "Learning about environmental studies",
      "Practicing glassblowing techniques",
      "Studying communication arts",
      "Exploring fashion styling",
      "Learning about political theory",
      "Practicing bookbinding techniques",
      "Studying language arts",
      "Exploring interior architecture",
      "Learning about social sciences",
      "Practicing jewelry design",
      "Studying visual arts",
      "Exploring landscape design",
      "Learning about human geography",
      "Practicing woodworking techniques",
      "Studying art education",
      "Exploring digital media",
      "Learning about urban studies",
      "Practicing sculpture modeling",
      "Studying theater production",
      "Exploring multimedia arts",
      "Learning about public relations",
      "Practicing textile printing",
      "Studying",
    ];

    const mdbToken = process.env.MONGODB_URI;
    const dscToken = process.env.TOKEN;

    // Define the client
    super({
      presence: {
        status: "online",
        afk: false,
        activities: [
          {
            type: ActivityType.Custom,
            name: "Aeonix",
            state: activities[Math.floor(Math.random() * activities.length)],
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

    this.logger = log;
    // We already have an rl instance, so we don't need to create a new one.
    this.rl = rl;

    // Inject CLI
    this.rl.on("line", async (input: string) => {
      const inputArr: string[] = input.split(" ");
      const firstOptionIndex: number = inputArr.findIndex((arg) =>
        arg.includes("--")
      );

      // When a line is typed.
      switch (input.split(" ")[0]) {
        case "help":
          log({
            header: "Help Command",
            processName: "CLI",
            payload: [
              "'exit' to quit and turn off Aeonix",
              "\n'help' for help",
              "\n'log <header> [options]' options are --payload and --folder",
            ],
            type: "Info",
          });
          break;

        case "exit": // Exit aeonix.
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
            process.exit(0);
          } catch (error) {
            console.error("Error during shutdown:", error);
            process.exit(1); // Exit with error code
          }
          break;

        case "log": // Log the inputs
          if (firstOptionIndex === -1) {
            log({
              header: inputArr.slice(1).join(" "),
              processName: "CLI",
              type: "Info",
            });
            return;
          }
          let header: string = inputArr.slice(1, firstOptionIndex).join(" ");

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

        default: // Invalid command handling.
          log({
            header: "Invalid command: " + input,
            processName: "CLI",
            payload: ["'exit' to quit and turn off Aeonix, or 'help' for help"],
            type: "Warn",
          });
          break;
      }

      this.rl.prompt();
    });
    this.rl.prompt();

    try {
      log({
        header: "Initializing Aeonix...",
        processName: "AeonixConstructor",
        type: "Info",
      });

      if (!dscToken || !mdbToken) {
        throw new Error("Missing token(s)");
      }

      mongoose.connect(mdbToken).then(() => {
        log({
          header: "Linked to DB",
          processName: "AeonixConstructor",
          type: "Info",
        });

        process.on("SIGINT", () => {
          mongoose.connection.close();
        });
      });

      eventHandler(this).then(() => {
        log({
          header: "Event handler initialized",
          processName: "AeonixConstructor",
          type: "Info",
        });
      });

      this.login(dscToken).then(() => {
        log({
          header: "Connected to Discord",
          processName: "AeonixConstructor",
          type: "Info",
        });
      });

      setInterval(() => {
        const randomChoice =
          activities[Math.floor(Math.random() * activities.length)];
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
      }, 10 * 60 * 1000);
    } catch (e: any) {
      log({
        header: "Error whilst creating Aeonix object",
        processName: "AeonixConstructor",
        payload: e,
        type: "Fatal",
      });
    }
  }
}

// Export the Aeonix object
export default new Aeonix();
