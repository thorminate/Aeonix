import { rmSync } from "node:fs";
try {
  rmSync("./dist", { recursive: true });
} catch (error) {
  if (error.code !== "ENOENT") {
    throw error;
  }
}
