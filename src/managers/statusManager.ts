import { ActivityType } from "discord.js";
import log from "../utils/log.js";
import BaseManager from "../models/managers/baseManager.js";

export default class StatusManager extends BaseManager {
  verbs: string[] = [
    "Learning about",
    "Exploring",
    "Playing with",
    "Reading about",
    "Watching tutorials on",
    "Studying",
    "Discovering",
    "Researching",
    "Delving into",
    "Investigating",
  ];
  nouns: string[] = [
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

  refresh() {
    if (!this.aeonix) {
      log({
        header: "Aeonix is not initialized yet, cannot refresh status",
        processName: "StatusManager.refresh",
        type: "Warn",
      });
      return;
    }

    const randomChoice =
      this.verbs[Math.floor(Math.random() * (this.verbs?.length ?? 0))] +
      " " +
      this.nouns[Math.floor(Math.random() * (this.nouns?.length ?? 0))];
    if (this.aeonix.user) {
      this.aeonix.user.setPresence({
        status: "online",
        afk: false,
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
}
