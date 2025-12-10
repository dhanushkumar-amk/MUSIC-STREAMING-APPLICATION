import fs from "fs";
import path from "path";

const logDirectory = "/var/log/spotify";
const logFile = path.join(logDirectory, "backend.log");

// Ensure directory exists
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

export const log = (message) => {
  const time = new Date().toISOString();
  fs.appendFileSync(logFile, `${time} - ${message}\n`);
};
