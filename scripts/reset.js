import cp from "node:child_process";
import fs from "node:fs";

try {
  fs.rm("./dist", { recursive: true }, () => {
    fs.rm("./logs", { recursive: true }, () => {
      fs.rm(
        "./package-lock.json",
        {
          recursive: true,
        },
        () => {
          cp.exec("npm cache clean --force", { stdio: "inherit" });
        }
      );
    });
  });
} catch (error) {
  if (error.code !== "ENOENT") {
    throw error;
  }
}
