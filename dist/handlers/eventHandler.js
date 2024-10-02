"use strict";
// when an event is triggered, it runs all files in that event's folder
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path")); // Get the path library.
const getAllFiles_1 = __importDefault(require("../utils/getAllFiles")); // Get the getAllFiles function.
const url_1 = __importDefault(require("url"));
exports.default = (bot) => {
    // Export the function.
    const eventFolders = (0, getAllFiles_1.default)(path_1.default.join(__dirname, "..", "events"), true); // Get the event folders.
    for (const eventFolder of eventFolders) {
        // Loop through the event folders.
        const eventFiles = (0, getAllFiles_1.default)(eventFolder); // Get the event files.
        eventFiles.sort((a, b) => a.localeCompare(b)); // Sort the event files.
        const eventName = eventFolder.replace(/\\/g, "/").split("/").pop(); // Get the event name.
        bot.on(eventName, async (arg) => {
            // When the event that is the same name as the event folder is triggered.
            for (const eventFile of eventFiles) {
                // Loop through the event files.
                const filePath = path_1.default.resolve(eventFile); // Get the path to the event file.
                const fileUrl = url_1.default.pathToFileURL(filePath); // Get the URL to the event file.
                const eventFunction = await import(fileUrl.toString()); // Get the event function.
                eventFunction.default.default(bot, arg); // Run the event function. (no idea why the extra default is needed)
            }
        });
    }
};
