import fs from "node:fs";

try {
  fs.rm("./dist", { recursive: true, force: true }, () => {});
} catch (error) {
  if (error.code !== "ENOENT") {
    throw error;
  }
}
