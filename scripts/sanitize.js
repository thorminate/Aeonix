const process = require("node:child_process");
const fs = require("node:fs");
try {
  fs.rmSync("./dist", { recursive: true });
} catch (error) {
  if (error.code !== "ENOENT") {
    throw error;
  }
}
