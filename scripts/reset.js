import fs from "node:fs";

try {
  fs.rm("./dist", { recursive: true, force: true }, () => {});
} catch (e) {
  if (e.code !== "ENOENT") {
    throw e;
  }
}
